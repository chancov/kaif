const { getUserRole, checkIfTableExists, getRoleName } = require('./roles.js');
const database = require('../databases.js'); // Подключите вашу базу данных

module.exports = {
  command: '/editowner',
  aliases: ['/editowner'],
  description: 'Добавление роли Владельца пользователю',
  async execute(context) {
    const { peerId, senderId, replyMessage, text } = context;
    const senderRoleId = await getUserRole(peerId, senderId);
    const parts = text.split(' ');
    const target = replyMessage ? replyMessage.senderId : parts[1];
    const userId = target || (replyMessage ? replyMessage.senderId : senderId);
    let label = await extractNumericId(userId);

    if (replyMessage) {
      label = replyMessage.senderId;
    }
	
    if (!label) {
      return context.reply('❌ Укажите пользователя для передачи прав владельца.');
    }
	
    if (!await checkIfTableExists(`roles_${peerId}`)) {
      return context.reply('❌ Таблица ролей не существует');
    }

    if (senderRoleId < 100) {
      return context.reply(`❌ Вы не являетесь владельцем чата!`);
    }

    // Получаем предыдущего владельца
    const prevOwnerQuery = `
      SELECT user_id
      FROM roles_${peerId}
      WHERE role_id = 100
    `;

    database.query(prevOwnerQuery, async (error, rows) => {
      if (error) {
        console.error('Ошибка при получении предыдущего владельца:', error);
        return context.send('❌ Произошла ошибка.');
      }

      if (rows.length > 0) {
        const prevOwnerId = rows[0].user_id;

        // Удаляем предыдущего владельца из базы данных
        const deletePrevOwnerQuery = `
          DELETE FROM roles_${peerId}
          WHERE user_id = ?
        `;

        database.query(deletePrevOwnerQuery, [prevOwnerId], async (error, result) => {
          if (error) {
            console.error('Ошибка при удалении предыдущего владельца:', error);
            return context.send('❌ Произошла ошибка.');
          }

          console.log(`Предыдущий владелец (ID ${prevOwnerId}) успешно удален из базы данных.`);
        });
      }
    });

    const chelikRoleId = await getUserRole(peerId, label);

    if (senderRoleId < chelikRoleId) {
      return context.reply('❌ Роль пользователя выше или равна вашей');
    }

    const roleId = 100;
    const rolesTable = `roles_${peerId}`;

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

      context.reply(`✅️ Права владельца беседы были успешно переданы [id${label}|пользователю]`);
    });
  }
};
