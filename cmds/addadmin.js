const { getUserRole, checkIfTableExists, getRoleName } = require('./roles.js');
const database = require('../databases.js'); // Подключите вашу базу данных

module.exports = {
  command: '/addadmin',
  aliases: ['/addadmin'],
  description: 'Добавление роли Администратора пользователю',
  async execute(context) {
    const senderRoleId = await getUserRole(context.peerId, context.senderId);
    const { peerId, senderId, replyMessage } = context;
    const messageText = context.text;
    const conferenceId = peerId;
    const parts = messageText.split(' ');

    if (!await checkIfTableExists(`roles_${context.peerId}`)) {
      return context.reply('❓ Произошла ошибка при выдаче роли, обратитесь к тех. администратору: @dealernarko');
    }

    if (senderRoleId < 60) {
      return context.reply(`❓ У вас недостаточно прав для использования этой команды!\n❓ Минимальная роль для использования команды: Спец. администратор`);
    }

    const target = replyMessage ? replyMessage.senderId : parts[1];
    const userId = target || (replyMessage ? replyMessage.senderId : senderId);
    let label = await extractNumericId(userId)

	if(replyMessage) {
		label = replyMessage.senderId
	}
	if(!label) return context.reply(`❓ Упс... Вы не указали пользователя, которому нужно выдать права!`)
    const chelikroleid = await getUserRole(context.peerId, label);

	if(senderRoleId <= chelikroleid) {
		return context.reply('❓ У вас недостаточно прав для изменения роли данного пользователя!')
	}
    const roleId = 40; 
    const rolesTable = `roles_${context.peerId}`;
	  let currentUserRole = await getRoleName(chelikroleid)
	  
      context.reply(`⭐ [id${label}|Пользователь] получил роль «Администратор»\n❓ Прошлая роль: «${currentUserRole}»`);

    const insertRoleQuery = `
      INSERT INTO ${rolesTable} (user_id, role_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
    `;

    database.query(insertRoleQuery, [label, roleId], async (error, result) => {
      if (error) {
        console.error('Ошибка при добавлении роли:', error);
        return context.send('❓ Произошла ошибка при выдаче роли, обратитесь к тех. администратору: @dealernarko');
      }
	  
    });
  }
};
