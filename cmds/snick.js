const database = require('../databases.js');

const util = require('util');
const databaseQuery = util.promisify(database.query);

module.exports = {
  command: '/snick',
  aliases: ['/snick'],
  description: 'snick',
  async execute(context) {
    const messageText = context.text;
    const { peerId } = context;
    const conferenceId = peerId;
    const parts = messageText.split(' ');
    const target = context.replyMessage ? context.replyMessage.senderId : parts[1];
    const nickname = parts.slice(2).join(' ');
    const maybe1 = parts.slice(1).join(' ')
    const userId = target || (context.replyMessage ? context.replyMessage.senderId : context.senderId);
    const hasPermission = await utils.checkUserRole(context.peerId, context.senderId, 'модератор');
    if (!await utils.checkIfTableExists(`nicknames_${conferenceId}`)) {
      console.error('Таблица никнеймов не существует');
      return context.send('Ваша беседа не зарегистрирована!');
    }
    if (!hasPermission) {
      context.reply('❌ У вас нет прав на выполнение этой команды.');
      return;
    }
    
    let previousNickname = ''; // Переменная для хранения предыдущего никнейма
    
    // Создание таблицы никнеймов для конкретной беседы, если она не существует
    const nicknamesTableQuery = `
      CREATE TABLE IF NOT EXISTS nicknames_${conferenceId} (
        user_id INT PRIMARY KEY,
        nickname VARCHAR(255)
      )
    `;

    database.query(nicknamesTableQuery, async (error) => {
      if (error) {
        console.error('Ошибка при создании таблицы никнеймов:', error);
        return context.send('❌ Произошла ошибка.');
      }
      const numericId = await extractNumericId(userId);
      const usernameLink = await utils.getlink(numericId);

      const forbiddenWords = ['Россия', 'Украина', 'война', 'ракета', 'Ракета', 'Бомба']; // Добавьте нужные запрещенные слова

      if (forbiddenWords.some(word => nickname.includes(word))) {
        context.reply('❌ Нельзя использовать запрещенные слова в никнейме.');
        return;
      }

      if (context.replyMessage) {
        if (usernameLink !== null) {
          if (maybe1 === '') {
            context.reply(`Никнейм не может быть пустым.`);
          } else {
            // Поиск текущего никнейма в базе данных
            const selectNicknameQuery = `
              SELECT nickname FROM nicknames_${conferenceId}
              WHERE user_id = ?
            `;
		const selectResults = await databaseQuery(selectNicknameQuery, context.senderId);
		const sendernick = 'Пользователь'
            database.query(selectNicknameQuery, [userId], (error, results) => {
              if (error) {
                console.error('Ошибка при поиске никнейма:', error);
                return context.send('❌ Произошла ошибка.');
              }

              if (results.length > 0) {
                previousNickname = results[0].nickname; // Сохраняем предыдущий никнейм
                // Обновление текущего никнейма
                const updateNicknameQuery = `
                  UPDATE nicknames_${conferenceId}
                  SET nickname = ?
                  WHERE user_id = ?
                `;
                database.query(updateNicknameQuery, [maybe1, userId], (error, result) => {
                  if (error) {
                    console.error('Ошибка при обновлении никнейма:', error);
                    return context.send('❌ Произошла ошибка.');
                  }
                  context.reply(`✔️ [id${context.senderId}|${sendernick}] изменил ник [id${userId}|пользователю]: ${previousNickname} » ${maybe1}`);
                });
              } else {
                // Сохранение нового никнейма
                const insertNicknameQuery = `
                  INSERT INTO nicknames_${conferenceId} (user_id, nickname)
                  VALUES (?, ?)
                `;
                database.query(insertNicknameQuery, [userId, maybe1], (error, result) => {
                  if (error) {
                    console.error('Ошибка при сохранении никнейма:', error);
                    return context.send('❌ Произошла ошибка.');
                  }
                  context.reply(`✔️ [id${context.senderId}|${sendernick}] установил новый ник [id${userId}|пользователю]: ${maybe1}.`);
                });
              }
            });
          }
        } else {
          context.reply('❌ Кажется вы не упомянули пользователя :(');
        }
      } else {
        if (usernameLink !== null) {
          if (nickname === '') {
            context.reply(`❌ Никнейм не может быть пустым.`);
          } else {
            // Поиск текущего никнейма в базе данных
            const selectNicknameQuery = `
              SELECT nickname FROM nicknames_${conferenceId}
              WHERE user_id = ?
            `;
		const selectResults = await databaseQuery(selectNicknameQuery, context.senderId);
		const sendernick = 'Пользователь'
            database.query(selectNicknameQuery, [numericId], (error, results) => {
              if (error) {
                console.error('Ошибка при поиске никнейма:', error);
                return context.send('❌ Произошла ошибка.');
              }

              /*const forbiddenWords = ['Россия', 'Украина', 'война', 'ракета', 'Ракета', 'Бомба']; // Добавьте нужные запрещенные слова

              if (forbiddenWords.some(word => nickname.includes(word))) {
                context.reply('❌ Нельзя использовать запрещенные слова в никнейме.');
                return;
              }*/

              if (results.length > 0) {
                previousNickname = results[0].nickname; // Сохраняем предыдущий никнейм
                // Обновление текущего никнейма
                const updateNicknameQuery = `
                  UPDATE nicknames_${conferenceId}
                  SET nickname = ?
                  WHERE user_id = ?
                `;
                database.query(updateNicknameQuery, [nickname, numericId], (error, result) => {
                  if (error) {
                    console.error('Ошибка при обновлении никнейма:', error);
                    return context.send('❌ Произошла ошибка.');
                  }
				  
				context.reply(`✅️ [id${context.senderId}|${sendernick}] изменил ник [id${numericId}|пользователю]: ${previousNickname} » ${nickname}`);
                });
              } else {
                // Сохранение нового никнейма
                const insertNicknameQuery = `
                  INSERT INTO nicknames_${conferenceId} (user_id, nickname)
                  VALUES (?, ?)
                `;
                database.query(insertNicknameQuery, [numericId, nickname], (error, result) => {
                  if (error) {
                    console.error('Ошибка при сохранении никнейма:', error);
                    return context.send('❌ Произошла ошибка.');
                  }
                  context.reply(`✅️ [id${context.senderId}|${sendernick}] установил ник [id${numericId}|пользователю]: ${nickname}.`);
                });
              }
            });
          }
        } else {
          context.reply('Кажется вы не упомянули пользователя :(');
        }
      }
    });
  }
};
