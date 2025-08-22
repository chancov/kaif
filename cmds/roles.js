// roles.js
const database = require('../databases.js');

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
    const rolesTableName = `tech`;
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
      if (results && results[0] && results[0].agent) {
      console.log(results[0].agent)
        resolve(results[0].agent);
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

module.exports = {
  checkUserRole,
  checkIfTableExists,
  getUserRole,
  getRoleName,
  getRoleNamezov,
  getDeviceName,
  getpoolkey,
  getUserVip,
  getUserTech,
  getUserVipStatus,
  getAgentInfo
}
