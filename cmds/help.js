const database = require('../databases.js');
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName } = require('./roles.js');
const { Keyboard } = require('vk-io');

module.exports = {
  command: '/help',
  aliases: ['/commands'],
  description: 'помощь по боту',
  async execute(context) {
    const builder = Keyboard.builder()
      .urlButton({
        label: 'Чат пользователей',
        url: 'https://vk.me/join/AJQ1d56Hbih3oZDBkL8JID/i'
      })
      .urlButton({
        label: 'Добавить бота в чат',
        url: 'https://vk.com/app6441755_-217049045?ref=group_menu'
      })
      .urlButton({
        label: 'Команды',
        url: 'https://vk.com/@ebal.space-help'
      });

    const keyboard = builder.inline();

    // Отправить сообщение с клавиатурой
    await context.send({
      message: '👋 Познакомиться с функционалом eBal Manager - легко!\n📖 Воспользуйтесь предложенными кнопками ниже, чтобы быстро перейти в нужный раздел',
      keyboard
    });
  }
};
