const { checkUserRole, checkIfTableExists, getUserRole, getRoleName, getRoleNamezov } = require('./roles.js');
const database = require('../databases.js');

module.exports = {
  command: '/warnhistory',
  description: 'Просмотр истории предупреждений пользователя',
  async execute(context) {
    const { peerId, text, replyMessage } = context;
    let target;

    if (replyMessage) {
      target = replyMessage.senderId;
    } else {
      target = text.split(' ')[1];
    }

    if (!target) {
      return context.reply('❌ Укажите пользователя, историю предупреждений которого хотите посмотреть.');
    }

    // Проверка наличия таблицы в базе данных
    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.send('❌ Беседа не зарегистрирована!');
    }

    const senderId = context.senderId;
    const senderRole = await getUserRole(peerId, senderId);
    const targetId = await extractNumericId(target);

    if (senderRole <= 20) {
      return context.reply('❌ Отказано, ваша роль слишком низкая для использования этой команды.');
    }

    if (!targetId) {
      return context.reply('❌ Укажите корректный идентификатор пользователя.');
    }

    const selectUserInfoQuery = `
      SELECT warns_history
      FROM conference_${peerId}
      WHERE user_id = ?
    `;

    database.query(selectUserInfoQuery, [targetId], (error, results) => {
      if (error) {
        console.error('Ошибка при запросе истории предупреждений:', error);
        return context.send('❌ Произошла ошибка.');
      }

      if (results.length === 0) {
        return context.reply('❌ Указанный пользователь не имеет истории предупреждений.');
      }

      const { warns_history } = results[0];
      const history = JSON.parse(warns_history);

      if (!Array.isArray(history) || history.length === 0) {
        return context.reply('❌ Указанный пользователь не имеет истории предупреждений.');
      }

	const formattedHistoryPromises = history.map(async (item, index) => {
	  const { Date: itemDate, Reason, Author } = item;
	  const formattedDate = new Date(itemDate).toLocaleString();
	  const pukikaki = await getlink(Author);
	  return `${index + 1}. ${Reason} | Выдал: ${pukikaki} (Дата: ${formattedDate})`;
	});

	Promise.all(formattedHistoryPromises)
	  .then((formattedHistory) => {
		context.reply(`📘 Список предупреждений [id${targetId}|пользователя]:\n\n${formattedHistory.join('\n')}`);
	  })
	  .catch((error) => {
		console.error('Ошибка при форматировании истории:', error);
		context.send('❌ Произошла ошибка при получении истории предупреждений.');
	  });
    });
  },
};
