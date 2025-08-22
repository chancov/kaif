const database = require('../databases.js'); // Подключение к базе данных
const { getUserRole, checkIfTableExists } = require('./roles.js');

module.exports = {
  command: '/pullinfo',
  description: 'Получение информации о пулле',
  async execute(context) {
    const { peerId, senderId } = context;

    const senderRoleId = await getUserRole(peerId, senderId);

    if (senderRoleId < 20) {
      return context.send('У вас нет прав для просмотра информации пула');
    }

    if (!await checkIfTableExists(`nicknames_${peerId}`)) {
      console.error('Таблица никнеймов не существует');
      return context.send('❌ Ваша беседа не зарегистрирована!');
    }

    const selectPoolQuery = `
      SELECT *
      FROM pools
      WHERE pool_peerIds LIKE ?
    `;

    database.query(selectPoolQuery, [`%${peerId}%`], async (selectError, selectResults) => {
      if (selectError) {
        console.error('Ошибка при запросе информации о пуле:', selectError);
        return context.send('❌ Произошла ошибка.');
      }

      if (selectResults.length > 0) {
        const pool = selectResults[0];
        const poolName = pool.pool_name;
        const poolKey = pool.pool_key;
        const creatorId = pool.creator_id;
        const createdAt = pool.created_at;

        const creatorLink = await getlink(creatorId);

        const poolPeerIds = JSON.parse(pool.pool_peerIds || '[]');

        // Здесь вы должны выполнить запросы к API ВКонтакте для получения названий бесед из poolPeerIds
		const chatNames = await getChatNames(poolPeerIds);
		const chatList = Object.entries(chatNames)
		  .sort(([peerIdA], [peerIdB]) => Number(peerIdA) - Number(peerIdB)) // Сортировка по номеру чата
		  .map(([peerId, chatName], index) => `${index + 1}. Чат: ${chatName}`)
		  .join('\n');

	  
        const currentDate = new Date(createdAt);
        const formattedTime = currentDate.toLocaleString('ru', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return context.reply(`
ℹ️ Информация о объединении:
📇 Имя объединения: ${poolName}
👑 Владелец: ${creatorLink}
🔐 Ключ объединения: #${poolKey}
📅 Дата регистрации: ${formattedTime}

✨ Названия чатов в пуле:

${chatList}
`);
      } else {
        return context.reply('❌ Объединение для данной беседы не найдено.');
      }
    });
  },
};

async function getChatNames(peerIds) {
  const chatNames = {};

  for (const peerId of peerIds) {
    try {
      const chatInfo = await vk.api.messages.getConversationsById({ peer_ids: peerId });

      if (chatInfo.items && chatInfo.items.length > 0) {
        const chat = chatInfo.items[0];
        const title = chat.chat_settings ? chat.chat_settings.title : 'Неизвестно';
        chatNames[peerId] = title;
      }
    } catch (error) {
      console.error(`Ошибка при получении названия чата для peerId ${peerId}:`, error);
      chatNames[peerId] = 'Ошибка';
    }
  }

  return chatNames;
}
