const database = require('../databases.js');
const crypto = require('crypto');

function generateUniqueKey() {
  const keyLength = 5;
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';

  for (let i = 0; i < keyLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    key += characters.charAt(randomIndex);
  }

  return key;
}

module.exports = {
  command: '/start',
  aliases: ['/старт'],
  description: 'start',
  async execute(context) {
    const { peerId, senderId } = context;
    const conferenceId = peerId;
    const conversationInfo = await vk.api.messages.getConversationMembers({
      peer_id: peerId,
    });

    const currentUserInfo = conversationInfo.items.find(item => item.member_id === senderId);
    console.log(currentUserInfo.is_owner);
    /*if (!currentUserInfo.is_owner && !currentUserInfo.is_admin) {
      return context.send('Вы не являетесь владельцем беседы');
    }*/

    const conferenceTableQuery = `
      CREATE TABLE IF NOT EXISTS conference (
        conference_id INT PRIMARY KEY,
        games INT DEFAULT 0,
        kick_leave INT DEFAULT 0,
        rules TEXT,
        public TEXT,
        uniquekey TEXT,
        hello_text TEXT
      )
    `;

    let uniqueKey = generateUniqueKey();
    const checkConferenceQuery = 'SELECT * FROM conference WHERE conference_id = ?';

    database.query(conferenceTableQuery, async (error) => {
      if (error) {
        console.error('Ошибка при создании таблицы conference:', error);
        return context.send('Произошла ошибка.');
      }

      database.query(checkConferenceQuery, [conferenceId], async (error, results) => {
        if (error) {
          console.error('Ошибка при запросе к базе данных:', error);
          return context.send('Произошла ошибка.');
        }

        if (results.length > 0) {
          return context.send('Беседа уже активирована');
        }

        const newConferenceData = {
          conference_id: conferenceId,
          uniquekey: uniqueKey,
        };

        const nicknamesTableQuery = `
          CREATE TABLE IF NOT EXISTS nicknames_${conferenceId} (
            user_id INT PRIMARY KEY,
            nickname VARCHAR(255)
          )
        `;

        database.query(nicknamesTableQuery, async (error) => {
          if (error) {
            console.error('Ошибка при создании таблицы ролей:', error);
            return context.send('Произошла ошибка.');
          }

          const insertConferenceQuery = 'INSERT INTO conference SET ?';
          database.query(insertConferenceQuery, newConferenceData, async (error, result) => {
            if (error) {
              console.error('Ошибка при вставке данных в базу данных:', error);
              return context.send('Произошла ошибка.');
            }

            const conferenceTableQuery = `
              CREATE TABLE IF NOT EXISTS conference_${conferenceId} (
                user_id INT PRIMARY KEY,
                messages_count INT,
                coins INT,
                blocked_users TEXT,
                warns INT,
                warns_history TEXT,
                vigs INT,
                vigs_history TEXT,
                chat_block BOOLEAN
              )
            `;

            database.query(conferenceTableQuery, async (error) => {
              if (error) {
                console.error('Ошибка при создании таблицы беседы:', error);
                return context.send('Произошла ошибка.');
              }

              const rolesTableQuery = `
                CREATE TABLE IF NOT EXISTS roles_${conferenceId} (
                  user_id INT PRIMARY KEY,
                  role_id INT
                )
              `;

              database.query(rolesTableQuery, async (error) => {
                if (error) {
                  console.error('Ошибка при создании таблицы ролей:', error);
                  return context.send('Произошла ошибка.');
                }

                const insertRoleQuery = `
                  INSERT INTO roles_${conferenceId} (user_id, role_id)
                  VALUES (?, ?)
                  ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
                `;

                database.query(insertRoleQuery, [senderId, 100], (error, result) => {
                  if (error) {
                    console.error('Ошибка при назначении роли "Владелец":', error);
                    return context.send('Произошла ошибка на роли.');
                  }

                  context.send(`🌀 Фантастически, теперь я могу управлять беседой.\n\n✨ Уникальный код чата: #${uniqueKey}\n🔨 Команды бота: https://vk.com/@ebal.space-help`);
                });
              });
            });
          });
        });
      });
    });
  },
};
