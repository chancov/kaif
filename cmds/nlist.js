const database = require('../databases.js');
const { checkUserRole, checkIfTableExists } = require('../util.js');

module.exports = {
  command: '/nlist',
  aliases: ['/nlist'],
  description: 'Отображение списка никнеймов',
  async execute(context) {
    const conferenceId = context.peerId;

    if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
      console.error('Таблица никнеймов не существует');
      return context.send('Ваша беседа не зарегистрирована!');
    }

    const hasPermission = await checkUserRole(context.peerId, context.senderId, 'модератор');

    if (!hasPermission) {
      return;
    }

    const selectNicknamesQuery = `
      SELECT user_id, nickname FROM nicknames_${conferenceId}
    `;

    database.query(selectNicknamesQuery, async (error, results) => {
      if (error) {
        console.error('Ошибка при выводе списка никнеймов:', error);
        return context.send('Произошла ошибка при выполнении команды.');
      }

      if (results.length === 0) {
        return context.send('Список никнеймов пуст.');
      }

      const userIds = results.map(nickInfo => nickInfo.user_id);

      try {
        const userInfos = await vk.api.users.get({ user_ids: userIds });
		
		console.log(userInfos)
		
        const userMap = userInfos.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});

        let message = '📖 Список пользователей с никами:\n\n';
        let index = 1;

        for (const nickInfo of results) {
          const userInfo = userMap[nickInfo.user_id];
          if (userInfo) {
            message += `${index}. [id${userInfo.id}|${userInfo.first_name} ${userInfo.last_name}] - ${nickInfo.nickname}\n`;
            index++;
          }
        }

        context.send({ message: message, disable_mentions: true });
      } catch (error) {
        console.error('Ошибка при получении информации о пользователях:', error);
        return context.send('Произошла ошибка при выполнении команды.');
      }
    });
  },
};
