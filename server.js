const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const longitude=77.2090;
const latitude=28.6139;

const bot = new Telegraf(process.env.BOT_API_TOKEN);
bot.start((ctx) => {
    let message = `Namaste, I am a bot to give you temperature update of New Delhi city, India!
Please use the /initiate command to receive temperature updates every hour!
Type /revoke to stop receiving the updates!

Thank you`;
    ctx.reply(message);
})


     

let timer = null;

const handleInitiateRequest = async (ctx)=>{
    try {
        const weatherData = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
        const temperature = weatherData.data.current_weather.temperature;
        const timeStampOfUpdate = weatherData.data.current_weather.time;
        const time = timeStampOfUpdate.split("T")[1];
        const date = timeStampOfUpdate.split("T")[0];
        let updateMessage = `City: New Delhi \nTime: ${time} \nDate: ${date} \nTemperature: ${temperature}\n\n\n /revoke to stop receiveing updates!`;
        ctx.reply(updateMessage);
    } catch (error) {
        ctx.reply('error getting data :(');
    }
}

bot.command('initiate',async (ctx) => {
    ctx.reply(`Initiating temperature update service...`)
    handleInitiateRequest(ctx);    
    timer = setInterval(async () => handleInitiateRequest(ctx), 3600000)  
});

bot.command('revoke', async (ctx) => {
    if(timer){
        clearInterval(timer);
        timer=null;
        ctx.reply('I have stopped the notification. \nYou can /initiate it anytime :)');
    }
    else{
        ctx.reply('Sorry there is not active service! \nYou can /initiate receving temperature updates anytime :)');
    }
})


bot.launch();