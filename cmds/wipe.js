const database = require('../databases.js');
const { getUserRole, checkIfTableExists } = require('./roles.js');
const util = require('util');

const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/wipe',
  aliases: ['/вайп'],
  description: 'Сброс всех ролей и никнеймов (кроме владельца)',
  async execute(context) {
    const { peerId, senderId } = context;
    const conferenceId = peerId;
      if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
        console.error('🛑 Таблица никнеймов не существует');
        console.log(`nicknames_${conferenceId}`);
        return context.send('❌ Ваша беседа не зарегистрирована!');
      }
    const senderUserRole = await getUserRole(conferenceId, senderId);

    if (senderUserRole < 100) {
      return context.send('У вас нет прав на сброс ролей и никнеймов.');
    }

    try {
      const resetRolesQuery = `UPDATE roles_${conferenceId} SET role_id = 0 WHERE user_id != ?`;
      await queryAsync(resetRolesQuery, [senderId]);

		const resetNicknamesQuery = `DELETE FROM nicknames_${conferenceId}`;
		await queryAsync(resetNicknamesQuery);

      await context.send('✅️ Все роли и никнеймы были успешно сброшены!');
    } catch (error) {
      console.error('Ошибка при сбросе всех ролей и никнеймов:', error);
      await context.send('🛑 Произошла ошибка при сбросе всех ролей и никнеймов.');
    }
  },
};
