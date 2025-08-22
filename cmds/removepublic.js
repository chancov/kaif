const database = require('../databases.js');
const util = require('util');
const { getUserRole, checkIfTableExists } = require('./roles.js');

const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/removepublic',
  aliases: ['/удалитьпаблик'],
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
    if (senderUserRole < 60) {
      return context.send('У вас нет прав на удаление паблика.');
    }

    try {
      // Проверяем, установлено ли сообщество в беседе
      const checkPublicQuery = 'SELECT public FROM conference WHERE conference_id = ?';
      const rows = await queryAsync(checkPublicQuery, [conferenceId]);
	  console.log(rows)

      if (!rows[0].public) {
        return context.send('Сообщество не было установлено.');
      }

      // Удаляем сообщество
      const removePublicQuery = 'UPDATE conference SET public = NULL WHERE conference_id = ?';
      await queryAsync(removePublicQuery, [conferenceId]);

      await context.send('✅️ Паблик успешно удален из беседы.');
    } catch (error) {
      console.error('Ошибка при удалении паблика из беседы:', error);
      await context.send('Произошла ошибка при удалении паблика из беседы.');
    }
  },
};
