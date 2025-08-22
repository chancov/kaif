const database = require('../databases.js');
const { checkUserRole, checkIfTableExists } = require('./roles.js');
module.exports = {
  command: '/gnick',
  aliases: ['/gnick'],
  description: 'gnick',
  async execute(context) {
    const messageText = context.text;
    const { peerId } = context;
    const conferenceId = peerId;
    const parts = messageText.split(' ');
    const maybe1 = parts.slice(1).join(' ')
    if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
      console.error('Таблица никнеймов не существует');
      return context.send('Ваша беседа не зарегистрирована!');
    }
    const hasPermission = await checkUserRole(context.peerId, context.senderId, 'модератор');
    
    if (!hasPermission) {
      context.reply('У вас нет прав на выполнение этой команды.');
      return;
    }
	
	let userId;
	if(context.replyMessage) {
		userId = context.replyMessage.senderId
  } else {
	  userId = await extractNumericId(parts[1])
  }
        const selectNicknameQuery = `
        SELECT nickname FROM nicknames_${conferenceId}
        WHERE user_id = ?
        `;
		console.log(userId)
        database.query(selectNicknameQuery, [userId], (error, results) => {
        if (error) {
            console.error('Ошибка при поиске никнейма:', error);
            return context.send('Произошла ошибка.');
        }

        if (results.length > 0) {
            const userNickname = results[0].nickname;
            context.reply(`❓ У [id${userId}|пользователя] установлен никнейм: ${userNickname}`);
            console.log(userId)
        } else {
            context.reply('❌ У пользователя отсутствует никнейм!');
        }
        });
  }
};
