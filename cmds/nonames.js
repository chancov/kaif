const database = require('../databases.js');
const { checkUserRole, checkIfTableExists } = require('./roles.js');

module.exports = {
  command: '/nonames',
  aliases: ['/nonames'],
  description: 'Отображение пользователей без никнеймов',
  async execute(context) {
    const conferenceId = context.peerId;
    
    if (!await checkIfTableExists(`nicknames_${conferenceId}`)) {
      console.error('Таблица никнеймов не существует');
      return context.send('❓ Ваша беседа не зарегистрирована!');
    }
    
    const hasPermission = await checkUserRole(context.peerId, context.senderId, 'модератор');
    
    if (!hasPermission) {
      context.reply('❌ У вас нет прав на выполнение этой команды.');
      return;
    }
    
    // Поиск никнеймов в базе данных
    const selectNicknamesQuery = `
      SELECT user_id, nickname FROM nicknames_${conferenceId}
    `;

    database.query(selectNicknamesQuery, async (error, results) => {
      if (error) {
        console.error('Ошибка при выводе списка никнеймов:', error);
        return context.send('❌ Произошла ошибка при выполнении команды.');
      }

      const conversationMembers = await vk.api.messages.getConversationMembers({
        peer_id: context.peerId,
      });
      
      const usersWithNickname = results.map(result => String(result.user_id));
      const usersWithoutNickname = conversationMembers.profiles.filter(profile => !usersWithNickname.includes(String(profile.id)));

      if (usersWithoutNickname.length === 0) {
        return context.send('✔️ Все пользователи имеют никнеймы.');
      }

      let message = '❌ Пользователи без никнеймов:\n\n';
      usersWithoutNickname.forEach((profile, index) => {
        const name = `@id${profile.id} (${profile.first_name} ${profile.last_name})`;
        message += `${index + 1}. ${name}\n`;
      });

      context.send(message);
    });
  },
};
