const { getUserRole } = require('./roles.js');
const axios = require('axios');
const cheerio = require('cheerio');

function formatRegistrationDate(timestamp) {
  if (!timestamp) return 'Неизвестно';
  
  try {
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return 'Неизвестно';

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedDay}.${formattedMonth}.${year} в ${hours}:${formattedMinutes}`;
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return 'Неизвестно';
  }
}

async function extractNumericId(input) {
  if (!input) return null;
  
  if (/^\d+$/.test(input)) {
    return parseInt(input);
  }
  
  const idMatch = input.match(/\[id(\d+)\|/);
  if (idMatch) {
    return parseInt(idMatch[1]);
  }
  
  const screenNameMatch = input.match(/^(?:https?:\/\/)?vk\.com\/([a-zA-Z0-9_.]+)/);
  if (screenNameMatch) {
    try {
      const response = await axios.get(`https://api.vk.com/method/users.get`, {
        params: {
          user_ids: screenNameMatch[1],
          access_token: process.env.VK_TOKEN,
          v: '5.131'
        }
      });
      
      if (response.data.response && response.data.response[0]) {
        return response.data.response[0].id;
      }
    } catch (error) {
      console.error('Ошибка получения ID:', error);
    }
  }
  
  return null;
}

// Сервис 1: VK.watch (работает через парсинг страницы)
async function getRegistrationDateFromVKWatch(userId) {
  try {
    const response = await axios.get(`https://vk.watch/user/${userId}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Ищем дату регистрации в странице
    const registrationText = $('*:contains("Дата регистрации")').first().text();
    const dateMatch = registrationText.match(/(\d{2}\.\d{2}\.\d{4})/);
    
    if (dateMatch) {
      return dateMatch[1];
    }

    // Альтернативный поиск
    $('td, div, span').each((i, element) => {
      const text = $(element).text();
      if (text.includes('регистрация') || text.includes('зарегистрирован')) {
        const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
        if (dateMatch) return dateMatch[1];
      }
    });

    return null;
  } catch (error) {
    console.error('Ошибка VK.watch:', error.message);
    return null;
  }
}

// Сервис 2: VK.com через парсинг мобильной версии
async function getRegistrationDateFromMobile(userId) {
  try {
    const response = await axios.get(`https://m.vk.com/id${userId}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });

    const $ = cheerio.load(response.data);
    const pageText = $('body').text();
    
    // Ищем упоминания о дате регистрации
    const registrationMatch = pageText.match(/регистрации[^]*?(\d{1,2}\s+\w+\s+\d{4})/i);
    if (registrationMatch) {
      return registrationMatch[1];
    }

    return null;
  } catch (error) {
    console.error('Ошибка мобильной версии:', error.message);
    return null;
  }
}

// Сервис 3: VKfox (если работает)
async function getRegistrationDateFromVKFox(userId) {
  try {
    const response = await axios.get(`https://vkfox.ru/${userId}`, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const regDate = $('*:contains("Дата регистрации")').closest('tr').find('td').last().text().trim();
    
    if (regDate && regDate.length > 5) {
      return regDate;
    }

    return null;
  } catch (error) {
    console.error('Ошибка VKfox:', error.message);
    return null;
  }
}

// Основная функция для получения даты регистрации
async function getRegistrationDate(userId) {
  console.log(`Попытка получить дату регистрации для ID: ${userId}`);
  
  // Пробуем разные сервисы по очереди
  const services = [
    getRegistrationDateFromVKWatch,
    getRegistrationDateFromMobile,
    getRegistrationDateFromVKFox
  ];

  for (const service of services) {
    try {
      console.log(`Пробуем сервис: ${service.name}`);
      const result = await service(userId);
      if (result) {
        console.log(`Найдена дата: ${result}`);
        return result;
      }
    } catch (error) {
      console.log(`Сервис ${service.name} не сработал:`, error.message);
      continue;
    }
  }

  // Если все сервисы не сработали, пробуем получить базовую информацию
  try {
    const response = await axios.get('https://api.vk.com/method/users.get', {
      params: {
        user_ids: userId,
        fields: 'bdate,photo_max,domain,last_seen',
        access_token: process.env.VK_TOKEN,
        v: '5.131'
      }
    });

    if (response.data.response && response.data.response[0]) {
      const user = response.data.response[0];
      return {
        bdate: user.bdate || 'Не указана',
        profile: `https://vk.com/${user.domain || 'id' + user.id}`,
        name: `${user.first_name} ${user.last_name}`,
        lastSeen: user.last_seen ? formatRegistrationDate(user.last_seen.time) : 'Неизвестно'
      };
    }
  } catch (error) {
    console.error('Ошибка API VK:', error.message);
  }

  return null;
}

module.exports = {
  command: '/reg',
  aliases: ['/регистрация'],
  description: 'Получить дату регистрации пользователя',
  async execute(context) {
    try {
      const senderRoleId = await getUserRole(context.peerId, context.senderId);
      let userId;
      
      if (senderRoleId < 20) {
        return context.reply(`❌ У вас нет прав на использование этой команды`);
      }
      
      if (context.replyMessage) {
        userId = context.replyMessage.senderId;
      } else {
        const parts = context.text.split(' ');
        userId = await extractNumericId(parts[1]);
      }
      
      if (!userId || userId < 0) {
        return context.send('❌ Укажите корректный ID пользователя');
      }

      const processingMsg = await context.send('🔍 Ищу дату регистрации...');
      
      const registrationInfo = await getRegistrationDate(userId);
      
      let message;
      
      if (typeof registrationInfo === 'string') {
        // Найдена дата регистрации
        message = `✅ Дата регистрации [id${userId}|пользователя]: ${registrationInfo}`;
      } else if (registrationInfo && typeof registrationInfo === 'object') {
        // Получена общая информация
        message = `👤 Информация о [id${userId}|пользователе]:\n`;
        message += `📛 Имя: ${registrationInfo.name}\n`;
        message += `🎂 День рождения: ${registrationInfo.bdate}\n`;
        message += `🔗 Профиль: ${registrationInfo.profile}\n`;
        message += `⏰ Последний раз онлайн: ${registrationInfo.lastSeen}\n\n`;
        message += `ℹ️ Точная дата регистрации недоступна`;
      } else {
        message = '❌ Не удалось получить информацию о пользователе';
      }

      await context.editMessage({
        conversation_message_id: processingMsg.conversation_message_id,
        message: message
      });

    } catch (error) {
      console.error('Ошибка в команде /reg:', error);
      context.reply('❌ Произошла ошибка при получении информации');
    }
  },
};