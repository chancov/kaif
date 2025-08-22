const database = require('../databases.js');
const util = require('util');
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName } = require('./roles.js');

const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/новыеправила',
  aliases: ['/newrules'],
  description: 'Установка правил для беседы',
  async execute(context) {
    const messageText = context.text.trim();
  const command = messageText.split(' ')[0].toLowerCase(); // Получаем команду или её алиас
  const args = messageText.slice(command.length).trim(); // Получаем аргументы команды

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
      return context.send('❌ У вас нет прав на установку правил');
    }

    if (!args) {
      return context.send('Пример установки правил: /правила [текст правил]\nПример удаления правил: /правила 0');
    }

    if (args === '0') {
      // Если пользователь ввел /правила 0, то удаляем правила
      try {
        const updateQuery = 'UPDATE conference SET rules = NULL WHERE conference_id = ?';
        await queryAsync(updateQuery, [conferenceId]);
        await context.send('✅️ Правила успешно удалены!');
      } catch (error) {
        console.error('Ошибка при удалении правил:', error);
        await context.send('❌ Произошла ошибка при удалении правил.');
      }
    } else {
      // В противном случае, сохраняем или обновляем правила
      const rules = args

      try {
        // Запрос к базе данных для сохранения правил
        const query = 'INSERT INTO conference (conference_id, rules) VALUES (?, ?) ON DUPLICATE KEY UPDATE rules = VALUES(rules)';
        await queryAsync(query, [conferenceId, rules]);
        await context.send('✅️ Правила успешно установлены!');
      } catch (error) {
        console.error('Ошибка при установке правил:', error);
        await context.send('❌ Произошла ошибка при установке правил.');
      }
    }
  },
};