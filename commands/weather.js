const axios = require("axios");

module.exports = {
    name: "weather",
    version: "1.0.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    category: "utility",
    shortDescription: "Check weather information",
    longDescription: "Provides current weather updates for any specified city.",
    guide: "weather <city name>",

    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const city = args.join(" ");
        const startTime = Date.now();

        if (!city) {
            return bot.sendMessage(chatId, `⚠️ দয়া করে কোনো শহরের নাম লিখুন! উদাহরণ: /weather Dhaka`, {
                reply_to_message_id: messageId
            });
        }

        try {
            const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
            const response = await axios.get(url);
            const data = response.data;

            const current = data.current_condition[0];
            const tempC = current.temp_C;
            const weatherDesc = current.weatherDesc[0].value;
            const humidity = current.humidity;
            const windSpeed = current.windspeedKmph;

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            const replyText = 
`🌍 𝐂𝐈𝐓𝐘: ${city}
🌡️ 𝐓𝐄𝐌𝐏𝐄𝐑𝐀𝐓𝐔𝐑𝐄: ${tempC}°C
☁️ 𝐖𝐄𝐀𝐓𝐇𝐄𝐑: ${weatherDesc}
💧 𝐇𝐔𝐌𝐈𝐃𝐈𝐓𝐘: ${humidity}%
💨 𝐖𝐈𝐍𝐃 𝐒𝐏𝐄𝐄𝐃: ${windSpeed} 𝐊𝐌/𝐇
⏱️ 𝐓𝐈𝐌𝐄 𝐓𝐀𝐊𝐄𝐍: ${duration} 𝐒𝐄𝐂𝐎𝐍𝐃𝐒`;

            return bot.sendMessage(chatId, replyText, {
                reply_to_message_id: messageId
            });

        } catch (err) {
            return bot.sendMessage(chatId, `❌ আবহাওয়া তথ্য আনতে সমস্যা হয়েছে অথবা শহরের নাম ভুল রয়েছে!`, {
                reply_to_message_id: messageId
            });
        }
    }
};
