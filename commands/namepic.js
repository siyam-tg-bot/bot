const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
    config: {
        name: "namepic",
        version: "2.0",
        author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
        role: 0,
        category: "utility",
        description: "Generate an image with user name"
    },

    onStart: async function (context) {
        try {
            const bot = context.api || context.bot; 
            const msg = context.event || context.message || context.msg;
            const args = context.args || [];

            const chatId = msg.chat.id || msg.threadID;
            const messageId = msg.message_id || msg.messageID;

            let targetName = args.join(" ");
            
            if (!targetName && msg.reply_to_message && msg.reply_to_message.from) {
                targetName = msg.reply_to_message.from.first_name;
            }
            
            if (!targetName) {
                targetName = (msg.from && msg.from.first_name) ? msg.from.first_name : "User";
            }

            const waitingMsg = await bot.sendMessage(chatId, "⏳ ছবি তৈরি হচ্ছে, একটু অপেক্ষা করুন...", { reply_to_message_id: messageId });

            const bgUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809";
            const response = await axios.get(bgUrl, { responseType: 'arraybuffer' });
            const background = await loadImage(response.data);

            const canvas = createCanvas(background.width, background.height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 70px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(targetName, canvas.width / 2, canvas.height / 2);

            const buffer = canvas.toBuffer("image/jpeg");

            await bot.deleteMessage(chatId, waitingMsg.message_id);

            await bot.sendPhoto(chatId, buffer, {
                caption: `✅ সিয়াম ভাই, আপনার প্যাকেজ একদম ঠিকমতো কাজ করছে!\n\n✨ 𝗡𝗔𝗠𝗘: ${targetName}`,
                reply_to_message_id: messageId
            });

        } catch (err) {
            console.error("Namepic Error:", err.message);
            const bot = context.api || context.bot;
            const msg = context.event || context.message || context.msg;
            bot.sendMessage(msg.chat.id || msg.threadID, "❌ সিয়াম ভাই, ছবি তৈরি করতে সমস্যা হয়েছে!", { reply_to_message_id: msg.message_id || msg.messageID });
        }
    }
};
