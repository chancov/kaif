const database = require('../databases.js');
const { checkUserRole, checkIfTableExists } = require('./roles.js');

module.exports = {
  command: '/getbynick',
  aliases: ['/getbynick'],
  description: 'Поиск пользователя по нику',
  async execute(context) {
    const messageText = context.text;
    const searchTerm = messageText.split(' ')[1];
    const hasPermission = await checkUserRole(context.peerId, context.senderId, 'модератор');

    if (!hasPermission) {
      context.reply('У вас нет прав на выполнение этой команды.');
      return;
    }
    if (!searchTerm) {
      context.reply('Укажите часть никнейма для поиска.');
      return;
    }

    const conferenceId = context.peerId;

    // Поиск никнеймов в базе данных
    const selectNicknamesQuery = `
      SELECT user_id, nickname FROM nicknames_${conferenceId} WHERE nickname LIKE ?
    `;

    const searchTermLike = `%${searchTerm}%`;

    database.query(selectNicknamesQuery, [searchTermLike], async (error, results) => {
      if (error) {
        console.error('Ошибка при поиске никнеймов:', error);
        return context.send('Произошла ошибка.');
      }

      const matchingUsers = await Promise.all(results.map(async (nickInfo) => {
        const username = await getlink(nickInfo.user_id); // Замените на вашу функцию
        return { userId: nickInfo.user_id, nickname: nickInfo.nickname, username };
      }));

      if (matchingUsers.length > 0) {
        const userList = matchingUsers.map((user, index) =>
          `${index + 1}. [id${user.userId}|${user.nickname}]`
        );

	  context.reply({ message: `⭐ Найдено ${matchingUsers.length} пользователей с указанным никнеймом:\n${userList.join('\n')}`, disable_mentions: true });
      } else {
        context.reply('Пользователи с указанным никнеймом не найдены.');
      }
    });
  },
};
