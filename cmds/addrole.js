const database = require('../databases.js');
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName } = require('./roles.js');

module.exports = {
  command: '/role',
  aliases: ['/role'],
  description: 'Добавление роли пользователю',
  async execute(context) {
    const messageText = context.text;
    const { peerId, senderId, replyMessage } = context;
    const conferenceId = peerId;
    const parts = messageText.split(' ');

    if (context.replyMessage) {
      const target = context.replyMessage.senderId;
      const userId = context.replyMessage.senderId;
      const role = parts.slice(1).join(' ');

      const senderUserRole = await getUserRole(conferenceId, senderId);
      const userToModifyRole = await getUserRole(conferenceId, userId);

      if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
        console.error('Таблица никнеймов не существует');
        console.log(`nicknames_${conferenceId}`);
        return context.send('❌ Ваша беседа не зарегистрирована!');
      }

      if (senderUserRole < 40) {
        return context.reply(`❌ У вас нет прав на выдачу ролей`);
      }

      if (!role) {
        console.log(useid, role)
        return context.reply('❌ Недостаточно аргументов');
      }

      console.log(senderUserRole)

      if (role >= senderUserRole) {
        return context.reply('❌ Вы не можете выдавать роль, которая равна или выше вашей.');
      }

      if (eval(userId - senderId) === 0) {
        return context.reply('❌ Вы не можете выдавать роль самому себе.');
      } else {
        console.log(userId, senderId)
      }

      const hasPermission = await checkUserRole(context.peerId, context.senderId);

      if (hasPermission < 0) {
        return context.reply(`❌ У вас нет прав на выполнение этой команды.`);
      }

      const roleNumber = parseInt(role);

      if (parts.length < 1) {
        return context.reply('❌ Использование: /role [роль]');
      }

      if (isNaN(roleNumber) || roleNumber < 20 || roleNumber > 100) {
        const explanation = `❌ Выберите роль. Список ролей:
        20 - Модератор
        40 - Администратор
        60 - Спец Админ
        80 - Руководитель
        100 - Владелец`;
        return context.reply(explanation);
      }

      const roles = {
        20: 'Модератор',
        40: 'Администратор',
        60: 'Спец Админ',
        80: 'Руководитель',
        100: 'Владелец',
      };

      const roleId = roles[roleNumber];

      const rolesTableQuery = `
        CREATE TABLE IF NOT EXISTS roles_${conferenceId} (
          user_id INT PRIMARY KEY,
          role_id INT
        )
      `;

      database.query(rolesTableQuery, async (error) => {
        if (error) {
          console.error('Ошибка при создании таблицы ролей:', error);
          return context.send('❌ Произошла ошибка.');
        }

        const insertRoleQuery = `
          INSERT INTO roles_${conferenceId} (user_id, role_id)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
        `;

        database.query(insertRoleQuery, [userId, roleNumber], async (error, result) => {
          if (error) {
            console.error('Ошибка при добавлении роли:', error);
            return context.send('❌ Произошла ошибка.');
          }

          const names = await getlink(userId);
          context.reply(`Вы изменили роль [id${userId}|этому участнику] на «${roleId}»`);
        });
      });
    } else {
      const target = parts[1];
      const userId = parts[1];
      const useid = parts.slice(1).join(' ');
      const role = parts.slice(2).join(' ');
      const userid = await extractNumericId(useid);

      const senderUserRole = await getUserRole(conferenceId, senderId);
      const userToModifyRole = await getUserRole(conferenceId, userId);

      if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
        console.error('Таблица никнеймов не существует');
        console.log(`nicknames_${conferenceId}`);
        return context.send('❌ Ваша беседа не зарегистрирована!');
      }

      if (senderUserRole < 40) {
        return context.reply(`❌ У вас нет прав на выдачу ролей`);
      }

      if (!userid) {
        console.log(useid, role)
        return context.reply('❌ Недостаточно аргументов');
      }

      console.log(senderUserRole)

      if (role >= senderUserRole) {
        return context.reply('❌ Вы не можете выдавать роль, которая равна или выше вашей.');
      }

      if (eval(userid - senderId) === 0) {
        return context.reply('❌ Вы не можете выдавать роль самому себе.');
      } else {
        console.log(userid, senderId)
      }

      const hasPermission = await checkUserRole(context.peerId, context.senderId);

      if (hasPermission < 0) {
        return context.reply(`❌ У вас нет прав на выполнение этой команды.`);
      }

      const roleNumber = parseInt(role);

      if (parts.length < 3) {
        return context.reply('❌ Использование: /role [ID пользователя] [роль]');
      }

      if (isNaN(roleNumber) || roleNumber < 20 || roleNumber > 100) {
        const explanation = `❌ Выберите роль. Список ролей:
        20 - Модератор
        40 - Администратор
        60 - Спец Админ
        80 - Руководитель
        100 - Владелец`;
        return context.reply(explanation);
      }

      const roles = {
        20: 'Модератор',
        40: 'Администратор',
        60: 'Спец Админ',
        80: 'Руководитель',
        100: 'Владелец',
      };

      const roleId = roles[roleNumber];

      const rolesTableQuery = `
        CREATE TABLE IF NOT EXISTS roles_${conferenceId} (
          user_id INT PRIMARY KEY,
          role_id INT
        )
      `;

      database.query(rolesTableQuery, async (error) => {
        if (error) {
          console.error('Ошибка при создании таблицы ролей:', error);
          return context.send('❌ Произошла ошибка.');
        }

        const insertRoleQuery = `
          INSERT INTO roles_${conferenceId} (user_id, role_id)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
        `;

        database.query(insertRoleQuery, [userid, roleNumber], async (error, result) => {
          if (error) {
            console.error('Ошибка при добавлении роли:', error);
            return context.send('❌ Произошла ошибка.');
          }

          const names = await getlink(userId);
          context.reply(`⭐ Роль [id${label}|пользователя] успешно изменена на «${roleId}»`);
        });
      });
    }
  },
};
