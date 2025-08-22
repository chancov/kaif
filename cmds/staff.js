const database = require('../databases.js');
const { checkIfTableExists, getUserRole } = require('./roles.js');
const axios = require('axios');

module.exports = {
  command: '/staff',
  aliases: ['/staff'],
  description: 'Показать список администраторов и владельцев',
  async execute(context) {
    const { peerId } = context;
    const conferenceId = peerId;

    if (!await checkIfTableExists(`roles_${conferenceId}`)) {
      return context.send('❌ Ваша беседа не зарегистрирована!');
    }
    const senderRoleId = await getUserRole(context.peerId, context.senderId);
    if (senderRoleId < 20) {
      return context.reply('❌ Отказано, ваша роль слишком низкая для использования этой команды.');
    }
    const roles = {
      20: '🏹 Модератор',
      40: '🎩 Администратор',
      60: '🔥 Спец Админ',
      80: '🔱 Руководитель',
      100: '⚜️ Владелец',
    };
    const startTime = Date.now();
    const getStaffQuery = `
      SELECT user_id, role_id
      FROM roles_${conferenceId}
      WHERE role_id
      ORDER BY role_id DESC
    `;

    database.query(getStaffQuery, async (error, results) => {
      if (error) {
        console.error('Ошибка при запросе администраторов и владельцев:', error);
        return context.send('❌ Произошла ошибка.');
      }

      if (results.length === 0) {
        return context.send('❌ В данной беседе нет администраторов и владельцев.');
      }

      const userIds = results.map(row => row.user_id);


      const userInfos = await vk.api.users.get({ user_ids: userIds });

      const staffByRole = {};

      for (const row of results) {
        const { user_id, role_id } = row;
        const roleName = roles[role_id]; // Получение названия роли из числового значения
        const userInfo = userInfos.find(user => user.id === user_id);

        if (!staffByRole.hasOwnProperty(roleName) && userInfo) {
          staffByRole[roleName] = [];
        }

        if (userInfo) {
          staffByRole[roleName].push(`— [id${userInfo.id}|${userInfo.first_name} ${userInfo.last_name}]`);
        }
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;
      const executionTimeInSeconds = executionTime / 1000;

      let staffMessage = ``;
      for (const roleName of Object.keys(staffByRole)) {
        staffMessage += `${roleName}:\n${staffByRole[roleName].join('\n')}\n\n`;
      }

      if (staffMessage) {
        context.send({ message: staffMessage, disable_mentions: true });
      } else {
        context.send('❌ В данной беседе нет администраторов и владельцев.');
      }
    });
  },
};
