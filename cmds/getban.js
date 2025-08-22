const database = require('../databases.js');
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName, getRoleNamezov } = require('./roles.js');

module.exports = {
  command: '/getban',
  aliases: ['/получитьбан'],
  description: 'Проверить, заблокирован ли пользователь',
  async execute(context) {
    const messageText = context.text;
    const parts = messageText.split(' ');   
    const { peerId, senderId, replyMessage, text } = context;
	console.log(text)
    const conferenceId = peerId

    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.send('❌ Беседа не зарегистрирована!');
    }
	
    const senderUserRole = await getUserRole(peerId, senderId);

    if (senderUserRole < 20) {
      return context.reply('❌ Отказано, ваша роль слишком низкая для использования этой команды.');
    }
	
    let target;
    if (replyMessage) {
      target = replyMessage.senderId; 
    } else {
      target = await await extractNumericId(parts[1]); // Получение таргета
    }
    if (!target) {
      context.reply('❌ Укажите пользователя для проверки.');
      return;
    }
	
    try {
      const selectBlockedUsersQuery = `
        SELECT blocked_users
        FROM conference_${conferenceId}
        WHERE user_id = ?
      `;

      database.query(selectBlockedUsersQuery, [target], async (error, results) => {
        if (error) {
          console.error('Ошибка при выборке заблокированных пользователей:', error);
          return context.send('Произошла ошибка при выборке заблокированных пользователей.');
        }

		  if (results.length === 0 || !results[0].blocked_users) {
			context.reply(`[id${target}|Пользователь] не заблокирован.`);
			return;
		  }
		  
        const blockedUsers = results.length > 0 ? JSON.parse(results[0].blocked_users) : [];

        const userBlock = blockedUsers.find(block => block.blocked_user_id === target);

        if (userBlock) {
          const dateObj = new Date(userBlock.block_until);
          const formattedDate = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' });
		      let bloker = await getlink(userBlock.blocked_by)
          context.reply(`❓ Информация о блокировке [id${userBlock.blocked_user_id}|пользователя]:\n🔸 Заблокирован до: ${formattedDate}\n🔸 Причина блокировки: ${userBlock.reason}\n🔸 Администратор: ${bloker}`);
        } else {
          context.reply(`[id${target}|Пользователь] не заблокирован.`);
        }
      });
    } catch (error) {
      console.error(error);
      context.reply('Произошла ошибка при проверке блокировки пользователя.');
    }
  }
};
