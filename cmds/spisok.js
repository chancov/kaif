const { getUserRole, checkIfTableExists } = require('./roles.js');
const database = require('../databases.js'); // Подключите вашу базу данных

module.exports = {
  command: '/roles',
  aliases: ['/roles'],
  description: 'Список доступных ролей для выдачи',
  async execute(context) {
    const senderRoleId = await getUserRole(context.peerId, context.senderId);

    if (!await checkIfTableExists(`roles_${context.peerId}`)) {
      return context.reply('❌ Таблица ролей не существует');
    }

    if (senderRoleId < 20) {
      return context.reply(`❌ У вас нет прав`);
    }
      context.reply(`📄 Вот полный список ролей:\n\n1. «Участник» с приоритетом [0]\n2. «Модератор» с приоритетом [20]\n3. «Администратор» с приоритетом [40]\n4. «Спец.администратор» с приоритетом [60]\n5. «Руководитель» с приоритетом [80]\n6. «Владелец» с приоритетом [100]`);
  }
};
