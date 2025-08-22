function getDeviceType(platform) {
  switch (platform) {
    case 1:
      return 'Мобильная версия';
    case 2:
      return 'Приложение для iPhone';
    case 3:
      return 'Приложение для iPad';
    case 4:
      return 'Приложение для Android';
    case 5:
      return 'Приложение для Windows Phone';
    case 6:
      return 'Приложение для Windows 10';
    case 7:
      return 'Полная версия сайта';
    default:
      return 'Неизвестно';
  }
}

const { getUserRole, checkIfTableExists } = require('./roles.js');

module.exports = {
  command: '/online',
  aliases: ['/онлайн'],
  description: 'Вывести список пользователей онлайн',
  async execute(context) {
    const { peerId } = context;
    const senderRoleId = await getUserRole(context.peerId, context.senderId);
    if (!await checkIfTableExists(`roles_${context.peerId}`)) {
      return context.reply('❌ Таблица ролей не существует');
    }

    if (senderRoleId < 20) {
      return console.log("пошел нахуй кек")
    }

    const conversationMembers = await vk.api.messages.getConversationMembers({
      peer_id: context.peerId,
    });

    const onlineMembers = conversationMembers.profiles.filter(member => member.online === 1);

    if (onlineMembers.length === 0) {
      return context.reply('Сейчас никто из участников не находится в сети.');
    }

    let message = '🖥️ Пользователи онлайн:\n\n';

    for (const member of onlineMembers) {
      const isMobile = member.online_info && member.online_info.is_mobile;
      const device = isMobile ? 'с мобильного устройства' : 'с ПК';
      const name = `[id${member.id}|${member.first_name} ${member.last_name}] - ${device}`;
      message += `${name}\n`;
    }

    context.reply({ message: message, disable_mentions: true });
  },
};
