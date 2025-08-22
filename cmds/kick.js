const { checkUserRole, getRoleName } = require('./roles.js');
const database = require('../databases.js'); // Подключение к базе данных

const util = require('util')
const databaseQuery = util.promisify(database.query);

module.exports = {
    command: '/kick',
    aliases: ['/кик'],
    description: 'Кик пользователя из чата',
    async execute(context) {
        const messageText = context.text;
		const { peerId } = context
        const parts = messageText.split(' ');   
        if (context.replyMessage) {
			
        const target = context.replyMessage.senderId;
        
        const senderUserRole = await checkUserRole(context.peerId, context.senderId);
        
        if (senderUserRole < 20) {
            const roleName = getRoleName(senderUserRole);
            return context.reply(`❌ У вас нет прав на исключение пользователей. Ваша текущая роль: ${roleName}`);
        }

        if (!target) {
            context.reply('❌ Укажите пользователя для исключения.');
            return;
        }
        
        if (target === context.senderId) {
            context.reply('❌ Вы не можете исключить самого себя.');
            return;
        }

        const targetUserRole = await checkUserRole(context.peerId, target);

        if (targetUserRole >= senderUserRole) {
            const targetRoleName = getRoleName(targetUserRole);
            const senderRoleName = getRoleName(senderUserRole);
            return context.reply(`❌ Вы не можете исключить пользователя с ролью, равной или выше вашей. Роль пользователя: ${targetRoleName}. Ваша роль: ${senderRoleName}`);
        }
		
		if(target === '-222532223') {
			return context.reply('Данного пользователя запрещено исключать')
		}
        try {
            const kickResult = await vk.api.messages.removeChatUser({
                chat_id: context.chatId,
                member_id: target,
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
			await databaseQuery(deleteNickQuery, [target]);
			await databaseQuery(deleteRoleQuery, [target]);

            console.log('Kick Result:', kickResult);

            const username = await getUsername(target);
            context.reply(`[id${target}|${username}] был исключен из чата [id${context.senderId}|администратором].`);
        } catch (error) {
            console.error(error);
            context.reply('Произошла ошибка при кике пользователя.');
        }
		} else {
		
        const target = parts[1];
        
        const senderUserRole = await checkUserRole(context.peerId, context.senderId);
        
        if (senderUserRole < 2) {
            const roleName = getRoleName(senderUserRole);
            return context.reply(`❌ У вас нет прав на кик пользователей. Ваша текущая роль: ${roleName}`);
        }

        if (!target) {
            context.reply('❌ Укажите пользователя для кика.');
            return;
        }

        const numericId = await extractNumericId(target);
        
        if (numericId === context.senderId) {
            context.reply('❌ Вы не можете кикнуть самого себя.');
            return;
        }

        const targetUserRole = await checkUserRole(context.peerId, numericId);

        if (targetUserRole >= senderUserRole) {
            const targetRoleName = getRoleName(targetUserRole);
            const senderRoleName = getRoleName(senderUserRole);
            return context.reply(`❌ Вы не можете кикнуть пользователя с ролью, равной или выше вашей. Роль пользователя: ${targetRoleName}. Ваша роль: ${senderRoleName}`);
        }

        try {
            const kickResult = await vk.api.messages.removeChatUser({
                chat_id: context.chatId,
                member_id: numericId,
            });
            
            console.log('Kick Result:', kickResult);

            const username = await getUsername(numericId);
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
			await databaseQuery(deleteNickQuery, [numericId]);
			await databaseQuery(deleteRoleQuery, [numericId]);

            context.reply(`✅️ [id${numericId}|${username}] был исключен из чата [id${context.senderId}|администратором].`);
        } catch (error) {
            console.error(error);
            context.reply('Произошла ошибка при кике пользователя.');
        }
    }
	}
};
