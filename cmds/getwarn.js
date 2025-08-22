const database = require('../databases.js'); // Подключаем базу данных
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName, getRoleNamezov } = require('./roles.js');

const util = require('util');

const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/getwarn',
  description: 'Получить количество предупреждений пользователя',
  execute: async (context) => {
    const { peerId, text, replyMessage } = context;
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

    // Извлекаем айди пользователя, у которого нужно узнать количество предупреждений
    const target = parts[1];
    const userId = target

    let targetUserId = await extractNumericId(userId);

    if (replyMessage) {
      targetUserId = replyMessage.senderId;
    }

    if (!targetUserId) {
      return context.send(`❌ Вы не указали пользователя`);
    }

    try {
      // Получаем текущее количество варнов у пользователя
      const getWarnsQuery = `
        SELECT warns, warns_history
        FROM conference_${peerId}
        WHERE user_id = ?
      `;

      const [rows] = await queryAsync(getWarnsQuery, [targetUserId]);

      const currentWarns = rows.warns;
	  const warnHistory = rows.warns_history
	  const cleanText = warnHistory.replace(/[\[\]]/g, '');
      const jsonArray = JSON.parse(`[${cleanText}]`);
	  
	  console.log(jsonArray)
      const formattedWarns = currentWarns !== null ? `${currentWarns}/3` : '0/3';

      context.reply(`У [id${targetUserId}|пользователя] ${formattedWarns} предупреждений.`);
    } catch (error) {
      console.error('Ошибка при получении количества предупреждений:', error);
      context.reply('❌ Произошла ошибка при получении количества предупреждений.');
    }
  },
};
