const fs = require('fs');
const path = require('path')

module.exports = (commands) => {
    const cmdsDir = path.join(__dirname, '../cmds');
    
    fs.readdirSync(cmdsDir).forEach(file => {
        const command = require(path.join(cmdsDir, file));
        console.info(`[COMMAND] ${file} загружен!`); 
		commands.push(command);
    });
};
