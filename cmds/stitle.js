const database = require('../databases.js');
const { getUserRole, checkIfTableExists } = require('./roles.js');
const util = require('util');

const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/stitle',
  aliases: ['/установитьназвание'],
  description: 'Установить название для бесед',
  async execute(context) {
    const messageText = context.text;
    const { peerId, senderId } = context;
    const parts = messageText.split(' ');
    const conferenceId = peerId;
      if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
        console.error('Таблица никнеймов не существует');
        console.log(`nicknames_${conferenceId}`);
        return context.send('❌ Ваша беседа не зарегистрирована!');
      }
	  
    const senderUserRole = await getUserRole(conferenceId, senderId);
	
	if(!parts[1]) {
		return context.reply('❌ Вы не указали новое название беседы')
	}
    if (senderUserRole < 80) {
      return context.reply('❌ У вас нет прав на установку названия беседы.');
    }
    const newTitle = messageText.slice('/stitle '.length);
	setChatTitle(peerId, newTitle)
  }
}