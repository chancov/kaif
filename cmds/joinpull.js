const database = require('../databases.js'); // Подключение к базе данных

module.exports = {
  command: '/pull',
  description: 'Присоединение к пуллу, созданному владельцем беседы',
  async execute(context) {
    const { peerId, senderId } = context;
    const { checkIfTableExists, getUserRole } = require('./roles.js');
	const conferenceId = peerId
    if (!await checkIfTableExists(`nicknames_${peerId}`)) {
      console.error('Таблица никнеймов не существует');
      return context.send('Ваша беседа не зарегистрирована!');
    }

    const senderUserRole = await getUserRole(conferenceId, senderId);
	
    if (senderUserRole < 100) {
      return context.send('У вас нет прав на добавление беседы в пулл');
    }
	
    const selectPoolQuery = `
      SELECT *
      FROM pools
      WHERE creator_id = ? LIMIT 1
    `;

    // Ищем пул, созданный владельцем беседы
    database.query(selectPoolQuery, [senderId], async (error, results) => {
      if (error) {
        console.error('Ошибка при запросе пула:', error);
        return context.send('❌ Произошла ошибка.');
      }

      if (results.length === 0) {
        return context.reply('❌ Не найдено объединение, в котором вы являетесь владельцем.');
      }

      const pool = results[0];
      const poolPeerIds = JSON.parse(pool.pool_peerIds || '[]');

      if (poolPeerIds.includes(peerId)) {
        return context.reply('❌ Вы уже подключены к этому пулу.');
      }
      
      poolPeerIds.push(peerId); // Добавляем текущий peerId в массив

      const updatePoolQuery = `
        UPDATE pools
        SET pool_peerIds = ?
        WHERE id = ?
      `;

      database.query(updatePoolQuery, [JSON.stringify(poolPeerIds), pool.id], (updateError, updateResult) => {
        if (updateError) {
          console.error('Ошибка при обновлении пула:', updateError);
          return context.send('❌ Произошла ошибка.');
        }

        context.reply('✅ Вы успешно подключились к пуллу.');
      });
    });
  },
};
