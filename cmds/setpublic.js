const database = require('../databases.js');
const util = require('util');
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName } = require('./roles.js');

const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/setpublic',
  aliases: ['/setpublic'],
  description: 'Установка группы для беседы',
  async execute(context) {
    const messageText = context.text;
    const { peerId, senderId, replyMessage } = context;
    const conferenceId = peerId;
    const parts = messageText.split(' ');
    const senderUserRole = await getUserRole(conferenceId, senderId);
	
      if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
        console.error('Таблица никнеймов не существует');
        console.log(`nicknames_${conferenceId}`);
        return context.send('❌ Ваша беседа не зарегистрирована!');
      }
    if (senderUserRole < 60) {
      return context.send('У вас нет прав на установку группы');
    }

    if (!parts[1]) {
      return context.send('Для настройки группы используйте:\n\nПример установки группы: /setpublic [ссылка на группу]');
    }

    const link = parts[1];

    // Проверка на корректность ссылки
    if (!link.startsWith('https://vk.com/')) {
      return context.send('Укажите правильную ссылку на группу VK (начиная с https://vk.com/)');
    }

    const groupId = link.replace('https://vk.com/', '');

    try {
      const groupInfo = await vk.api.groups.getById({ group_id: groupId });

      if (!groupInfo || groupInfo.length === 0) {
        return context.send('Группа не найдена.');
      }

      const publicId = groupInfo[0].id;

      // Запрос к базе данных для сохранения приветствия
      const query = 'INSERT INTO conference (conference_id, public) VALUES (?, ?) ON DUPLICATE KEY UPDATE public = VALUES(public)';
      await queryAsync(query, [conferenceId, publicId]);
      await context.send(`
	  Вы успешно установили проверку на паблик

Для проверки всех участников на подписку, используйте команду /checkpublic
В случае, если пользователь не подписан на указанный паблик, он автоматически исключается
`);
    } catch (error) {
      console.error('Ошибка при установке публичной страницы:', error);
      await context.send('Произошла ошибка при установке публичной страницы.');
    }
  },
};
