const { getUserRole, checkIfTableExists, getRoleName, getpoolkey } = require('./roles.js');
const database = require('../databases.js'); // Подключаем базу данных
const util = require('util');

// Promisify the query function
const queryPromise = util.promisify(database.query).bind(database);

module.exports = {
  command: '/grr',
  aliases: ['/глобальноудалитьроль'],
  description: 'Глобальное удаление роли у пользователя',
  async execute(context) {
    const senderRoleId = await getUserRole(context.peerId, context.senderId);
    const { peerId, senderId, replyMessage } = context;
    const messageText = context.text;
    const parts = messageText.split(' ');

    if (!await checkIfTableExists(`roles_${context.peerId}`)) {
      return context.reply('❌ Таблица ролей не существует');
    }

    if (senderRoleId < 40) {
      return context.reply(`❌ У вас нет прав на глобальное удаление роли у пользователя`);
    }

    const selectPoolQuery = `
      SELECT *
      FROM pools
      WHERE pool_peerIds LIKE ?
    `;

    try {
      const results = await queryPromise(selectPoolQuery, [`%${peerId}%`]);
      if (results.length === 0) {
        return context.reply('❌ Пулл не найден.');
      }

      for (const pool of results) {
        const poolPeerIds = JSON.parse(pool.pool_peerIds || '[]');

        for (const poolPeerId of poolPeerIds) {
          const senderRoleIdd = await getUserRole(poolPeerId, context.senderId);
          if (senderRoleIdd < 40) {
            continue;
          }
          const roleId = 0; // Устанавливаем роль "Пользователь" или другую по умолчанию
          const rolesTable = `roles_${poolPeerId}`;

          const target = replyMessage ? replyMessage.senderId : parts[1];
          const userId = target || (replyMessage ? replyMessage.senderId : senderId);
          let label = await extractNumericId(userId);

          if (replyMessage) {
            label = replyMessage.senderId;
          }

          const chelikroleid = await getUserRole(poolPeerId, label);

          if (senderRoleIdd <= chelikroleid) {
            continue;
          }

          await queryPromise(`
            DELETE FROM ${rolesTable}
            WHERE user_id = ?;
          `, [label]);
        }
      }

      context.reply(`✅️ Права [${chelikroleid}|пользователя] были успешно обнулены во всех беседах пулла.`);
    } catch (error) {
      console.error('Ошибка при удалении роли:', error);
      return context.send('❌ Произошла ошибка.');
    }
  }
};
