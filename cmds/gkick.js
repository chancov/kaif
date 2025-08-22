const { getUserRole, checkIfTableExists, getRoleName, getpoolkey } = require('./roles.js');
const database = require('../databases.js'); // Подключаем базу данных
const util = require('util');
const databaseQuery = util.promisify(database.query);

module.exports = {
  command: '/gkick',
  aliases: ['/gkick'],
  description: 'Исключить пользователя в пулле',
  async execute(context) {
    const senderRoleId = await getUserRole(context.peerId, context.senderId);
    const { peerId, senderId, replyMessage } = context;
    const messageText = context.text;
    const parts = messageText.split(' ');
    const target = replyMessage ? replyMessage.senderId : parts[1];
	const userId = target || (replyMessage ? replyMessage.senderId : senderId);
    let label = await extractNumericId(userId);

	if(senderRoleId < 60) {
		return context.send(`У вас недостаточно прав для исключения людей в пулле`)
	}
	
    if (replyMessage) {
      label = replyMessage.senderId;
    }
	
	if(!label) return context.send(`Вы не указали пользователя для исключения`)
	
	if(label === '-222532223') {
		return context.reply('Данного пользователя запрещено исключать')
	}
	
    const selectPoolQuery = `
      SELECT *
      FROM pools
      WHERE pool_peerIds LIKE ?
    `;

    try {
      const selectResults = await databaseQuery(selectPoolQuery, [`%${peerId}%`]);
      if (selectResults.length === 0) {
        return context.reply('❌ Пулл не найден.');
      }

      for (const pool of selectResults) {
        const poolPeerIds = JSON.parse(pool.pool_peerIds || '[]');

        for (const poolPeerId of poolPeerIds) {
          const senderRoleIdd = await getUserRole(poolPeerId, context.senderId);
		  console.log(poolPeerId)
		if (!(await checkIfTableExists(`roles_${poolPeerId}`))) {
		  continue;
		}
		  
          const chelikroleid = await getUserRole(poolPeerId, label);
		  
		if(senderRoleIdd <= chelikroleid) {
			continue;
		}
		if (senderRoleIdd < 60) {
			continue;
		}
		const conversationMembers = await vk.api.messages.getConversationMembers({
		  peer_id: poolPeerId,
		});

		const targetProfile = conversationMembers.profiles.find(profile => profile.id === parseInt(label));
		console.log(targetProfile)
          if (!targetProfile) {
            continue;
          }
            const kickResult = await vk.api.messages.removeChatUser({
                chat_id: context.chatId,
                member_id: label,
            });
			const rolesTable = `roles_${context.peerId}`;

			const deleteRoleQuery = `
			  DELETE FROM ${rolesTable}
			  WHERE user_id = ?;
			`;
			const nicknamesTable = `nicknames_${context.peerId}`;

			const deleteNickQuery = `
			  DELETE FROM ${nicknamesTable}
			  WHERE user_id = ?;
			`;
			await databaseQuery(deleteNickQuery, [label]);
			await databaseQuery(deleteRoleQuery, [label]);
			
            const username = await getUsername(label);
			context.reply(`[id${label}|${username}] был исключен из чатов пулла.`)
        }
      }
    } catch (error) {
      console.error('Ошибка при добавлении роли:', error);
      return context.send('❌ Произошла ошибка.');
    }
  }
};
