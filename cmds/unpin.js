const { getUserRole, checkIfTableExists } = require('./roles.js');

module.exports = {
  command: '/unpin',
  aliases: ['/unpin'],
  description: 'Открепить сообщение',
  async execute(context) {
    const senderRoleId = await getUserRole(context.peerId, context.senderId);
    if (!await checkIfTableExists(`roles_${context.peerId}`)) {
      return context.reply('❌ Беседа не активирована');
    }

    if (senderRoleId < 60) {
      return context.reply(`❌ У вас нет прав на открепление сообщений`);
    }

    try {
      const pinMessage = await vk.api.messages.unpin({
        peer_id: context.peerId
      });
    } catch (error) {
      return context.reply('❌ У меня нет прав, чтобы открепить сообщение :( ');
    }
  }
}