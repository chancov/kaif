const database = require('../databases.js');
const util = require('util');
const queryAsync = util.promisify(database.query).bind(database);

module.exports = {
  command: '/transfer',
  aliases: ['/переезд', '/переход'],
  description: 'Установка никнеймов пользователям',
  execute: async (context) => {
    try {
      const usersWithNicknames = [];

      const lines = context.replyMessage.text.split('\n');
	  
	  console.log(lines)
	  
      lines.forEach((line) => {
        const matches = line.match(/\[id(\d+)\|(.+?)\]\s*—\s*(.+)/);

        if (matches && matches.length === 4) {
          const userId = parseInt(matches[1]);
          const userName = matches[2].trim();
          const nickname = matches[3].trim();

          if (!isNaN(userId)) {
            usersWithNicknames.push({ userId, userName, nickname });
          }
        }
      });

      if (usersWithNicknames.length === 0) {
        return context.send('❌ Не найдены пользователи с никнеймами.');
      }

	const placeholders = usersWithNicknames.map(() => '(?, ?)').join(', ');
	const values = usersWithNicknames.reduce((acc, { userId, nickname }) => [...acc, userId, nickname], []);

	const insertNicknameQuery = `
	  INSERT INTO nicknames_${context.peerId} (user_id, nickname)
	  VALUES ${placeholders}
	  ON DUPLICATE KEY UPDATE nickname = VALUES(nickname)
	`;

	await queryAsync(insertNicknameQuery, values);


      return context.send('✅️ Переезд успешен.');
    } catch (error) {
      console.error('Ошибка при установке никнеймов:', error);
      context.send('❌ Произошла ошибка при установке никнеймов.');
    }
  },
};
