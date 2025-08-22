const database = require('../databases.js');
const util = require('util');
const { getUserRole, checkIfTableExists } = require('./roles.js');

const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/тишина',
  aliases: ['/silence'],
  description: 'Удаление паблика из беседы',
  async execute(context) {
    const { peerId, senderId } = context;
    const conferenceId = peerId;
    const senderUserRole = await getUserRole(conferenceId, senderId);
	
      if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
        console.error('Таблица никнеймов не существует');
        console.log(`nicknames_${conferenceId}`);
        return context.send('❌ Ваша беседа не зарегистрирована!');
      }
    if (senderUserRole < 40) {
      return context.send('У вас нет прав.');
    }
      // Проверяем, установлено ли сообщество в беседе
    if (!silenceConf[peerId]) {
	  silenceConf[peerId] = {};
	
	  const muteInfo = {
      silence: 1,
    };
	silenceConf[peerId] = muteInfo;
      await context.send(`❗ С этого момента, в чате активен режим тишины!\n⛔ Сообщения всех обычных участников будут удалены.\n\n>> Администратор: [id${context.senderId|пользователь}`);
	} else {
	silenceConf[peerId] = {};
	await context.send(`❗ С этого момента, в чате отключен режим тишины.\n⛔ Сообщения пользователей теперь не будут удалятся.\n\n>> Администратор: [id${context.senderId|пользователь}`);
    }
  },
};