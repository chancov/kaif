const { getUserTech } = require('../util.js')	

module.exports = {
    command: '/restart',
    aliases: ['/restart'],
    description: 'Перезапуск бота',
    async execute(context) {
    let kaka = await getUserTech(context.senderId);
    if (kaka < 4) return;
        try {
            await context.reply('✅️ Перезагрузка...');
            process.exit();
        } catch (error) {
            return context.reply(`❌ Ошибка при перезапуске бота: ${error.message}`);
        }
    }
};