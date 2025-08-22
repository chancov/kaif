const { checkIfTableExists, getUserRole } = require('./roles.js');
const database = require('../databases.js');

module.exports = {
  command: '/warn',
  description: 'Выдать предупреждение пользователю',
  async execute(context) {
    const { peerId, senderId, text, replyMessage } = context;

    let target;
    let reason;
    if (replyMessage) {
      const parts = text.split(' ');
      reason = parts.slice(1).join(' ') || 'Без причины';
      target = replyMessage.senderId; // Using senderId from the replied message as the target
    } else {
      const parts = text.split(' ');
      target = await extractNumericId(parts[1]); // Extracting target from the message text
      reason = parts.slice(2).join(' ') || 'Без причины';
    }

    if (!target) {
      return context.reply(`❌ Необходимо указать причину.

Пример: /warn id1 Флуд.

Либо прикрепите сообщение человека, которому хотите дать предупреждение и укажите причину: /warn Флуд.`);
    }

    // Check if the table exists in the database
    if (!await checkIfTableExists(`conference_${peerId}`)) {
      console.error('Таблица не существует');
      return context.send('❌ Беседа не зарегистрирована!');
    }

    const senderUserRole = await getUserRole(peerId, senderId);
    const targetUserRole = await getUserRole(peerId, target);

    if (senderUserRole < 20) {
      return context.reply('❌ Отказано, ваша роль слишком низкая для использования этой команды.');
    }

    if (senderUserRole <= targetUserRole) {
      return context.reply('❌ Отказано, ваши права равны или ниже, чем у цели.');
    }

    const selectUserInfoQuery = `
      SELECT warns, warns_history
      FROM conference_${peerId}
      WHERE user_id = ?
    `;

    database.query(selectUserInfoQuery, [target], async (error, results) => {
      if (error) {
        console.error('Ошибка при запросе информации о пользователе:', error);
        return context.send('❌ Произошла ошибка.');
      }

      if (results.length === 0) {
        // User not found in the database, add them
        const insertUserInfoQuery = `
          INSERT INTO conference_${peerId} (user_id, warns, warns_history)
          VALUES (?, 1, '[{"Date": "${new Date().toLocaleString()}", "Reason": "${reason}", "Author": ${senderId}}]')
        `;

        database.query(insertUserInfoQuery, [target], (insertError, insertResult) => {
          if (insertError) {
            console.error('Ошибка при добавлении пользователя:', insertError);
            return context.send('❌ Произошла ошибка.');
          }
          context.reply(`У [id${target}|пользователя] теперь ⚠ [1/3] предупреждений.`);
        });
      } else {
        const { warns, warns_history, vigs } = results[0];
        const updatedWarns = warns + 1;

        // If updated warns count is greater than or equal to 3, remove the user from the chat
        if (updatedWarns >= 3) {

		const updateUserInfoQuery = `
		  UPDATE conference_${peerId}
		  SET warns = ?
		  WHERE user_id = ?
		`;

		database.query(updateUserInfoQuery, [0, target], (updateError, updateResult) => {
		  if (updateError) {
			console.error('Ошибка при обновлении информации о пользователе:', updateError);
			return context.send('❌ Произошла ошибка.');
		  }

            return context.reply('Пользователь получил максимальное количество предупреждений и исключен.');
          });
        } else {
          // Increase the warning count and update the history
          const currentDate = new Date().toLocaleString();
    const updatedHistory = warns_history ? JSON.parse(warns_history) : [];
          updatedHistory.push({
            Date: currentDate,
            Reason: reason,
            Author: senderId,
          });

          const updateUserInfoQuery = `
            UPDATE conference_${peerId}
            SET warns = ?, warns_history = ?
            WHERE user_id = ?
          `;

          database.query(updateUserInfoQuery, [updatedWarns, JSON.stringify(updatedHistory), target], (updateError, updateResult) => {
            if (updateError) {
              console.error('Ошибка при обновлении информации о пользователе:', updateError);
              return context.send('❌ Произошла ошибка.');
            }

            context.reply(`У [id${target}|пользователя] теперь ⚠ [${updatedWarns}/3] предупреждений.`);
          });
        }
      }
    });
  },
};
