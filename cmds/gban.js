const database = require('../databases.js');
const { checkUserRole, getUserRole, checkIfTableExists } = require('./roles.js');
const util = require('util');
const databaseQuery = util.promisify(database.query);

module.exports = {
  command: '/gban',
  aliases: ['/гбан'],
  description: 'Забанить пользователя',
  async execute(context) {
    const { peerId, senderId, text, replyMessage } = context;
    const senderUserRole = await checkUserRole(peerId, senderId);

    if (senderUserRole < 40) {
      return context.reply('❌ У вас нет прав на использование этой команды.');
    }

    let target;
    let banDays;
    let reason;
    let numericId;

    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.reply('❌ Беседа не зарегистрирована!');
    }

    if (replyMessage) {
      const parts = text.split(' ');
      target = replyMessage.senderId;
      numericId = replyMessage.senderId;
      banDays = parseInt(parts[1]) || 999;
      reason = parts.slice(2).join(' ') || 'Без причины';
    } else {
      const parts = text.split(' ');
      target = parts[1];
      numericId = await extractNumericId(parts[1]); // Assuming you have a function to extract numeric ID
      banDays = parseInt(parts[2]) || 999;
      reason = parts.slice(3).join(' ') || 'Без причины';
    }

    if (!target) {
      return context.reply(`❌ Необходимо указать дни [От 1 до 31 дня (-1 для блокировки навсегда)].

Пример: /gban id1 31 Оскорбление.

Либо прикрепите сообщение пользователя, которого хотите заблокировать, укажите количество дней и причину: /ban 31 Оскорбление.`);
    }
	
    const targetUserRole = await checkUserRole(peerId, numericId);
    const selectPoolQuery = `
      SELECT *
      FROM pools
      WHERE pool_peerIds LIKE ?
    `;

    try {
      const selectResults = await databaseQuery(selectPoolQuery, [`%${peerId}%`]);
      if (selectResults.length === 0) {
        return context.reply('❌ Пулл не найден.');
      }

      for (const pool of selectResults) {
        const poolPeerIds = JSON.parse(pool.pool_peerIds || '[]');

        for (const poolPeerId of poolPeerIds) {
          const senderRoleIdd = await getUserRole(poolPeerId, context.senderId);

          if (!(await checkIfTableExists(`roles_${poolPeerId}`))) {
            continue;
          }

          const chelikroleid = await getUserRole(poolPeerId, numericId);

          if (senderRoleIdd <= chelikroleid) {
            continue;
          }

          const currentDate = new Date();
          const blockUntil = new Date(currentDate.getTime() + banDays * 24 * 60 * 60 * 1000);

          const blockInfo = {
            blocked_user_id: numericId,
            blocked_by: senderId,
            block_until: blockUntil,
            reason: reason,
          };

          const selectBlockedUsersQuery = `
            SELECT blocked_users
            FROM conference_${poolPeerId}
            WHERE user_id = ?
          `;

          const blockedUsersResult = await databaseQuery(selectBlockedUsersQuery, [numericId]);

          let blockedUsers = [];
          if (blockedUsersResult.length > 0) {
            blockedUsers = JSON.parse(blockedUsersResult[0].blocked_users || '[]');
          }
		  
          const existingBlockIndex = blockedUsers.findIndex(block => block.blocked_user_id === numericId);

          if (existingBlockIndex !== -1) {
            blockedUsers[existingBlockIndex] = blockInfo;
          } else {
            blockedUsers.push(blockInfo);
          }

          const updateBlockedUsersQuery = `
            INSERT INTO conference_${poolPeerId} (user_id, blocked_users)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE blocked_users = VALUES(blocked_users)
          `;

          await databaseQuery(updateBlockedUsersQuery, [numericId, JSON.stringify(blockedUsers)]);

          // Send a message to the chat about the ban
          const blockUntilFormatted = blockUntil.toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' });
          const message = `✅️ [id${numericId}|Пользователь] заблокирован в связке чатов до ${blockUntilFormatted}.\n❓ Причина: ${blockInfo.reason}`;
          await vk.api.messages.send({
            peer_id: poolPeerId,
            message: message,
            random_id: generateRandom32BitNumber(), // Assuming you have a function to generate a random ID
          });

          console.log(`User banned in chat ${poolPeerId}`);

          // Опциональный код: кикнуть пользователя из беседы
          const kickResult = await vk.api.messages.removeChatUser({
            chat_id: poolPeerId - 2000000000,
            member_id: numericId,
          });

          console.log(`Kick result: ${JSON.stringify(kickResult)}`);
        }
      }
    } catch (error) {
      console.error('Произошла ошибка:', error);
    }
  },
};
