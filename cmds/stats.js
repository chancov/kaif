const database = require("../databases.js");
const {
  checkUserRole,
  checkIfTableExists,
  getUserRole,
  getRoleName,
  getRoleNamezov,
  getUserVipStatus,
} = require("./roles.js");

module.exports = {
  command: "/stats",
  aliases: ["/stats"],
  description: "Статистика пользователя",
  async execute(context) {
    const { peerId, senderId, text, replyMessage } = context;
    const senderUserRole = await getUserRole(peerId, senderId);
    if (senderUserRole < 20) {
      return context.reply(
        "❌ Отказано, ваша роль слишком низкая для использования этой команды."
      );
    }
    let target;
    let targetUserRole;
    if (replyMessage) {
      const parts = text.split(" ");
      target = replyMessage.senderId;
      targetUserRole = await getUserRole(peerId, target);
    } else {
      const parts = text.split(" ");
      target = await extractNumericId(parts[1]);
      console.log(target);
      targetUserRole = await getUserRole(peerId, target);
    }

    if (!(await checkIfTableExists(`conference_${peerId}`))) {
      console.error("Таблица не существует");
      return context.send("❌ Беседа не зарегистрирована!");
    }

    if (!target) {
      return context.reply(
        "❌ Укажите пользователя, чья статистика вам нужна."
      );
    }

    // Получите информацию о пользователе из базы данных
    const selectUserInfoQuery = `
      SELECT messages_count, warns
      FROM conference_${peerId}
      WHERE user_id = ?
    `;

    database.query(selectUserInfoQuery, [target], async (error, results) => {
      if (error) {
        console.error("Ошибка при запросе информации о пользователе:", error);
        return context.send("❌ Произошла ошибка.");
      }

      if (results.length === 0) {
        // Пользователь не найден в базе данных
        return context.reply("❌ Информация о данном пользователе не найдена.");
      }

      const { messages_count, warns } = results[0];

      const rolename = getRoleName(targetUserRole);
      const warnsCountText = warns !== null ? warns : 0;
      const messagesCountText = messages_count !== null ? messages_count : 0;
      const vipstatus = await getUserVipStatus(target);
      const conversationInfo = await vk.api.messages.getConversationMembers({
        peer_id: peerId,
      });

      const currentUserInfo = conversationInfo.items.find(
        (item) => item.member_id === target
      );
      let date = new Date(currentUserInfo.join_date * 1000);

      var monthNames = [
        "января",
        "февраля",
        "марта",
        "апреля",
        "мая",
        "июня",
        "июля",
        "августа",
        "сентября",
        "октября",
        "ноября",
        "декабря",
      ];

      var day = date.getDate();
      var month = monthNames[date.getMonth()];
      var year = date.getFullYear();
      var hours = date.getHours();
      var minutes = date.getMinutes();

      var formattedDate = `${day} ${month} ${year} года в ${hours}:${minutes}`;

      const responseMessage = `⭐ Информация о [id${target}|пользователе]:\n\n🔸 Статус: ${rolename} ${vipstatus}\n🔸 Количество сообщений: ${messagesCountText}\n🔸 Предупреждения: ${warnsCountText}/3\n🔸 Дата приглашения: ${formattedDate}`;
      context.send(responseMessage);
    });
  },
};
