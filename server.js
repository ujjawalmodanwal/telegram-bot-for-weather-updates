const dotenv = require('dotenv');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
dotenv.config();


//Coordinates of New Delhi;
const longitude=77.2090;
const latitude=28.6139;
const timeInterval = 3600000;


//URLs
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_API_TOKEN}`; //to send res to telegram server
const POST_URL = `/webhook/${process.env.BOT_API_TOKEN}`
const WEBHOOK_URL = `${process.env.PUBLIC_URL}${POST_URL}`; //to receive req at this public URL
const WEATHER_API_URL =`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`



const app = express();
app.use(bodyParser.json());
const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
}
let timer = null;

const postWeatherData = async(chatId)=>{
    const weatherData = await axios.get(WEATHER_API_URL);
    const temperature = weatherData.data.current_weather.temperature;
    const timeStampOfUpdate = weatherData.data.current_weather.time;
    const time = timeStampOfUpdate.split("T")[1];
    const date = timeStampOfUpdate.split("T")[0];
    let updateMessage = `City: New Delhi \nTime: ${time} \nDate: ${date} \nTemperature: ${temperature}\n\n\n /revoke to stop receiveing updates!`;
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: updateMessage
    })
}



const revokeWeatherUpdate = async(chatId) =>{
    clearInterval(timer);
    timer=null;
    const revokeMessage = `Service has been stopped. \nYou can /initiate it anytime :)`;
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: revokeMessage
    })
}

const postWelcomeMessage = async (chatId)=>{
    const welcomeMessage = `I am a bot. You can /initiate the service to get temperature update of New Delhi every hour.`
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: welcomeMessage
    })
}
app.post(`/webhook/${process.env.BOT_API_TOKEN}`, async (req, res) => {
    const chatId = req.body.message.chat.id
    const text = req.body.message.text
    if(text==='/start'){
        postWelcomeMessage(chatId);
    }
    if(text==='/initiate' && timer==null){
        postWeatherData(chatId);
        timer = setInterval(async () =>  postWeatherData(chatId), timeInterval)
    }
    if(text==='/revoke'){
        revokeWeatherUpdate(chatId);
    }
    return res.send()
})

app.listen(process.env.PORT || 5000, async () => {
    console.log('app running on port', process.env.PORT || 5000)
    await init()
})