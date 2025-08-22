const database = require('../databases.js');
const { checkUserRole, checkIfTableExists } = require('./roles.js');

module.exports = {
  command: '/unmute',
  aliases: ['/размут', '/анмут'],
  description: 'Снять мут с пользователя',
  async execute(context) {
    const { peerId, senderId, text, replyMessage } = context;

    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.send('❌ Беседа не зарегистрирована!');
    }

    const senderUserRole = await checkUserRole(peerId, senderId);

    if (senderUserRole < 20) {
      return context.reply('❌ У вас нет прав на использование этой команды.');
    }

    let target;
    let numericId;

    if (replyMessage) {
      target = replyMessage.senderId;
      numericId = replyMessage.senderId;
    } else {
      const parts = text.split(' ');
      target = parts[1];
      numericId = await extractNumericId(parts[1]);
    }

    if (!target) {
      return context.reply('❌ Укажите пользователя для снятия мута.');
    }

    // Проверка наличия мута для пользователя
    /*const mutedUser = mutedUsersInfo[peerId] && mutedUsersInfo[peerId][numericId];
    if (!mutedUser) {
      return context.reply('❌ У пользователя нет мута в данной беседе.');
    }

    // Удаление информации о муте
    delete mutedUsersInfo[peerId][numericId];*/

    /*if(numericId == 828085713) {
      vk.api.messages.changeConversationMemberRestrictions({ peer_id: context.peerId, member_ids: numericId, action: "ro" })
      return context.reply(`❌ Запрещено снимать муты долбаебам, мут продлен до: навсегда`)
    }*/

    vk.api.messages.changeConversationMemberRestrictions({ peer_id: context.peerId, member_ids: numericId, action: "rw" })
    // Пример сообщения о снятии мута
    const message = `✅️ Вы сняли блокировку чата у [id${numericId}|пользователя].`;

    // Отправка сообщения о снятии мута
	context.reply(message)
	console.log(mutedUsersInfo)	
  },
};
