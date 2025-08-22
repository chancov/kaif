const { VK } = require('vk-io');

const { getUserTech } = require('./roles.js');

async function getChatNames(peerIds) {
  const chatNames = {};

  for (const peerId of peerIds) {
    try {
      const chatInfo = await vk.api.messages.getConversationsById({ peer_ids: peerId });

      if (chatInfo.items && chatInfo.items.length > 0) {
        const chat = chatInfo.items[0];
		console.log(chatInfo.items[0])
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

async function getChatOwner(peerIds) {
  const owners = {};

  for (const peerId of peerIds) {
    try {
      const chatInfo = await vk.api.messages.getConversationsById({ peer_ids: peerId });

      if (chatInfo.items && chatInfo.items.length > 0) {
        const chat = chatInfo.items[0];
        const ownerId = chat.chat_settings ? chat.chat_settings.owner_id : null;
        owners[peerId] = ownerId;
      }
    } catch (error) {
      console.error(`Ошибка при получении владельца для peerId ${peerId}:`, error);
      owners[peerId] = 'Ошибка';
    }
  }

  return owners;
}


module.exports = {
  command: '/info',
  description: 'Информация о беседе',
  execute: async (context) => {
    const { peerId, text } = context;
    let kaka = await getUserTech(context.senderId)
    if (kaka != 1) return 10;

    // Разбиваем текст на аргументы
    const args = text.trim().split(' ');

    // Проверяем наличие аргумента (идентификатора беседы)
    if (args.length < 2) {
      context.reply('Вы не указали идентификатор беседы. Пример использования: /info 2000000001');
      return;
    }

    const specifiedPeerId = Number(args[1]);

    try {
      // Получаем название беседы
      const chatNames = await getChatNames([specifiedPeerId]);
      const ownerNames = await getChatOwner([specifiedPeerId]);

      if (chatNames[specifiedPeerId]) {
		context.reply(`Название беседы: ${chatNames[specifiedPeerId]}\nВладелец: [id${ownerNames[specifiedPeerId]}|Пользователь]`);
      } else {
        context.reply('Информация о беседе не найдена.');
      }
    } catch (error) {
      console.error('Произошла ошибка при получении информации о беседе:', error);
      context.reply('Произошла ошибка при получении информации о беседе.');
    }
  },
};
