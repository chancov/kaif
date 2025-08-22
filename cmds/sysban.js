const database = require('../databases.js');

const util = require('util');

const queryAsync = util.promisify(database.query).bind(database);
module.exports = {
  command: '/sysban',
  description: 'Системный бан пользователя',
  async execute(context) {
    if (!Config.developers.includes(context.senderId)) return context.reply(`Гуляй`);

    const messageText = context.text;
    const commandParts = messageText.split(' ');

    if (commandParts.length < 3) {
      context.reply('Используйте команду в формате: /sysban [упоминание пользователя] [причина]');
      return;
    }

    const userId = await extractNumericId(commandParts[1]);
    const reason = commandParts.slice(2).join(' ');

    // Сохранение информации в таблицу sysbanned
    const insertSysbanQuery = 'INSERT INTO sysbanned (user_id, reason) VALUES (?, ?)';

    try {
      await queryAsync(insertSysbanQuery, [userId, reason]);
      context.reply(`</> ✅️ [id${userId}|Пользователь] был заблокирован в системе бота.\nПричина: ${reason}`);
    } catch (error) {
      console.error('Ошибка при выполнении команды /sysban:', error);
      context.reply('Произошла ошибка при выполнении команды.');
    }
  },
};
