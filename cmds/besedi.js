const database = require('../databases.js');
const util = require('util');
const { getUserTech } = require('../util.js');

const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/clist',
  description: 'Отобразить названия бесед',
  execute: async (context) => {
    let kaka = await getUserTech(context.senderId);
    if (kaka < 3) return;

    let start = 1;
    let end = 50;

    const commandArgs = context.text.split(' ');
    if (commandArgs.length > 1) {
      const page = parseInt(commandArgs[1]);
      if (!isNaN(page) && page > 0) {
        start = (page - 1) * 50 + 1;
        end = page * 50;
      }
    }

    try {
      const selectConferenceQuery = `
        SELECT conference_id
        FROM conference
        LIMIT ${start - 1}, ${end - start + 1}
      `;

      // Используем промисифицированную функцию запроса
      const rows = await queryAsync(selectConferenceQuery);

      if (rows.length === 0) {
        return context.reply('Беседы не найдены.');
      }

      const peerIds = rows.map(row => row.conference_id);
      const chatNames = await getChatNames(peerIds);

      let response = `⭐ Список бесед [отображено ${start} по ${end} чатов]:\n`;
      for (const [chatId, title] of Object.entries(chatNames)) {
        response += `🔸 [cId${chatId}] ${title}\n`;
      }
      console.log(response)
      context.reply(response);
    } catch (error) {
      console.error('Произошла ошибка при получении названий бесед:', error);
      context.reply('Произошла ошибка при получении названий бесед.');
    }
  }
};

async function getChatNames(peerIds) {
  try {
    const chunkSize = 100;
    const chunks = [];

    for (let i = 0; i < peerIds.length; i += chunkSize) {
      chunks.push(peerIds.slice(i, i + chunkSize));
    }

    const chatNames = {};

    // Iterate over chunks and make requests
    for (const chunk of chunks) {
      const chatInfo = await vk.api.messages.getConversationsById({ peer_ids: chunk.join(',') });

      if (chatInfo.items && chatInfo.items.length > 0) {
        for (const chat of chatInfo.items) {
          const peerId = chat.peer.id;
          const title = chat.chat_settings ? chat.chat_settings.title : 'Неизвестно';
          chatNames[peerId] = title;
        }
      }
    }

    return chatNames;
  } catch (error) {
    console.error('Ошибка при получении названий бесед:', error);
    return {};
  }
}
