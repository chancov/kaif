const database = require('../databases.js');
const { checkUserRole, checkIfTableExists, getUserRole } = require('./roles.js');

module.exports = {
  command: '/mute',
  aliases: ['/мут', '!мут', '!mute'],
  description: 'Выдача блокировки чата пользователю',
  async execute(context) {
    const { peerId, senderId, text, replyMessage } = context;

    if (!await checkIfTableExists(`roles_${peerId}`)) {
      return context.send('❓ Беседа не активирована! Для активации беседы, введите /start');
    }

    const senderUserRole = await getUserRole(peerId, context.senderId);

    if (senderUserRole < 20) {
      return context.reply('❓ У вас недостаточно прав для использования этой команды!\n❓ Минимальная роль для использования команды: Модератор');
    }

    let target;
    let muteMinutes;
    let reason;
    let numericId;

    if (replyMessage) {
      const parts = text.split(' ');
      target = replyMessage.senderId;
      numericId = replyMessage.senderId;
      muteMinutes = parseInt(parts[1]) || 1;
      reason = parts.slice(2).join(' ') || 'Причина не указана ❌';
    } else {
      const parts = text.split(' ');
      target = parts[1];
      numericId = await extractNumericId(parts[1]); // Здесь не используется await extractNumericId, т.к. numericId уже содержит id пользователя
      muteMinutes = parseInt(parts[2]) || 1;
      reason = parts.slice(3).join(' ') || 'Причина не указана ❌';
    }

    if (!target) {
      return context.reply(`❓ Аргументы введены неверно, необходимо ввести время блокировки чата в секундах.\n❓ Пример: /mute @id1 3600`);
    }

    const targetUserRole = await getUserRole(peerId, target);

    if (senderUserRole <= targetUserRole) {
      return context.reply('❓ Вы не можете выдать блокировку чата данному пользователю');
    }

    const currentDate = new Date();
    const muteUntil = new Date(currentDate.getTime() + muteMinutes * 1000);
    
    const muteInfo = {
      muted_user_id: numericId,
      muted_by: senderId,
      mute_until: muteUntil,
      reason: reason,
    };
    
    if (!mutedUsersInfo[peerId]) {
      mutedUsersInfo[peerId] = {};
    }
    
    mutedUsersInfo[peerId][numericId] = muteInfo;
    
    vk.api.messages.changeConversationMemberRestrictions({ peer_id: context.peerId, member_ids: numericId, for: muteMinutes, action: "ro" });
    
    function formatDate(date) {
      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      let hours = date.getHours();
      let minutes = date.getMinutes();
      
      // Добавление ведущего нуля, если минуты меньше 10
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      
      return `${day} ${month} ${year} г. ${hours}:${minutes} МСК`;
    }
    
    const formattedDate = formatDate(muteUntil);
    context.reply(`🔇 [id${numericId}|Пользователю] запрещено отправлять сообщения до ${formattedDate}.\n❓ Причина: ${muteInfo.reason}`);
  },
};
