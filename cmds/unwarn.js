const database = require('../databases.js'); // Подключаем базу данных
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName, getRoleNamezov } = require('./roles.js');

const util = require('util')

const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/unwarn',
  description: 'Снять варн у пользователя',
  execute: async (context) => {
    const { peerId, text, senderId, replyMessage } = context;
    const messageText = context.text;
    const conferenceId = peerId;
    const parts = messageText.split(' ');

    if (!await checkIfTableExists(`roles_${conferenceId}`)) {
      return context.send('❌ Ваша беседа не зарегистрирована!');
    }
    // Проверяем права пользователя
    const senderUserRole = await getUserRole(peerId, context.senderId);

    if (senderUserRole < 40) {
      return context.reply('❌ Отказано, ваша роль слишком низкая для использования этой команды.');
    }
	
    const target = replyMessage ? replyMessage.senderId : parts[1];
    const userId = target || (replyMessage ? replyMessage.senderId : senderId);
    let targetUserId = await extractNumericId(userId)

	if(replyMessage) {
		targetUserId = replyMessage.senderId
	}

    if (!targetUserId) {
      return context.reply('❌ Укажите пользователя для снятия варна.');
    }

    try {
      // Получаем текущее количество варнов у пользователя
      const getWarnsQuery = `
        SELECT warns
        FROM conference_${peerId}
        WHERE user_id = ?
      `;

      const [rows] = await queryAsync(getWarnsQuery, [targetUserId]);
	  console.log(rows)

      const currentWarns = rows.warns;

      if (currentWarns === 0) {
        return context.reply('❌ У пользователя нет предупреждений для снятия.');
      }

      // Уменьшаем количество варнов у пользователя
      const updateWarnsQuery = `
        UPDATE conference_${peerId}
        SET warns = GREATEST(0, warns - 1)
        WHERE user_id = ?
      `;

      await queryAsync(updateWarnsQuery, [targetUserId]);

	context.reply(`✅️ Вы сняли предупреждение с [id${targetUserId}|пользователя]\nОсталось предупреждений: [${currentWarns - 1}/3]`);
    } catch (error) {
      console.error('Ошибка при снятии варна:', error);
      context.reply('❌ Произошла ошибка при снятии варна.');
    }
  },
};