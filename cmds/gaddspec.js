const { getUserRole, checkIfTableExists, getRoleName, getpoolkey } = require('./roles.js');
const database = require('../databases.js'); // Подключаем базу данных
const util = require('util');
const databaseQuery = util.promisify(database.query);

module.exports = {
  command: '/gaddspec',
  aliases: ['/gaddspec'],
  description: 'Добавление роли Спец. Администратора пользователю',
  async execute(context) {
    const senderRoleId = await getUserRole(context.peerId, context.senderId);
    const { peerId, senderId, replyMessage } = context;
    const messageText = context.text;
    const parts = messageText.split(' ');
    const target = replyMessage ? replyMessage.senderId : parts[1];
	const userId = target || (replyMessage ? replyMessage.senderId : senderId);
    let label = await extractNumericId(userId);

    if (replyMessage) {
      label = replyMessage.senderId;
    }

    if (!(await checkIfTableExists(`roles_${context.peerId}`))) {
      return context.reply('❌ Таблица ролей не существует');
    }

    if (senderRoleId < 80) {
      return context.reply(`❌ У вас нет прав на выдачу роли Спец. Администратора`);
    }

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
          const roleId = 60; 
          const rolesTable = `roles_${poolPeerId}`;
		  
          const chelikroleid = await getUserRole(poolPeerId, label);

          if (senderRoleIdd < 80) {
            continue;
          }
		  
          if (senderRoleIdd <= chelikroleid) {
            continue;
          }
		  
		  if (chelikroleid >= roleId) {
		    continue;
		  }

          // Проверяем, есть ли пользователь с указанным target в беседе
		  const conversationMembers = await vk.api.messages.getConversationMembers({
		    peer_id: poolPeerId,
		  });

		  const targetProfile = conversationMembers.profiles.find(profile => profile.id === parseInt(label));
		  console.log(targetProfile)
          if (!targetProfile) {
            continue;
          }
          console.log(poolPeerId);

          const insertRoleQuery = `
            INSERT INTO ${rolesTable} (user_id, role_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
          `;

          database.query(insertRoleQuery, [label, roleId], async (error, result) => {
            if (error) {
              console.error('Ошибка при добавлении роли:', error);
              return context.send('❌ Произошла ошибка.');
            }

            let currentUserRole = await getRoleName(chelikroleid);

          });
        }
        context.reply(`✅️ [id${label}|Пользователь] успешно получил роль «Спец. Администратор»\n❓ Прошлая роль: «${currentUserRole}»`);
      }
    } catch (error) {
      console.error('Ошибка при добавлении роли:', error);
      return context.send('❌ Произошла ошибка.');
    }
  }
};
