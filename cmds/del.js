const { getUserRole } = require('../util.js')
const { getTime } = require('date-fns');

let countMsg = 0
async function deleteMessages(context, peerId, userId) {
  try {
    const yesterday = getTime(new Date()) - (24 * 60 * 60 * 1000); // Таймстамп 24 часа назад

    let offset = 0;
    let messagesToDelete = [];

    // Получаем все сообщения в беседе за последние 24 часа
    while (true) {
      const response = await vk.api.messages.getHistory({
        peer_id: peerId,
        count: 200,
        rev: 1
      });

      const messages = response.items;

      // Фильтруем сообщения, оставляем только те, которые отправлены за последние 24 часа и принадлежат пользователю
      const filteredMessages = messages.filter(message => {
        return message.date * 1000 > yesterday && message.from_id === userId;
      });

      // Если больше нет сообщений, выходим из цикла
      if (filteredMessages.length === 0) {
        break;
      }

      messagesToDelete = messagesToDelete.concat(filteredMessages);

      offset += 200; // Увеличиваем смещение для следующего запроса
    }

    // Удаляем отфильтрованные сообщения
    for (const message of messagesToDelete) {
      await vk.api.messages.delete({
        message_ids: message.id,
        delete_for_all: 1 // Удаляем для всех участников беседы
      });
      
      countMsg++
    }

    await context.send(`⚠ Удалено ${countMsg} сообщений [id${context.replyMessage.senderId}|пользователя] за последние 24 часа`)
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}

module.exports = {
  command: '/delete',
  aliases: ['/del', '/удалить', '/clear', '/чистка', '/очистка'],
  description: 'null',
  async execute(context) {
	const { peerId, senderId, text } = context;
    const senderUserRole = await getUserRole(peerId, senderId);
    if (senderUserRole < 20) {
      return context.reply('❌ Отказано, ваша роль слишком низкая для использования этой команды.');
    }
	console.log(context.replyMessage)
	    /*await vk.api.messages.delete({
        peer_id: context.peerId,
        delete_for_all: 1,
        cmids: context.replyMessage.conversationMessageId,
      });
	    await vk.api.messages.delete({
        peer_id: context.peerId,
        delete_for_all: 1,
        cmids: context.conversationMessageId,
      });*/

      deleteMessages(context, context.peerId, context.replyMessage.senderId)
  }
}