const database = require('../databases.js');
const util = require('util');
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName } = require('./roles.js');

const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/приветствие',
  aliases: ['/приветствие'],
  description: 'Приветствие для беседы',
  async execute(context) {
    const messageText = context.text;
    const { peerId, senderId, replyMessage } = context;
    const conferenceId = peerId;
    const parts = messageText.split(' ');
    const senderUserRole = await getUserRole(conferenceId, senderId);
      if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
        console.error('Таблица никнеймов не существует');
        console.log(`nicknames_${conferenceId}`);
        return context.send('❌ Ваша беседа не зарегистрирована!');
      }
    if (senderUserRole < 60) {
      return context.send('У вас нет прав на изменение приветствия');
    }

    if (!parts[1]) {
      return context.send('Пример установки приветствия: /приветствие [текст приветствия]\nПример удаления приветствия: /приветствие 0');
    }

    if (parts[1] === '0') {
      // Если пользователь ввел /приветствие 0, то удаляем hello_text
      try {
		const updateQuery = 'UPDATE conference SET hello_text = NULL WHERE conference_id = ?';
        await queryAsync(updateQuery, [conferenceId]);
        await context.send('Приветствие успешно удалено!');
      } catch (error) {
        console.error('Ошибка при удалении приветствия:', error);
        await context.send('Произошла ошибка при удалении приветствия.');
      }
    } else {
      // В противном случае, сохраняем или обновляем hello_text
      const helloText = messageText.slice('/приветствие '.length);

      try {
        // Запрос к базе данных для сохранения приветствия
        const query = 'INSERT INTO conference (conference_id, hello_text) VALUES (?, ?) ON DUPLICATE KEY UPDATE hello_text = VALUES(hello_text)';
        await queryAsync(query, [conferenceId, helloText]);
        await context.send('✅️ Приветствие успешно установлено!');
      } catch (error) {
        console.error('Ошибка при установке приветствия:', error);
        await context.send('Произошла ошибка при установке приветствия.');
      }
    }
  },
};
