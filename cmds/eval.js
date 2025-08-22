const { getUserRole, checkIfTableExists, getRoleName } = require('./roles.js');
const database = require('../databases.js'); // Подключите вашу базу данных

module.exports = {
  command: '!eval',
  aliases: ['!eval'],
  description: 'Добавление роли Администратора пользователю',
  async execute(context) {
  if(!Config.developers.includes(context.senderId)) return;
        const { text } = context.message;

         const code = text.slice('!eval '.length);

          try {
          const result = await eval(code);
          await context.send(`✅️ Результат: ${result}`);
        } catch (error) {
          await context.send(`Ошибка: ${error.message}`);
        }
}
}