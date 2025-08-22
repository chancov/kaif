const database = require('../databases.js');
const { checkUserRole, getRoleName, checkIfTableExists } = require('./roles.js');

const { Keyboard } = require('vk-io')

module.exports = {
  command: '/ban',
  aliases: ['/бан'],
  description: 'Забанить пользователя',
  async execute(context) {
    const { peerId, senderId, text, replyMessage } = context;
    const senderUserRole = await checkUserRole(peerId, senderId);

    if (senderUserRole < 40) {
      return context.reply('❓ У вас недостаточно прав для использования этой команды!\n❓ Минимальная роль для использования команды: Администратор');
    }

    let target;
    let banDays;
    let reason;
	let numericId;
	
    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.send('❓ Беседа не активирована! Для активации беседы, введите /start');
    }
	
    if (replyMessage) {
      const parts = text.split(' ');
      target = replyMessage.senderId;
	  numericId = replyMessage.senderId
	  banDays = parseInt(parts[1]) || 999;
      reason = parts.slice(2).join(' ') || 'Без причины';
    } else {
      const parts = text.split(' ');
      target = parts[1];
	  numericId = await extractNumericId(parts[1])
      banDays = parseInt(parts[2]) || 999;
      reason = parts.slice(3).join(' ') || 'Без причины';
    }

    if (!target) {
      return context.reply(`❓ Аргументы введены неверно, необходимо ввести время блокировки в днях.\n❓ Пример: /ban @id1 30 test`);
    }

    const targetUserRole = await checkUserRole(peerId, numericId);

    if (senderUserRole <= targetUserRole) {
      return context.reply('❓ У вас недостаточно прав для блокировки данного пользователя!');
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
      FROM conference_${peerId}
      WHERE user_id = ?
    `;

    database.query(selectBlockedUsersQuery, [numericId], async (error, results) => {
      if (error) {
        console.error('Ошибка при выборке заблокированных пользователей:', error);
        return context.send('❌ Произошла ошибка при выборке заблокированных пользователей.');
      }

      const blockedUsers = results.length > 0 ? JSON.parse(results[0].blocked_users || '[]') : [];

      const existingBlockIndex = blockedUsers.findIndex(block => block.blocked_user_id === numericId);

      if (existingBlockIndex !== -1) {
        blockedUsers[existingBlockIndex] = blockInfo;
      } else {
        blockedUsers.push(blockInfo);
      }

      const updateBlockedUsersQuery = `
        INSERT INTO conference_${peerId} (user_id, blocked_users)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE blocked_users = VALUES(blocked_users)
      `;

      database.query(updateBlockedUsersQuery, [numericId, JSON.stringify(blockedUsers)], async (error, result) => {
        if (error) {
          console.error('Ошибка при обновлении заблокированных пользователей:', error);
          return context.send('❌ Произошла ошибка при обновлении заблокированных пользователей.');
        }
      const buttonPayload = {
        button: `${numericId}`,
        event_id: 6910,
      };

      const keyboard = Keyboard.builder()
        .callbackButton({
          label: '🔴 Снять блокировку',
          payload: JSON.stringify(buttonPayload),
          inline: true,
          color: Keyboard.PRIMARY_COLOR,
        })
        .inline();
      
      const blockUntilFormatted = blockUntil.toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' });
      context.reply({ message: `🚫 [id${numericId}|Пользователь] получил блокировку в чате до ${blockUntilFormatted}.\n❓ Причина: ${blockInfo.reason}`, keyboard: keyboard });

      const kickResult = await vk.api.messages.removeChatUser({
        chat_id: context.chatId,
        member_id: numericId,
      });
    });
  });
},
};
