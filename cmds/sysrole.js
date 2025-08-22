const database = require('../databases.js');
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName, getAgentInfo } = require('./roles.js');
const { getUserTech } = require('../util.js')	

module.exports = {
  command: '/sysrole',
  aliases: ['/сисироль', '/сусроле'],
  description: 'null',
  async execute(context) {
    let kaka = await getUserTech(context.senderId);
    if (kaka < 2) return;
	const messageText = context.text;
	const { peerId, senderId, replyMessage } = context;
	const conferenceId = peerId;
	const parts = messageText.split(' ');
	const userRole = await extractNumericId(parts[1])
	const roleNumber = parts[2]
	console.log(roleNumber)
	console.log(userRole)
    if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
      console.error('Таблица никнеймов не существует');
      console.log(`nicknames_${conferenceId}`);
      return context.send('❌ Ваша беседа не зарегистрирована!');
    }

    const validRoleNumbers = [0, 20, 40, 60, 80, 100];
    const roleNumberFix = parseInt(roleNumber);

    if (!validRoleNumbers.includes(roleNumberFix)) {
      return context.reply(
        '</> ❌ Неверно указана роль!\n>> Существующие роли: 0 - пользователь, 20 - модератор, 40 - администратор, 60 - спец. администратор, 80 - руководитель и 100 - владелец'
      );
    }

    const roles = {
      0: 'Участник',
      20: 'Модератор',
      40: 'Администратор',
      60: 'Спец Админ',
      80: 'Руководитель',
      100: 'Владелец',
    };

    const roleId = roles[roleNumberFix];

    if (roleNumberFix === 0) {
      // Удалить пользователя из базы данных
      const deleteUserQuery = `
        DELETE FROM roles_${conferenceId}
        WHERE user_id = ?
      `;

      database.query(deleteUserQuery, [userRole], async (error, result) => {
        if (error) {
          console.error('Ошибка при удалении пользователя:', error);
          return context.send('❌ Произошла ошибка при удалении пользователя.');
        }

        context.reply(`</> ✅️ Роль [id${userRole}|пользователя] принудительно изменена ➜ «${roleId}»`);
      });
    } else {
      // Изменить роль пользователя
      const insertRoleQuery = `
        INSERT INTO roles_${conferenceId} (user_id, role_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
      `;

      database.query(insertRoleQuery, [userRole, roleNumberFix], async (error, result) => {
        if (error) {
          console.error('Ошибка при добавлении роли:', error);
          return context.send('❌ Произошла ошибка при изменении роли.');
        }

        context.reply(`</> ✅️ Роль [id${userRole}|пользователя] принудительно изменена ➜ «${roleId}»`);
      });
    }
  },
};
