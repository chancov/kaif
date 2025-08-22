const database = require('../databases.js');
const { checkUserRole, checkIfTableExists, getlink } = require('../util.js');

const util = require('util');
const databaseQuery = util.promisify(database.query);

module.exports = {
  command: '/rnick',
  aliases: ['/rnick'],
  description: 'rnick',
  async execute(context) {
    const messageText = context.text;
    const { peerId } = context;
    const conferenceId = peerId;
    const parts = messageText.split(' ');
    const target = context.replyMessage ? context.replyMessage.senderId : parts[1];
    const userId = target || (context.replyMessage ? context.replyMessage.senderId : context.senderId);
    const label = parts.slice(1).join(' ')
    if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
      console.error('Таблица никнеймов не существует');
      return context.send('Ваша беседа не зарегистрирована!');
    }
    const hasPermission = await checkUserRole(context.peerId, context.senderId, 'модератор');
    
    if (!hasPermission) {
      context.reply('❌ У вас нет прав на выполнение этой команды.');
      return;
    }
    if (context.replyMessage) {
      if (!userId) {
        context.reply('❌ Укажите пользователя для удаления никнейма.');
        return;
      }

      // Поиск никнейма в базе данных
      const selectNicknameQuery = `
        SELECT nickname FROM nicknames_${conferenceId}
        WHERE user_id = ?
      `;
		const selectResults = await databaseQuery(selectNicknameQuery, context.senderId);
		const sendernick = (selectResults[0] && selectResults[0].nickname) || 'Пользователь';

      database.query(selectNicknameQuery, [userId], (error, results) => {
        if (error) {
          console.error('Ошибка при поиске никнейма:', error);
          return context.send('Произошла ошибка.');
        }

        if (results.length > 0) {
          const userNickname = results[0].nickname;

          // Удаление никнейма из базы данных
          const deleteNicknameQuery = `
            DELETE FROM nicknames_${conferenceId}
            WHERE user_id = ?
          `;
          database.query(deleteNicknameQuery, [userId], async (error, result) => {
            if (error) {
              console.error('Ошибка при удалении никнейма:', error);
              return context.send('Произошла ошибка.');
            }
            const name = await getlink(userId)
            context.reply(`[id${context.senderId}|${sendernick}] удалил никнейм [id${userId}|пользователя].`);
          });
        } else {
          context.reply('❌ У данного пользователя нет никнейма для удаления.');
        }
      });
    } else {
      if (!label) {
        context.reply('❌ Укажите пользователя для удаления никнейма.');
        return;
      }

      const label2 = await extractNumericId(label);
      // Поиск никнейма в базе данных
      const selectNicknameQuery = `
        SELECT nickname FROM nicknames_${conferenceId}
        WHERE user_id = ?
      `;
	  
  	const selectResults = await databaseQuery(selectNicknameQuery, context.senderId);
	const sendernick = (selectResults[0] && selectResults[0].nickname) || 'Пользователь';

      database.query(selectNicknameQuery, [label2], (error, results) => {
        if (error) {
          console.error('Ошибка при поиске никнейма:', error);
          return context.send('❌ Произошла ошибка.');
        }
  
        if (results.length > 0) {
  
          // Удаление никнейма из базы данных
          const deleteNicknameQuery = `
            DELETE FROM nicknames_${conferenceId}
            WHERE user_id = ?
          `;
  
          database.query(deleteNicknameQuery, [label2], async (error, result) => {
            if (error) {
              console.error('Ошибка при удалении никнейма:', error);
              return context.send('❌ Произошла ошибка.');
            }
            const name = await getlink(label2)
            context.reply(`✅️ [id${context.senderId}|${sendernick}] удалил никнейм [id${label2}|пользователя].`);
          });
        } else {
          context.reply('❌ У данного пользователя нет никнейма для удаления.');
        }
      });
    }
  }
};
