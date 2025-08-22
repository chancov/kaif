const { checkUserRole, checkIfTableExists, getUserRole, getRoleName, getRoleNamezov } = require('./roles.js');

module.exports = {
    command: '/zov',
    aliases: ['/зов', '/вызов'],
    description: 'Массовое упоминание всех пользователей в беседе',
    async execute(context) {
        const messageText = context.text;
        const { peerId, senderId, replyMessage } = context;
        const parts = messageText.split(' ');
        const senderUserRole = await getUserRole(peerId, senderId);
        const reason = parts.slice(1).join(' ');
        const { checkUserRole, checkIfTableExists } = require('./roles.js');
        if (!await checkIfTableExists(`nicknames_${peerId}`)) {
            console.error('Таблица никнеймов не существует');
            return context.send('Ваша беседа не зарегистрирована!');
        }
        const conversationMembers = await vk.api.messages.getConversationMembers({
            peer_id: context.peerId,
        });

        if (senderUserRole < 20) {
            const roleName = getRoleName(senderUserRole);
            return context.reply(`❌ У вас нет прав на использование этой команды. Ваша текущая роль: ${roleName}`);
        }
        if (!reason) {
            return context.reply('❌ Вы не указали причину вызова');
        }

        const memberProfiles = conversationMembers.profiles; // Массив объектов с данными о пользователях
        let message = '';

        for (const member of memberProfiles) {
            const name = `[id${member.id}|☑️]`;
            message += `${name} `;
        }

        const role = await getRoleNamezov(senderUserRole);
        const pingMessage = await context.send(`Пинг: ${message}`);
		console.log(pingMessage)
		console.log(pingMessage.conversationMessageId)
		let pingidmsg = pingMessage.conversationMessageId
		console.log(pingidmsg)
        const editedMessage = `
	🔊 Вы были вызваны [id${senderId}|администратором] беседы.

Причина: ${reason}!​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬​⁬
`;
        await vk.api.messages.edit({
            peer_id: context.peerId,
            message: editedMessage,
            conversation_message_id: pingidmsg,
        });
    },
};
