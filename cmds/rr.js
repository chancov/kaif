const { getUserRole, checkIfTableExists, getRoleName } = require('./roles.js');
const database = require('../databases.js'); // Подключите вашу базу данных

module.exports = {
  command: '/rr',
  aliases: ['/удалитьроль', '/removerole'], // Псевдонимы для команды
  description: 'Удаление роли у пользователя',
  async execute(context) {
    const senderRoleId = await getUserRole(context.peerId, context.senderId);
    const { peerId, senderId, replyMessage } = context;
    const messageText = context.text;
    const parts = messageText.split(' ');

    if (!await checkIfTableExists(`roles_${context.peerId}`)) {
      return context.reply('❌ Таблица ролей не существует');
    }

    if (senderRoleId < 40) {
      return context.reply(`❌ У вас нет прав на удаление роли у пользователя`);
    }

    const target = replyMessage ? replyMessage.senderId : parts[1];
    const userId = target || (replyMessage ? replyMessage.senderId : senderId);
    let label = await extractNumericId(userId);

    if (replyMessage) {
      label = replyMessage.senderId;
    }
	if(!label) {
		return context.reply('Вы не указали пользователя')
	}
    const chelikroleid = await getUserRole(peerId, label);
	
    if (senderRoleId <= chelikroleid) {
      return context.reply(`❌ С указанным пользователем ваши роли равны либо выше`);
    }
	
    const rolesTable = `roles_${context.peerId}`;

    const deleteRoleQuery = `
      DELETE FROM ${rolesTable}
      WHERE user_id = ?;
    `;

    database.query(deleteRoleQuery, [label], async (error, result) => {
      if (error) {
        console.error('Ошибка при удалении роли:', error);
        return console.log('❌ Произошла ошибка.');
      }
    let currentUserRole = await getRoleName(chelikroleid);
	
	context.reply(`✅️ Вы успешно обнулили права [id${label}|пользователя]`);
    });
  }
};
