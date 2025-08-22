const database = require('../databases.js');
const { checkUserRole, checkIfTableExists, getUserRole } = require('./roles.js');
const util = require('util');
const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/settings',
  description: 'Настройки беседы',
  execute: async (context) => {
    const { peerId, text, senderId, replyMessage } = context;
    const conferenceId = peerId;
    const messageText = context.text;
    const parts = messageText.split(' ');

    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.send('❌ Беседа не зарегистрирована!');
    }

    const senderUserRole = await getUserRole(peerId, context.senderId);

    if (senderUserRole < 80) {
      return context.reply('❌ Отказано, ваша роль слишком низкая для использования этой команды.');
    }

    try {
      const getHelloTextQuery = `
        SELECT *
        FROM conference
        WHERE conference_id = ?
      `;

      database.query(getHelloTextQuery, [peerId], async (error, results) => {
        if (error) {
          console.error('Ошибка при получении настроек беседы:', error);
          return context.send('Произошла ошибка при получении настроек беседы.');
        }

        const helloText = results[0] && results[0].hello_text ? results[0].hello_text : 'Не найдено';
        const kickUser = results[0] && results[0].kick_leave ? results[0].kick_leave : 0;
        const rules = results[0] && results[0].rules;
        const stickers = results[0] && results[0].stickers;
        const docs = results[0] && results[0].docs;
        const reposts = results[0] && results[0].reposts;
        const links = results[0] && results[0].links;
        const images = results[0] && results[0].images;
        const groups = results[0] && results[0].groups;
        const video = results[0] && results[0].video;
        const cooldown = results[0] && results[0].cooldown;

        let settingsInfo = `❓ Настройки чата\n`;

        if (kickUser === 1) {
          settingsInfo += '\n🔸 Исключение пользователя после выхода [kick_leave]: ✅';
        } else {
          settingsInfo += '\n🔸 Исключение пользователя после выхода [kick_leave]: ❌';
        }

        settingsInfo += `\n🔸 Статус правил: ${rules !== null ? '✅' : '❌'}`;
        settingsInfo += `\n🔸 Приветствие: ${helloText !== null ? '✅' : '❌'}`
        settingsInfo += `\n🔸 Запрет отправки стикеров в чате [stickers]: ${stickers ? '✅' : '❌'}`
        settingsInfo += `\n🔸 Запрет отправки документов в чате [docs]: ${docs ? '✅' : '❌'}`
        settingsInfo += `\n🔸 Запрет отправки репостов в чате [reposts]: ${reposts ? '✅' : '❌'}`
        settingsInfo += `\n🔸 Запрет отправки ссылок в чате [links]: ${links ? '✅' : '❌'}`
        settingsInfo += `\n🔸 Запрет отправки фотографий в чате [images]: ${images ? '✅' : '❌'}`
        settingsInfo += `\n🔸 Запрет отправки видеозаписей в чате [video]: ${video ? '✅' : '❌'}`
        settingsInfo += `\n🔸 Запрет добавления групп в чат [groups]: ${groups ? '✅' : '❌'}`
        settingsInfo += `\n🔸 Анти-спам система [spam]: Отключено`
        settingsInfo += `\n🔸 Задержка между сообщениями [cooldown]: ${cooldown} сек.`
        settingsInfo += `\n\n❓ Для настройки правил используйте команду: /новыеправила`
        settingsInfo += `\n❓ Для настройки приветствия используйте команду: /приветствие`
        settingsInfo += `\n❓ Для настройки запретов используйте: /settings [тип] [0 - выкл | 1 - вкл]`

        if (!parts[1]) {
          return context.reply(settingsInfo);
        }

        if (parts[1] === 'kick_leave') {
          if (!parts[2]) {
            return context.send('Используйте: /settings исключать [0|1]');
          }

          const newKickUser = parseInt(parts[2]);

          if (newKickUser !== 0 && newKickUser !== 1) {
            return context.send('Неверное значение. Используйте: 0 (нет) или 1 (да)');
          }

          try {
            const updateKickUserQuery = 'UPDATE conference SET kick_leave = ? WHERE conference_id = ?';
            await queryAsync(updateKickUserQuery, [newKickUser, conferenceId]);
            return context.send(`Исключать при выходе успешно обновлено: ${newKickUser === 1 ? '✅' : '❌'}`);
          } catch (error) {
            console.error('Ошибка при обновлении настроек исключения при выходе:', error);
            return context.send('Произошла ошибка при обновлении настроек исключения при выходе.');
          }
        } else if (parts[1] === 'stickers' || parts[1] === 'docs' || parts[1] === 'reposts' || parts[1] === 'links' || parts[1] === 'images' || parts[1] === 'groups' || parts[1] === 'video') {
          if (!parts[2]) {
            return context.send(`Используйте: /settings ${parts[1]} [0|1]`);
          }
        
          const newValue = parseInt(parts[2]); // Преобразование строки в число
        
          if (isNaN(newValue) || (newValue !== 0 && newValue !== 1)) {
            return context.send('❌ Неверное значение. Используйте: 0 (нет) или 1 (да)');
          }
        
          let settingName = '';
          switch (parts[1]) {
            case 'stickers':
              settingName = 'отправление стикеров';
              break;
            case 'docs':
              settingName = 'отправление документов';
              break;
            case 'reposts':
              settingName = 'отправление репостов';
              break;
            case 'links':
              settingName = 'отправление ссылок';
              break;
            case 'images':
              settingName = 'отправление изображений';
              break;
            case 'groups':
              settingName = 'добавление сообществ';
              break;
            case 'video':
              settingName = 'отправление видео';
              break;
            default:
              settingName = 'настроек';
          }
        
          try {
            const updateQuery = `UPDATE conference SET \`${parts[1]}\` = ? WHERE conference_id = ?`;
            await queryAsync(updateQuery, [newValue, conferenceId]);
            const successMessage = newValue ? `запрещено` : `разрешено`;
            return context.send(`✅ Теперь в чате ${successMessage} ${settingName}.`);
          } catch (error) {
            console.error(`Ошибка при обновлении настроек ${parts[1]}:`, error);
            return context.send(`Произошла ошибка при обновлении настроек ${parts[1]}.`);
          }
        }
         else if (parts[1] === 'cooldown') {
          if (!parts[2]) {
            return context.send(`Используйте: /settings cooldown [значение от 0 до 15]`);
          }
          
          const newCooldownValue = parseInt(parts[2]); // Преобразование строки в число
          
          if (isNaN(newCooldownValue) || newCooldownValue < 0 || newCooldownValue > 15) {
            return context.send('❌ Неверное значение! Введите значение от 0 до 15 сек.');
          }
          
          try {
            const updateCooldownQuery = 'UPDATE conference SET cooldown = ? WHERE conference_id = ?';
            await queryAsync(updateCooldownQuery, [newCooldownValue, conferenceId]);
            return context.send(`✅ Теперь задержка в этом чате равна ${newCooldownValue} сек.\n❓ Задержка не действует на пользователей с ролью «Модератор» и выше.`);
          } catch (error) {
            console.error('Ошибка при обновлении значения cooldown:', error);
            return context.send('Произошла ошибка при обновлении значения cooldown.');
          }
        }        
      });
    } catch (error) {
      console.error('Ошибка при обработке команды /settings:', error);
      context.send('Произошла ошибка при обработке команды /settings.');
    }
  },
};
