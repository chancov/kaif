const util = require('util');
const { getUserRole, checkIfTableExists } = require('./roles.js');
const database = require('../databases.js');

const queryAsync = util.promisify(vk.api.groups.getById).bind(vk.api.groups);
const dbAsync = util.promisify(database.query).bind(database);

async function checkongroup(group_id, user_id) {
  console.log('ФУНКЦИЯ ВЫЗВАНА');
  const result = await vk.api.groups.isMember({
    group_id,
    user_id,
  });
  return result;
}

module.exports = {
  command: '/checkpublic',
  aliases: ['/checkpublic'],
  description: 'Проверка подписки участников на паблик',
  async execute(context) {
    try {
      const peerId = context.peerId;
      const senderUserRole = await getUserRole(peerId, context.senderId);
      const messageText = context.text;
      const parts = messageText.split(' ');

      if (senderUserRole < 60) {
        return context.send('У вас нет прав на проверку подписок на паблик.');
      }

      if (parts[1] === undefined) {
        await context.send(`
          Не указан тип работы.

          kick — Кикнуть всех, кто не подписан на сообщество.
          watch — Составить список тех, кто не подписан на сообщество.

          Пример: /checkpublic watch (составит список тех, кто отсутствует в установленном паблике)
        `);
        return;
      }

      if (!await checkIfTableExists(`nicknames_${peerId}`)) {
        console.error('Таблица никнеймов не существует');
        console.log(`nicknames_${peerId}`);
        return context.send('❌ Ваша беседа не зарегистрирована!');
      }

      const checkPublicQuery = 'SELECT public FROM conference WHERE conference_id = ?';
      const rows = await dbAsync(checkPublicQuery, [peerId]);

      if (!rows[0] || !rows[0].public) {
        return context.send('Сообщество не было установлено.');
      }

      const groupId = rows[0].public;
      const membersResponse = await vk.api.messages.getConversationMembers({ peer_id: peerId });

      const usersNotInGroup = membersResponse.profiles.filter(async (member) => !await checkongroup(groupId, member.id));

      if (parts[1] === 'watch') {
        const message = usersNotInGroup.map((user, index) => `${index + 1}. @id${user.id} (${user.first_name} ${user.last_name})\n`).join('');
        await context.send(usersNotInGroup.length > 0 ? `Пользователи, не подписанные на группу:\n\n${message}` : 'Все пользователи подписаны на группу.');
      } else if (parts[1] === 'kick') {
        const usersToKick = usersNotInGroup.map(user => user.id);
        for (const userId of usersToKick) {
          try {
            await vk.api.messages.removeChatUser({ chat_id: peerId - 2000000000, user_id: userId });
            console.log(`Пользователь с ID ${userId} кикнут из беседы.`);
          } catch (error) {
            console.error(`Ошибка при кике пользователя с ID ${userId}:`, error);
          }
        }
        await context.send(usersToKick.length > 0 ? 'Пользователи, не подписанные на группу, были кикнуты из беседы.' : 'Все пользователи подписаны на группу.');
      } else {
        await context.send('Неизвестная команда.');
      }
    } catch (error) {
      console.error('Ошибка при выполнении команды /checkpublic:', error);
      await context.send('Произошла ошибка при выполнении команды.');
    }
  },
};
