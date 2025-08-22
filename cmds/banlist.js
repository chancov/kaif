const database = require('../databases.js');
const { checkUserRole, checkIfTableExists, getUserRole, getRoleName, getRoleNamezov } = require('./roles.js');

module.exports = {
  command: '/banlist',
  aliases: ['/списокбанов'],
  description: 'Получить список заблокированных пользователей',
  async execute(context) {
    const { peerId, senderId } = context;
    const conferenceId = peerId;

    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.send('❓ Беседа не активирована! Для активации беседы, введите /start');
    }

    const senderUserRole = await getUserRole(peerId, senderId);

    if (senderUserRole < 20) {
      return context.reply('❓ У вас недостаточно прав для использования этой команды!\n❓ Минимальная роль для использования команды: Модератор');
    }

    try {
      const selectAllUsersQuery = `
        SELECT user_id, blocked_users
        FROM conference_${conferenceId}
      `;

      database.query(selectAllUsersQuery, async (error, results) => {
        if (error) {
          console.error('Ошибка при выборке пользователей:', error);
          return context.send('Произошла ошибка при выборке пользователей.');
        }

        const banList = [];
        const userIds = results.map(nickInfo => nickInfo.user_id);

        try {
          const userInfos = await vk.api.users.get({ user_ids: userIds });
			
          const userMap = userInfos.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});

          for (const result of results) {
            const userId = result.user_id;
            const blockedUsers = result.blocked_users ? JSON.parse(result.blocked_users) : [];

            for (const block of blockedUsers) {
              if (block.blocked_user_id) {
                // Проверка наличия blocked_user_id для определения заблокированных пользователей
                banList.push({
                  userId,
                  blockedUserId: block.blocked_user_id,
                  blockedBy: block.blocked_by,
                  blockUntil: block.block_until,
                  reason: block.reason,
                });
              }
            }
          }

          if (banList.length === 0) {
            context.reply('🔇 Список заблокированных пользователей пуст.');
          } else {
            const formattedBanList = banList.map((block, index) => {
              const userInfo = userMap[block.blockedUserId];
              return `${index + 1}. [id${block.blockedUserId}|${userInfo.first_name} ${userInfo.last_name}]`;
            });

            context.reply(`🔇 Список заблокированных пользователей:\n\n${formattedBanList.join('\n')}`);
          }
        } catch (error) {
          console.error(error);
          context.reply('Произошла ошибка при получении списка заблокированных пользователей.');
        }
      });
    } catch (error) {
      console.error(error);
      context.reply('Произошла ошибка при выполнении команды.');
    }
  },
};
