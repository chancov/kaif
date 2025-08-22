const { getUserRole, checkIfTableExists, getRoleName } = require('./roles.js');
const database = require('../databases.js'); // Подключите вашу базу данных

module.exports = {
  command: '/addmoder',
  aliases: ['/addmoder'],
  description: 'Добавление роли Модератора пользователю',
  async execute(context) {
    const senderRoleId = await getUserRole(context.peerId, context.senderId);
    const { peerId, senderId, replyMessage } = context;
    const messageText = context.text;
    const conferenceId = peerId;
    const parts = messageText.split(' ');

    if (!await checkIfTableExists(`roles_${context.peerId}`)) {
      return context.reply('❌ Таблица ролей не существует');
    }

    if (senderRoleId < 40) {
      return context.reply(`❌ У вас недостаточно прав для использования этой команды!\n❌ Минимальная роль для использования команды: Администратор`);
    }

    const target = replyMessage ? replyMessage.senderId : parts[1];
    const userId = target || (replyMessage ? replyMessage.senderId : senderId);
    let label = await extractNumericId(userId);

    if (replyMessage) {
      label = replyMessage.senderId;
    }
    if (!label) return context.reply(`❌ Вы не указали пользователя, которому нужно выдать права!`);

    const chelikRoleId = await getUserRole(context.peerId, label);

    if (senderRoleId <= chelikRoleId) {
      return context.reply('❌ У вас недостаточно прав для изменения роли данного пользователя!');
    }
    let userRole = await getUserRole(context.peerId, label);
    let currentUserRole = await getRoleName(userRole);

    context.reply(`⭐ [id${label}|Пользователь] получил роль «Модератор»\n❓ Прошлая роль: «${currentUserRole}»`);

    const roleId = 20; 
    const rolesTable = `roles_${context.peerId}`;

    const insertRoleQuery = `
      INSERT INTO ${rolesTable} (user_id, role_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
    `;

    database.query(insertRoleQuery, [label, roleId], async (error, result) => {
      if (error) {
        console.error('Ошибка при добавлении роли:', error);
        return context.send('❌ Произошла ошибка при выдаче роли, обратитесь к тех. администратору: @dealernarko');
      }

   });
  }
};
