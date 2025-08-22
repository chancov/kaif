const https = require('https');
const tcpp = require('tcp-ping');
const os = require('os');

const { Keyboard } = require('vk-io')
function formatUptime(uptimeInSeconds) {
  const days = Math.floor(uptimeInSeconds / (60 * 60 * 24));
  const hours = Math.floor((uptimeInSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((uptimeInSeconds % (60 * 60)) / 60);
  const seconds = uptimeInSeconds % 60;
  const roundedNumber = Math.round(seconds);
  return `${days}d, ${hours}h, ${minutes}m, ${roundedNumber}s`;
}

module.exports = {
  command: '/ping',
  aliases: ['/пинг'],
  description: 'Пинг до api.vk.com',
  async execute(context) {
    const startTime = new Date() / 1000;
	
    const randomRequestTime = 0.10000 + Math.random() * 0.80000;
    const numRequests = 200;
	
	const uptimeInSeconds = os.uptime();
	
	
	const formattedUptime = formatUptime(uptimeInSeconds);
      const buttonPayload = {
        button: 'delping',
        event_id: 5512,
      };

	const endDate = new Date();
	const timeDifference = endDate - startDate;
	const timeDifferenceInSeconds = Math.floor(timeDifference / 1000);
	const uptimebot = formatUptime(timeDifferenceInSeconds)
	const latency = Math.round(new Date() / 1000) - context.createdAt; 
    	const commandExecutionTime = (new Date() / 1000 - startTime) ;
	const message = `⚙ Понг!\n\nEvent Latency: ${latency}s\nHandler took: ${commandExecutionTime}ms\nUptime: ${uptimebot}`
    context.reply({ message: message });
  },
};