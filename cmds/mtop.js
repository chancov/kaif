const util = require('util');
const database = require('../databases.js');
const { getUserRole, checkIfTableExists } = require('./roles.js');

// Промисифицируем функцию database.query
const queryAsync = util.promisify(database.query).bind(database);

async function getUserName(userIds) {
  try {
    const users = await vk.api.users.get({
      user_ids: userIds.join(','),
    });

    const userMap = new Map(users.map(user => [user.id, `${user.first_name} ${user.last_name}`]));

    return userIds.map(userId => userMap.get(userId) || 'Имя Фамилия не найдены');
  } catch (error) {
    console.error('Ошибка при запросе имен пользователей:', error);
    return userIds.map(() => 'Произошла ошибка');
  }
}

module.exports = {
  command: '/mtop',
  aliases: ['/mtop'],
  description: 'Топ пользователей по количеству сообщений',
  async execute(context) {
    const { peerId, senderId } = context;

    if (!await checkIfTableExists(`roles_${peerId}`)) {
      return context.reply('❌ Таблица чата не существует, попробуйте написать /start');
    }

    const senderRoleId = await getUserRole(peerId, senderId);

    if (senderRoleId < 20) {
      return context.reply(`❌ У вас нет прав`);
    }

    try {
      const selectUsersQuery = `
        SELECT user_id, messages_count
        FROM conference_${peerId}
        WHERE messages_count IS NOT NULL
        ORDER BY messages_count DESC
        LIMIT 10
      `;

      const dbUsersResult = await queryAsync(selectUsersQuery);

      if (dbUsersResult.length === 0) {
        return context.reply('❌ Нет данных о пользователях в беседе.');
      }

      const dbUsers = dbUsersResult.map(row => row.user_id);
      const members = await vk.api.messages.getConversationMembers({ peer_id: peerId });

      // Фильтруем участников беседы, оставляем только тех, кто есть в базе данных
      const validMembers = members.profiles.filter(member => dbUsers.includes(member.id));

      // Сортируем участников по убыванию messages_count
      validMembers.sort((a, b) => {
        const messagesCountA = dbUsersResult.find(dbUser => dbUser.user_id === a.id).messages_count;
        const messagesCountB = dbUsersResult.find(dbUser => dbUser.user_id === b.id).messages_count;
        return messagesCountB - messagesCountA;
      });

      const userNames = await getUserName(validMembers.map(user => user.id));

      const topUsersMessage = validMembers.map((user, index) => {
        const dbUser = dbUsersResult.find(dbUser => dbUser.user_id === user.id);
        const { messages_count } = dbUser;
        const userName = userNames[index];
        return `${index + 1}. [id${user.id}|${userName}] - ${messages_count} сообщ.`;
      });

      const responseMessage = `Топ пользователей по количеству сообщений в беседе:\n\n${topUsersMessage.join('\n')}`;
      context.reply({ message: responseMessage, disable_mentions: true });
    } catch (error) {
      console.error('Ошибка при выполнении команды /mtop:', error);
      context.reply('❌ Произошла ошибка.');
    }
  },
};
