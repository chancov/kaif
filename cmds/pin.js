const { getUserRole, checkIfTableExists } = require('./roles.js');

module.exports = {
  command: '/pin',
  aliases: ['/pin'],
  description: 'Закрепить сообщение',
  async execute(context) {
    const senderRoleId = await getUserRole(context.peerId, context.senderId);
    if (!await checkIfTableExists(`roles_${context.peerId}`)) {
      return context.reply('❌ Беседа не активирована');
    }

    if (senderRoleId < 60) {
      return context.reply(`❌ У вас нет прав на закрепление сообщений`);
    }
    if (!context.replyMessage) {
      return context.reply('❌ Вы не ответили на сообщение, которое требуется закрепить');
    }

    try {
      const pinMessage = await vk.api.messages.pin({
        peer_id: context.peerId,
        conversation_message_id: context.replyMessage.conversationMessageId
      });
    } catch (error) {
      return context.reply('❌ У меня нет прав, чтобы закрепить сообщение :( ');
    }
  }
}