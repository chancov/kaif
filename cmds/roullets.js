const axios = require('axios');
const database = require('../databases.js');

// Хранилище для отслеживания попыток и кулдаунов
const rouletteAttempts = new Map();
const rouletteCooldowns = new Map();

// Настройки
const GROUP_SCREEN_NAME = 'chancov';
const ADMIN_ID = 705208993;

let TARGET_GROUP_ID = null;

// Функция для выполнения запросов к базе данных
function executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        database.query(sql, params, (error, results) => {
            if (error) {
                console.error('❌ Ошибка выполнения запроса:', error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}


// Функция для получения ID группы
async function getGroupId() {
    try {
        console.log('Получаю ID группы...');
        
        const response = await axios.get('https://api.vk.com/method/groups.getById', {
            params: {
                group_ids: GROUP_SCREEN_NAME,
                access_token: process.env.VK_TOKEN,
                v: '5.131'
            }
        });

        if (response.data.response && response.data.response[0]) {
            const groupId = -response.data.response[0].id;
            console.log('✅ ID группы получен:', groupId);
            return groupId;
        }
    } catch (error) {
        console.error('❌ Ошибка получения ID группы:', error.response?.data || error.message);
    }
    
    return null;
}

// Функция для запуска LongPoll
async function startGroupLongPoll() {
    
    // Получаем ID группы
    TARGET_GROUP_ID = await getGroupId();
    
    if (!TARGET_GROUP_ID) {
        console.error('❌ Не удалось получить ID группы');
        return;
    }

    try {
        const groupIdPositive = Math.abs(TARGET_GROUP_ID);
        const response = await axios.get('https://api.vk.com/method/groups.getLongPollServer', {
            params: {
                group_id: groupIdPositive,
                access_token: process.env.VK_TOKEN,
                v: '5.131'
            }
        });

        if (response.data.error) {
            console.error('❌ Ошибка LongPoll сервера:', response.data.error);
            return;
        }

        const server = response.data.response;
        console.log('✅ LongPoll server получен');
        
        listenToGroupEvents(server);
        
    } catch (error) {
        console.error('❌ Ошибка получения LongPoll сервера:', error);
        setTimeout(startGroupLongPoll, 10000);
    }
}

// Прослушивание событий группы
async function listenToGroupEvents(server) {
    try {
        const response = await axios.get(`${server.server}`, {
            params: {
                act: 'a_check',
                key: server.key,
                ts: server.ts,
                wait: 25
            }
        });

        const updates = response.data;
        
        if (updates.updates) {
            for (const update of updates.updates) {
                await handleGroupUpdate(update);
            }
        }

        server.ts = updates.ts;
        setTimeout(() => listenToGroupEvents(server), 100);
        
    } catch (error) {
        console.error('❌ Ошибка LongPoll:', error);
        setTimeout(startGroupLongPoll, 5000);
    }
}

// Обработка событий группы
async function handleGroupUpdate(update) {
    try {
        if (update.type === 'wall_reply_new') {
            const comment = update.object;
            
            if (comment.owner_id === TARGET_GROUP_ID) {
                const commentText = comment.text.toLowerCase();
                
                if (commentText.includes('рулетка')) {
                    console.log('🎰 Найден комментарий с рулеткой от пользователя:', comment.from_id);
                    
                    const resultMessage = await handleRoulette(
                        comment.from_id,
                        comment.post_id,
                        comment.id
                    );
                    
                    await replyToComment(comment, resultMessage);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Ошибка обработки события:', error);
    }
}

// Функция для ответа на комментарий
async function replyToComment(comment, message) {
    try {
        await axios.get('https://api.vk.com/method/wall.createComment', {
            params: {
                owner_id: comment.owner_id,
                post_id: comment.post_id,
                reply_to_comment: comment.id,
                message: message,
                access_token: process.env.VK_TOKEN,
                v: '5.131',
                random_id: Math.floor(Math.random() * 1000000)
            }
        });
        
        console.log('✅ Ответ на комментарий отправлен');
    } catch (error) {
        console.error('❌ Ошибка отправки ответа:', error);
    }
}

// Обновите функцию handleRoulette
async function handleRoulette(userId, postId, commentId) {
    // Проверяем кулдаун
    const now = Date.now();
    const lastSpinTime = rouletteCooldowns.get(userId) || 0;
    const cooldownTime = 60 * 1000;

    if (now - lastSpinTime < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - (now - lastSpinTime)) / 1000);
        return `⏰ Подождите ${remainingTime} секунд перед следующей попыткой.`;
    }

    // Проверяем количество попыток
    const attemptsKey = `${userId}_${postId}`;
    const attempts = rouletteAttempts.get(attemptsKey) || 0;

    if (attempts >= 3) {
        return '❌ Вы исчерпали все 3 попытки для этого поста.';
    }

    // Крутим рулетку
    const result = spinRoulette();

    // Обновляем попытки и кулдаун
    rouletteAttempts.set(attemptsKey, attempts + 1);
    rouletteCooldowns.set(userId, now);

    // Увеличиваем счетчик спинов для пользователя
    await incrementUserSpins(userId);

    // Обрабатываем результат
    let message = '';
    
    if (result.type === 'empty') {
        message = '🎰 Результат: Пустота... Попробуйте еще раз!';
        await saveSpinResult(userId, postId, commentId, result);
    } 
    else if (result.type === 'candy') {
        await addCandiesToUser(userId, result.amount);
        await saveSpinResult(userId, postId, commentId, result);
        message = `🎰 Поздравляем! Вы выиграли ${result.amount} конфеток! 🍬`;
    } 
    else if (result.type === 'vip') {
        await addCandiesToUser(userId, 0); // Добавляем пользователя если его нет, но без конфеток
        await saveVipWin(userId, postId, commentId);
        await saveSpinResult(userId, postId, commentId, result);
        message = `🎰 ВАУ! ВЫ ВЫИГРАЛИ VIP-СТАТУС! 🎉\n\n` +
                 `Для получения приза напишите администратору: vk.com/write${ADMIN_ID}\n` +
                 `Ваш ID: ${userId}`;
        
        await notifyAdminAboutVIP(userId, commentId, postId);
    }

    return message;
}
// Функция крутки рулетки - УБЕДИТЕСЬ ЧТО ОНА ЕСТЬ В КОДЕ
function spinRoulette() {
    const random = Math.random();
    
    if (random < 0.02) {
        return { type: 'vip', win: true };
    } 
    else if (random < 0.5) {
        const candyAmount = Math.floor(Math.random() * 5) + 1;
        return { type: 'candy', amount: candyAmount, win: true };
    } 
    else {
        return { type: 'empty', win: false };
    }
}
// Добавьте эту функцию для увеличения счетчика спинов
async function incrementUserSpins(userId) {
    try {
        const userInfo = await getVKUserInfo(userId);
        const username = userInfo ? `${userInfo.first_name} ${userInfo.last_name}` : 'Unknown';
        
        await executeQuery(
            `INSERT INTO roulette_users (user_id, username, total_spins) 
             VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE 
             total_spins = total_spins + 1,
             last_spin = CURRENT_TIMESTAMP`,
            [userId, username]
        );
        
    } catch (error) {
        console.error('❌ Ошибка при увеличении счетчика спинов:', error);
    }
}

// Обновите функцию addCandiesToUser (уберите увеличение total_spins отсюда)
async function addCandiesToUser(userId, amount) {
    try {
        const userInfo = await getVKUserInfo(userId);
        const username = userInfo ? `${userInfo.first_name} ${userInfo.last_name}` : 'Unknown';
        
        await executeQuery(
            `INSERT INTO roulette_users (user_id, username, candies, total_won) 
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             candies = candies + ?, 
             total_won = total_won + ?,
             last_spin = CURRENT_TIMESTAMP`,
            [userId, username, amount, amount, amount, amount]
        );
        
    } catch (error) {
        console.error('❌ Ошибка при добавлении конфеток:', error);
    }
}

    // Сохранение результата спина
    async function saveSpinResult(userId, postId, commentId, result) {
        try {
            await executeQuery(
                `INSERT INTO roulette_spins (user_id, post_id, comment_id, result_type, result_amount, is_win)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, postId, commentId, result.type, result.amount || 0, result.win || false]
            );
            
        } catch (error) {
            console.error('❌ Ошибка при сохранении спина:', error);
        }
    }

// Сохранение VIP победы
async function saveVipWin(userId, postId, commentId) {
    try {
        await executeQuery(
            `INSERT INTO roulette_vip_wins (user_id, post_id, comment_id)
             VALUES (?, ?, ?)`,
            [userId, postId, commentId]
        );
        
        await executeQuery(
            `UPDATE roulette_users SET vip_wins = vip_wins + 1 WHERE user_id = ?`,
            [userId]
        );
        
    } catch (error) {
        console.error('❌ Ошибка при сохранении VIP победы:', error);
    }
}

// Получение статистики пользователя
async function getUserStats(userId) {
    try {
        const rows = await executeQuery(
            `SELECT candies, total_won, vip_wins, total_spins FROM roulette_users WHERE user_id = ?`,
            [userId]
        );
        
        if (rows && rows.length > 0) {
            return rows[0];
        }
        
        return { candies: 0, total_won: 0, vip_wins: 0, total_spins: 0 };
    } catch (error) {
        console.error('❌ Ошибка получения статистики:', error);
        return { candies: 0, total_won: 0, vip_wins: 0, total_spins: 0 };
    }
}

// Функция уведомления администратора
async function notifyAdminAboutVIP(userId, commentId, postId) {
    try {
        const userInfo = await getVKUserInfo(userId);
        const userName = userInfo ? `${userInfo.first_name} ${userInfo.last_name}` : 'Пользователь';
        
        const message = `🎉 ВАЖНО! ПОБЕДА В РУЛЕТКЕ!\n\n` +
                       `Пользователь: [id${userId}|${userName}]\n` +
                       `Выиграл VIP-статус в рулетке!\n` +
                       `Пост: https://vk.com/wall${TARGET_GROUP_ID}_${postId}\n` +
                       `Комментарий: https://vk.com/wall${TARGET_GROUP_ID}_${postId}?reply=${commentId}\n\n` +
                       `Ожидает выдачи приза.`;

        await axios.get('https://api.vk.com/method/messages.send', {
            params: {
                user_id: ADMIN_ID,
                message: message,
                access_token: process.env.VK_TOKEN,
                v: '5.131',
                random_id: Math.floor(Math.random() * 1000000)
            }
        });

    } catch (error) {
        console.error('❌ Ошибка уведомления админа:', error);
    }
}

// Функция получения информации о пользователе
async function getVKUserInfo(userId) {
    try {
        const response = await axios.get('https://api.vk.com/method/users.get', {
            params: {
                user_ids: userId,
                access_token: process.env.VK_TOKEN,
                v: '5.131'
            }
        });

        return response.data.response?.[0] || null;
    } catch (error) {
        console.error('❌ Ошибка получения информации о пользователе:', error);
        return null;
    }
}

// Команды для бота
module.exports = {
    command: '/candies',
    aliases: ['/конфетки', '/баланс'],
    description: 'Проверить количество конфеток и статистику',
    async execute(context) {
        try {
            const userId = context.senderId;
            const stats = await getUserStats(userId);
            
            let message = `🍬 Ваш баланс: ${stats.candies} конфеток\n`;
            message += `🎯 Всего выиграно конфет: ${stats.total_won}\n`;
            message += `⭐ VIP побед: ${stats.vip_wins}\n`;
            message += `🎰 Всего спинов: ${stats.total_spins}`;
            
            await context.send(message);
        } catch (error) {
            console.error('Ошибка в команде candies:', error);
            await context.send('❌ Ошибка при получении статистики');
        }
    }
};

// Запускаем систему
console.log('🚀 Запуск системы рулетки с базой данных...');
startGroupLongPoll();