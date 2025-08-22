const { checkIfTableExists, getRoleNamezov, getRoleName, getUserRole, getpoolkey } = require('./roles.js');
const database = require('../databases.js'); // Подключение к базе данных
const util = require('util');
const databaseQuery = util.promisify(database.query);

module.exports = {
  command: '/gzov',
  aliases: ['/гзов', '/групповойзов'],
  description: 'Массовое упоминание всех пользователей в пулле',
  async execute(context) {
    const messageText = context.text;
    const { peerId, senderId, replyMessage } = context;
    const parts = messageText.split(' ');
    const senderUserRole = await getUserRole(peerId, senderId);
    const reason = messageText.slice('/gzov'.length).trim();

    if (!(await checkIfTableExists(`nicknames_${peerId}`))) {
      console.error('Таблица никнеймов не существует');
      return context.send('Ваша беседа не зарегистрирована!');
    }

    if (senderUserRole < 40) {
      const roleName = getRoleName(senderUserRole);
      return context.reply(`❌ У вас нет прав на использование этой команды. Ваша текущая роль: ${roleName}`);
    }
    if (!reason) {
      return context.reply('❌ Вы не указали причину вызова');
    }

    const selectPoolQuery = `
      SELECT *
      FROM pools
      WHERE pool_peerIds LIKE ?
    `;

    try {
    const selectResults = await databaseQuery(selectPoolQuery, [`%${peerId}%`]);
    if (selectResults.length === 0) {
      return context.reply('❌ Пулл не найден.');
    }

    const pool = selectResults[0];
    const poolKey = pool.pool_key;

    if (!poolKey) {
      return context.reply(`У вас нету общего пулла для отправки сообщения`);
    }

    const role = await getRoleNamezov(senderUserRole);

    // Send to all conversations in the pool
    const poolPeerIds = JSON.parse(pool.pool_peerIds || '[]');
    for (const poolPeerId of poolPeerIds) {
    const senderUserRolee = await getUserRole(poolPeerId, senderId);
	if(senderUserRolee < 40) {
		continue;
	}
	  
    const conversationMembers = await vk.api.messages.getConversationMembers({
      peer_id: poolPeerId,
    });

    const memberProfiles = conversationMembers.profiles; // Массив объектов с данными о пользователях
    let message = '';

    for (const member of memberProfiles) {
      const name = `[id${member.id}|☑️]`;
      message += `${name} `;
    }

    const editedMessage = `
      🔊 Вы были вызваны [id${senderId}|администратором] беседы.
	  
	  ${message}
	  
      Причина: ${reason}!​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬
      `;
	  
      await vk.api.messages.send({
        peer_id: poolPeerId,
        message: editedMessage,
        random_id: generateRandom32BitNumber(),
      });
    }
  } catch (error) {
    console.error('Ошибка при запросе пулла:', error);
    return context.send(`❌ Произошла ошибка: ${error}`);
  }
  },
};
