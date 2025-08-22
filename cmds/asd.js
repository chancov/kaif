const axios = require('axios');

const GENIUS_API_BASE_URL = 'https://api.genius.com';
const GENIUS_ACCESS_TOKEN = 'OeM_n79_9-X2pcjwAT_Tr2Rc54wtx-uugz-hmBYAINms8edJQwVhaFaqh1LlnsAm';

async function searchLyricsBySongTitle(songTitle) {
  try {
    const response = await axios.get(`${GENIUS_API_BASE_URL}/search`, {
      params: {
        q: songTitle,
        access_token: GENIUS_ACCESS_TOKEN,
      },
    });

    if (response.status === 200) {
      const hits = response.data.response.hits;

      if (hits.length > 0) {
        const song = hits[0].result;
        const songLyrics = await getSongLyrics(song.api_path);
        return songLyrics;
      } else {
        return '❌ Песня не найдена.';
      }
    } else {
      return '❌ Ошибка при выполнении запроса к Genius API';
    }
  } catch (error) {
    console.error('Произошла ошибка:', error.message);
    return '❌ Произошла ошибка при поиске текста песни';
  }
}

async function getSongLyrics(apiPath) {
  try {
    // Для получения текста песни нужно использовать другую технику,
    // так как Genius API не предоставляет текст напрямую через их API
    // Вместо этого получим URL страницы с текстом
    const response = await axios.get(`${GENIUS_API_BASE_URL}${apiPath}`, {
      params: {
        access_token: GENIUS_ACCESS_TOKEN,
        text_format: 'plain', // Попробуем получить текст в plain формате
      },
    });

    if (response.status === 200) {
      const songData = response.data.response.song;
      
      // Вернем информацию о песне и URL с текстом
      return {
        title: songData.title,
        artist: songData.primary_artist.name,
        url: songData.url,
        thumbnail: songData.song_art_image_thumbnail_url,
        release_date: songData.release_date,
        // Если API возвращает текст песни (в некоторых случаях)
        lyrics: songData.description ? songData.description.plain : null
      };
    } else {
      return '❌ Ошибка при получении данных песни';
    }
  } catch (error) {
    console.error('Ошибка при получении текста песни:', error.message);
    return '❌ Ошибка при получении текста песни';
  }
}

module.exports = {
  command: '/find',
  aliases: ['/поиск'],
  description: 'Поиск текста песни',
  async execute(context) {
    const messageText = context.text;
    const parts = messageText.split(' ');

    const songTitle = parts.slice(1).join(' ');
    if (!songTitle) {
      return context.send('❌ Пожалуйста, укажите название песни.');
    }

    try {
      // Показываем что бот работает
      await context.send('🔍 Ищу текст песни...');

      // Ждем результат поиска
      const result = await searchLyricsBySongTitle(songTitle);

      if (typeof result === 'string') {
        // Если вернулась строка с ошибкой
        return context.send(result);
      } else if (result && result.url) {
        // Если нашли песню
        let message = `🎵 ${result.title} - ${result.artist}\n`;
        message += `📅 Дата выхода: ${result.release_date || 'Неизвестно'}\n`;
        message += `🔗 Ссылка на текст: ${result.url}`;
        
        // Если есть миниатюра, отправляем с фото
        if (result.thumbnail) {
          return context.send({
            message: message,
            attachment: result.thumbnail
          });
        } else {
          return context.send(message);
        }
      } else {
        return context.send('❌ Не удалось найти информацию о песне.');
      }
    } catch (error) {
      console.error('Ошибка в команде /find:', error);
      return context.send('❌ Произошла ошибка при поиске песни.');
    }
  },
};