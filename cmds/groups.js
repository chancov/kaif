const util = require('util');
const database = require('../databases.js');
const { checkIfTableExists } = require('./roles.js');
const { getUserTech, getUsername } = require('../util.js');

// Промисифицируем функцию database.query
const queryAsync = util.promisify(database.query).bind(database);

async function getRoleName(agentAccess) {
  switch (agentAccess) {
    case 4:
      return '⭐ Разработчик';
    case 3:
      return '⭐ Администратор';
    case 2:
      return '⭐ Менеджер';
    case 1:
      return '⭐ Агент поддержки';
    default:
      return '⭐ undefined';
  }
}

module.exports = {
  command: '/groups',
  aliases: ['/groups'],
  description: 'Список агентов и их должностей',
  async execute(context) {
    const { peerId, senderId } = context;
    const siski = await getUserTech(context.senderId);
    console.log(siski);
    if (siski < 4) return context.reply('❌ У вас недостаточно прав для использования этой команды!\n❌ Команда доступна исключительно старшей команде бота.');
    if (!await checkIfTableExists('agents')) {
      return context.reply('❌ Таблица агентов не существует.');
    }

    try {
      const selectAgentsQuery = `
        SELECT user_id, agent_access
        FROM agents
        ORDER BY agent_access ASC
      `;

      const agentsResult = await queryAsync(selectAgentsQuery);

      if (agentsResult.length === 0) {
        return context.reply('❌ В данный момент, список администрации пуст.');
      }

      const agentPromises = agentsResult.map(async (agent, index) => {
        const { user_id, agent_access } = agent;
        const roleName = await getRoleName(agent_access);
        const userName = await getUsername(user_id);
        const onlineStatus = await getUserOnlineStatus(user_id);
        return {
          user_id,
          userName,
          roleName,
          onlineStatus,
          agentNumber: index + 1,
        };
      });
      
      const agents = await Promise.all(agentPromises);

      const responseMessage = `⭐ Действующая команда бота:\n\n${agents.map(agent => {
        return `№${agent.agentNumber} [${agent.onlineStatus}] >> @id${agent.user_id} (${agent.userName}) >> Группа: ${agent.roleName}\n`;
      }).join('\n')}`;
      
      context.reply({ message: responseMessage, disable_mentions: true });
    } catch (error) {
      console.error('Ошибка при выполнении команды /agents:', error);
      context.reply('❌ Произошла ошибка.');
    }
  },
};

async function getUserOnlineStatus(userId) {
  try {
    const user = await vk.api.users.get({
      user_ids: userId,
      fields: 'online',
    });
    return user[0].online === 1 ? 'В сети' : 'Не в сети';
  } catch (error) {
    console.error('Ошибка при получении статуса пользователя:', error);
    return 'Неизвестно';
  }
}