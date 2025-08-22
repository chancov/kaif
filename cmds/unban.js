const database = require('../databases.js'); // Подключаем базу данных
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName, getRoleNamezov } = require('./roles.js');

module.exports = {
  command: '/unban',
  description: 'Разблокировать пользователя',
  execute: async (context) => {
    const { peerId, text, replyMessage } = context;
    const messageText = context.text;
    const parts = messageText.split(' ');   

    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.send('❌ Беседа не зарегистрирована!');
    }
	
    const senderUserRole = await getUserRole(peerId, context.senderId);

    if (senderUserRole < 40) {
      return context.reply('❌ Отказано, ваша роль слишком низкая для использования этой команды.');
    }
	
    let target;
    if (replyMessage) {
      target = replyMessage.senderId; 
    } else {
      target = await extractNumericId(parts[1]); // Получение таргета
    }
    if (!target) {
      context.reply('❌ Укажите пользователя для разблокировки.');
      return;
    }

    try {
      // Удаление пользователя из списка заблокированных
	const removeBlockedUserQuery = `
	  UPDATE conference_${peerId}
	  SET blocked_users = NULL
	  WHERE user_id = ?
	`;

	database.query(removeBlockedUserQuery, [target], (error, results) => {
	  if (error) {
		console.error('Ошибка при разблокировке пользователя:', error);
		return context.send('Произошла ошибка при разблокировке пользователя.');
	  }

	  context.send(`✅️ [id${target}|Пользователь] разблокирован [id${context.senderId}|пользователем].`);
	});


    } catch (error) {
      console.error('Ошибка при обработке команды /unban:', error);
      context.send('Произошла ошибка при обработке команды /unban.');
    }
  },
};
