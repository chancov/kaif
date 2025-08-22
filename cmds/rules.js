const database = require('../databases.js');
const { checkIfTableExists } = require('./roles.js');

const util = require('util');
const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/правила',
  aliases: ['/rules'],
  description: 'Показать правила беседы',
  execute: async (context) => {
    const { peerId } = context;

    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.send('❌ Беседа не зарегистрирована!');
    }

    try {
      const getRulesQuery = `
        SELECT rules
        FROM conference
        WHERE conference_id = ?
      `;

      const [result] = await queryAsync(getRulesQuery, [peerId]);
      const rules = result && result.rules;

      if (rules === null) {
        return context.send('❌ Для этой беседы правила ещё не установлены.');
      }

      return context.send(`Правила беседы:\n\n${rules}`);
    } catch (error) {
      console.error('Ошибка при получении правил:', error);
      return context.send('❌ Произошла ошибка при получении правил.');
    }
  },
};
