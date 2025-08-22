// roles.js
const database = require('./databases.js');

const { API, resolveResource } = require('vk-io')

async function checkUserRole(conferenceId, userId) {
  return new Promise((resolve, reject) => {
    const rolesTableName = `roles_${conferenceId}`;
    const getUserRoleQuery = `
      SELECT role_id
      FROM ${rolesTableName}
      WHERE user_id = ?
    `;
    
    database.query(getUserRoleQuery, [userId], (error, results) => {
      if (error) {
        console.error('Ошибка при получении роли пользователя:', error);
        reject(error);
        return;
      }
      
      if (results && results[0] && results[0].role_id) {
        resolve(results[0].role_id);
      } else {
        resolve(null); // Пользователь не имеет роли
      }
    });
  });
}

async function getUserIdByUsername(username) {
  const matches = username.match(/^@(\w+)/);
  if (matches && matches[1]) {
    try {
      const users = await vk.api.users.get({ user_ids: matches[1] });
      if (users && users[0] && users[0].id) {
        return users[0].id;
      }
    } catch (error) {
      console.error('Ошибка при получении ID пользователя:', error);
    }
  }
  return null;
}

global.getUserIdByUsername = getUserIdByUsername
async function getUsername(userId) {
  try {
    const user = await vk.api.users.get({ user_ids: [userId] });
    return `${user[0].first_name} ${user[0].last_name}`;
  } catch (error) {
    console.error('Ошибка при получении информации о пользователе:', error);
    return null;
  }
}
global.getUsername = getUsername
async function getUserIdFromInput(input) {
  const numericIdMatch = input.match(/\[id(\d+)\|.*\]/);
  if (numericIdMatch && numericIdMatch[1]) {
    return numericIdMatch[1];
  }
  
  const usernameMatch = input.match(/@?(\w+)/);
  if (usernameMatch && usernameMatch[1]) {
    const user = await vk.api.users.get({ user_ids: usernameMatch[1] });
    if (user && user[0] && user[0].id) {
      return user[0].id;
    }
  }
  
  return null;
}
global.getUserIdFromInput = getUserIdFromInput

async function getAgentInfo(agent) {
  return new Promise((resolve, reject) => {
    const rolesTableName = `tech`;
    const getUserRoleQuery = `
      SELECT *
      FROM ${rolesTableName}
      WHERE user_id = ?
    `;
    
    database.query(getUserRoleQuery, [agent], (error, results) => {
      if (error) {
        console.error('Ошибка при получении роли пользователя:', error);
        reject(error);
        return;
      }
      if (results && results[0] && results[0].dostup) {
        resolve(results[0]);
      } else {
        resolve(null); // Пользователь не имеет роли
      }
    });
  });
}

async function getlink(userId) {
  try {
    let numericId = userId;
    if (typeof numericId === 'number') {
      // Преобразовать отрицательное число в его положительное представление
      if (numericId < 0) {
        numericId = Math.abs(numericId);
	  const groupInfo = await vk.api.groups.getById({
		group_ids: numericId,
		fields: 'name', // указываем, что нам нужно только название
	  });
        return `@club${numericId} (${groupInfo[0].name})`;
      } else {
        const user = await vk.api.users.get({ user_ids: [numericId] });
        return `[id${numericId}|${user[0].first_name} ${user[0].last_name}]`;
      }
    } else {
      numericId = extractNumericId(userId);
      if (numericId) {
        // Преобразовать отрицательное число в его положительное представление
        if (numericId < 0) {
          numericId = Math.abs(numericId);
		  const groupInfo = await vk.api.groups.getById({
			group_ids: numericId,
			fields: 'name', // указываем, что нам нужно только название
		  });
        return `@club${numericId} (${groupInfo[0].name})`;
        } else {
          const user = await vk.api.users.get({ user_ids: [numericId] });
          return `[id${numericId}|${user[0].first_name} ${user[0].last_name}]`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении информации о пользователе:', error);
    return null;
  }
}

async function getpoolkey(peerId) {
  const showTablesQuery = 'SHOW TABLES';
  const poolTables = await new Promise((resolve, reject) => {
    database.query(showTablesQuery, (error, results) => {
      if (error) {
        console.error('Ошибка при запросе таблиц:', error);
        reject(error);
      } else {
        const tables = results.map(result => result[`Tables_in_conference`]);
        resolve(tables);
      }
    });
  });

  for (const tableName of poolTables) {
    if (tableName.startsWith('pools_')) {
      const selectPoolQuery = `
        SELECT *
        FROM ${tableName}
        WHERE pool_peerIds LIKE ?
      `;

      const selectResults = await new Promise((resolve, reject) => {
        database.query(selectPoolQuery, [`%${peerId}%`], (selectError, selectResults) => {
          if (selectError) {
            console.error(`Ошибка при запросе информации о пулле из таблицы ${tableName}:`, selectError);
            reject(selectError);
          } else {
            resolve(selectResults);
          }
        });
      });

      if (selectResults.length > 0) {
        const pool = selectResults[0];
        const poolKey = pool.pool_key;
        return poolKey;
      }
    }
  }

  return null; // Если пулл не найден
}


async function getUserRole(conferenceId, userId) {
  return new Promise((resolve, reject) => {
    const rolesTableName = `roles_${conferenceId}`;
    const getUserRoleQuery = `
      SELECT role_id
      FROM ${rolesTableName}
      WHERE user_id = ?
    `;
    
    database.query(getUserRoleQuery, [userId], (error, results) => {
      if (error) {
        console.error('Ошибка при получении роли пользователя:', error);
        reject(error);
        return;
      }
      
      if (results && results[0] && results[0].role_id) {
        resolve(results[0].role_id);
      } else {
        resolve(null); // Пользователь не имеет роли
      }
    });
  });
}

async function getUserVip(userId) {
  return new Promise((resolve, reject) => {
    const rolesTableName = `vip_users`;
    const getUserRoleQuery = `
      SELECT *
      FROM ${rolesTableName}
      WHERE user_id = ?
    `;
    
    database.query(getUserRoleQuery, [userId], (error, results) => {
      if (error) {
        console.error('Ошибка при получении роли пользователя:', error);
        reject(error);
        return;
      }
      if (results && results[0] && results[0].vip) {
      console.log(results[0].vip)
        resolve(results[0].vip);
      } else {
        resolve(null); // Пользователь не имеет роли
      }
    });
  });
}

async function getUserTech(userId) {
  return new Promise((resolve, reject) => {
    const rolesTableName = `agents`;
    const getUserRoleQuery = `
      SELECT *
      FROM ${rolesTableName}
      WHERE user_id = ?
    `;
    
    database.query(getUserRoleQuery, [userId], (error, results) => {
      if (error) {
        console.error('Ошибка при получении роли пользователя:', error);
        reject(error);
        return;
      }
      if (results && results[0] && results[0].agent_access) {
      console.log(results[0].agent_access)
        resolve(results[0].agent_access);
      } else {
        resolve(null); // Пользователь не имеет роли
      }
    });
  });
}

async function getUserVipStatus(userId) {
  return new Promise((resolve, reject) => {
    const rolesTableName = `vip_users`;
    const getUserRoleQuery = `
      SELECT *
      FROM ${rolesTableName}
      WHERE user_id = ?
    `;
    
    database.query(getUserRoleQuery, [userId], (error, results) => {
      if (error) {
        console.error('Ошибка при получении роли пользователя:', error);
        reject(error);
        return;
      }
      if (results && results[0] && results[0].vip) {
        resolve("(VIP-Пользователь)");
      } else {
        resolve(""); // Пользователь не имеет роли
      }
    });
  });
}

async function checkIfTableExists(tableName) {
  const query = `SHOW TABLES LIKE '${tableName}'`;
  return new Promise((resolve) => {
    database.query(query, (error, results) => {
      if (error) {
        console.error('Ошибка при проверке существования таблицы:', error);
        resolve(false);
      } else {
        resolve(results.length > 0);
      }
    });
  });
}

function getRoleName(roleId) {
  const roles = {
    20: 'Модератор',
    40: 'Администратор',
    60: 'Спец. Администратор',
    80: 'Руководитель',
    100: 'Владелец',
    // Добавьте другие роли и их названия, если необходимо
  };
  
  return roles[roleId] || 'Пользователь';
}

function getRoleNamezov(roleId) {
  const roles = {
    20: 'Модератором',
    40: 'Администратором',
    60: 'Спец администратором',
    80: 'Руководителем',
    100: 'Владельцем',
    // Добавьте другие роли и их названия, если необходимо
  };
  
  return roles[roleId] || 'Пользователь';
}

function getDeviceName(platform) {
  switch (platform) {
    case 1:
      return 'Мобильная версия сайта или мобильное приложение';
    case 2:
      return 'Приложение для iPhone';
    case 3:
      return 'Приложение для iPad';
    case 4:
      return 'Приложение для Android';
    case 5:
      return 'Приложение для Windows Phone';
    case 6:
      return 'Приложение для Windows 10';
    case 7:
      return 'Полная версия сайта (ПК)';
    default:
      return 'Полная версия сайта (ПК)';
  }
}

async function extractNumericId(input) {
  try {
    const api = new API({
      token: 'vk1.a.rGKTOCIHaHSG4NCtx4GVxCOu67ydcX1WMy7dv-sTgV8jZSBts0x_XSwWKOmMD5dJFyhHfUIU3n49DIqXBBDU7MKay2263CoP8OXdGsFnO-ctqfm_WU0ZhRGYEQ65s5yn2SnIA58RVOGpqqB-zYYlP3Ur1iwMUDHhbW3R7zL_f8fkMzWDD94PMQnHW-zm4kPHbmqeJJMjOPLVq5zJ-iD9ug',
    });
    const resource = await resolveResource({ api, resource : input})
    if (resource.type === 'user') {
      return resource.id
    }
    if (typeof input === 'number') {
      return input;
    }

    if (typeof input !== 'string') {
      console.error('Неверный тип input:', typeof input);
      return null;
    }

    const idPattern = /\[id(\d+)\|.*\]/;
    const matches = input.match(idPattern);
    
    if (matches && matches.length > 1) {
      const numericId = matches[1];
      return parseInt(numericId, 10); // Преобразуем в числовой формат
    }
    
    return null;
  } catch(error) {
    return null
  }
}

global.extractNumericId = extractNumericId

global.getlink = getlink

module.exports = {
  checkUserRole,
  checkIfTableExists,
  getUserRole,
  getRoleName,
  getRoleNamezov,
  getDeviceName,
  getpoolkey,
  getUserVip,
  getUsername,
  getUserTech,
  getUserVipStatus,
  getAgentInfo,
  getlink,
  extractNumericId
}
