const mysql = require('mysql2');

// Конфигурация подключения к базе данных
const dbConfig = {
  host: '51.91.215.125', // або адреса сервера бази даних
  user: 'gs310366', // ваш користувач бази даних
  password: 'DAJrtad34mM1', // ваш пароль до бази даних
  database: 'gs310366' // назва вашої бази даних
  };

// Создание пула подключения
const connectionPool = mysql.createPool(dbConfig);

// Экспорт функций для работы с базой данных
module.exports = {
  query(sql, values, callback) {
    return connectionPool.query(sql, values, callback);
  },

  // Другие методы для работы с базой данных
};