const { checkIfTableExists, getUserRole } = require('./roles.js');
const database = require('../databases.js');
const util = require('util')
const databaseQuery = util.promisify(database.query)
module.exports = {
  command: '/resync',
  description: 'Синхронизация участников беседы с базой данных ролей',
  async execute(context) {
    const peerId = context.peerId;

    if (!await checkIfTableExists(`roles_${peerId}`)) {
      return context.reply('❌ Ваша беседа не зарегистрирована!');
    }

    // Проверяем права пользователя
    const senderUserRole = await getUserRole(peerId, context.senderId);

    if (senderUserRole < 80) {
      return context.reply('❌ Отказано, ваша роль слишком низкая для использования этой команды.');
    }

    try {
      const rolesTable = `roles_${peerId}`;

      // Получаем список пользователей из базы данных
      const getUsersQuery = `SELECT user_id FROM ${rolesTable}`;
      const dbUsersResult = await databaseQuery(getUsersQuery);
	  
		if (dbUsersResult.length === 0) {
		  return context.reply('В базе данных нет зарегистрированных пользователей.');
		}

		const dbUsers = dbUsersResult.map(row => row.user_id);

      // Получаем текущий список участников беседы
      const members = await vk.api.messages.getConversationMembers({ peer_id: peerId });

      // Фильтруем участников беседы, оставляем только тех, кто есть в базе данных
      const validMembers = members.profiles.filter(member => dbUsers.includes(member.id));

      // Удаляем из базы данных тех, кто отсутствует в беседе
	  console.log(validMembers)
      const deleteMissingUsersQuery = `
        DELETE FROM ${rolesTable}
        WHERE user_id NOT IN (${validMembers.map(member => member.id).join(', ')})
      `;
      await databaseQuery(deleteMissingUsersQuery);
	  console.log(deleteMissingUsersQuery)
      context.reply(`✅ Синхронизация завершена. Удалено из базы данных ${dbUsers.length - validMembers.length} пользователей, которых нет в беседе.`);
    } catch (error) {
      console.error('Произошла ошибка при выполнении команды /resync:', error);
      context.reply('Произошла ошибка при выполнении команды.');
    }
  },
};
