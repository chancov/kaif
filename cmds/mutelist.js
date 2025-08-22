const database = require('../databases.js');
const { checkUserRole, checkIfTableExists } = require('./roles.js');

module.exports = {
  command: '/mlist',
  aliases: ['/mutelist', '!mutelist', '!mlist'],
  description: 'Список заглушенных пользователей',
  async execute(context) {
    const { peerId, senderId } = context;

    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.send('❓ Беседа не активирована! Для активации беседы, введите /start');
    }

    const senderUserRole = await checkUserRole(peerId, senderId);

    if (senderUserRole < 20) {
      return context.reply('❓ У вас недостаточно прав для использования этой команды!\n❓ Минимальная роль для использования команды: Модератор');
    }

    const mutedUsersForConference = mutedUsersInfo[peerId];

    if (!mutedUsersForConference || Object.keys(mutedUsersForConference).length === 0) {
      return context.reply('🔇 Заглушенные пользователи отсутствуют!');
    }

    let replyMessage = '🔇 Список заглушенных пользователей:\n';
    let index = 1;

    for (const numericId in mutedUsersForConference) {
      const muteInfo = mutedUsersForConference[numericId];
      const muteUntil = new Date(muteInfo.mute_until);
      const formattedDate = formatDate(muteUntil);
      const mutedUser = `🔸 ${index}. [id${muteInfo.muted_user_id}|Пользователь] - До: ${formattedDate}\n`;
      replyMessage += mutedUser;
      index++;
    }

    context.reply(replyMessage);
  },
};

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
