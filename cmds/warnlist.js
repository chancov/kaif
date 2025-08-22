const database = require('../databases.js');
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName, getRoleNamezov } = require('./roles.js');

const util = require('util');
const databaseQuery = util.promisify(database.query);

module.exports = {
  command: '/warnlist',
  description: 'Список пользователей с предупреждениями',
  async execute(context) {
    const { peerId } = context;
    const senderUserRole = await getUserRole(peerId, context.senderId);

    // Проверка наличия таблицы в базе данных
    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.send('❌ Беседа не зарегистрирована!');
    }
	
    if (senderUserRole < 20) {
      return context.reply('❌ Отказано, ваша роль слишком низкая для использования этой команды.');
    }

    const selectUsersInfoQuery = `
      SELECT user_id, warns
      FROM conference_${peerId}
      WHERE warns > 0
    `;
	
    try {
      const results = await databaseQuery(selectUsersInfoQuery);
      
      if (results.length === 0) {
        return context.reply('❌ Пользователи не имеют предупреждений.');
      }

      const userIds = results.map(nickInfo => nickInfo.user_id);
      const userInfos = await vk.api.users.get({ user_ids: userIds });

      const userMap = userInfos.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      const userList = await Promise.all(results.map(async (user, index) => {
        const userInfo = userMap[user.user_id];
        return `${index + 1}. [id${user.user_id}|${userInfo.first_name} ${userInfo.last_name}] - ${user.warns}/3\n`;
      }));

      const response = `📘 Список пользователей с предупреждениями:\n\n${userList.join('')}`;
      context.send(response);
    } catch (error) {
      console.error('Ошибка при запросе информации о пользователях:', error);
      context.send('❌ Произошла ошибка.');
    }
  },
};
