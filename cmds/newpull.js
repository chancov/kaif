const database = require('../databases.js'); // Подключение к базе данных
const { getUserRole, checkIfTableExists } = require('./roles.js');

module.exports = {
  command: '/newpull',
  description: 'Создание нового пулла',
  async execute(context) {
    const { peerId, senderId } = context;
    const poolName = context.text.split(' ')[1];
    const senderRoleId = await getUserRole(context.peerId, context.senderId);

    if (!await checkIfTableExists(`nicknames_${peerId}`)) {
      console.error('Таблица никнеймов не существует');
      return context.send('Ваша беседа не зарегистрирована!');
    }

    if (senderRoleId < 100) {
      return context.reply(`❌ У вас нет прав на создание объединения`);
    }

    if (!poolName) {
      return context.reply('❌ Укажите название объединения.');
    }

    const crypto = require('crypto');

    function generateUniqueKey() {
      const keyLength = 5;
      return crypto.randomBytes(keyLength).toString('hex');
    }

    const poolKey = generateUniqueKey();

    const createPoolsTableQuery = `
      CREATE TABLE IF NOT EXISTS pools (
        id INT PRIMARY KEY AUTO_INCREMENT,
        pool_name VARCHAR(255) NOT NULL,
        pool_key VARCHAR(255) NOT NULL,
        pool_peerIds TEXT NOT NULL,
        creator_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const selectAllPoolsQuery = `
      SELECT *
      FROM pools
    `;

    database.query(createPoolsTableQuery, (error, result) => {
      if (error) {
        console.error('Ошибка при создании таблицы pools:', error);
        return context.send(' Произошла ошибка.');
      }

      // Выполняем запрос, чтобы получить список всех пулов
      database.query(selectAllPoolsQuery, (selectError, selectResult) => {
        if (selectError) {
          console.error('Ошибка при получении списка пулов:', selectError);
          return context.send('Произошла ошибка.');
        }

        // Проверяем, есть ли беседа в поле pool_peerIds других пулов
        const isAlreadyInOtherPool = selectResult.some((pool) => pool.pool_peerIds.includes(peerId));

        if (isAlreadyInOtherPool) {
          return context.reply('Эта беседа уже включена в другой пул.');
        }

        const initialPeerIds = [peerId]; // Условный массив с идентификатором текущей беседы

        const insertPoolQuery = `
          INSERT INTO pools (pool_name, pool_key, pool_peerIds, creator_id)
          VALUES (?, ?, ?, ?)
        `;

        database.query(insertPoolQuery, [poolName, poolKey, JSON.stringify(initialPeerIds), senderId], (insertError, insertResult) => {
          if (insertError) {
            console.error('Ошибка при добавлении пула:', insertError);
            return context.send('Произошла ошибка.');
          }

          context.reply(`✅️ Объединение «${poolName}» успешно создано! \n\nИдентификатор объединения: #${poolKey}`);
        });
      });
    });
  },
};
