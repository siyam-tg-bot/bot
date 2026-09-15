const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
    config: {
        name: "namepic",
        version: "1.0",
        author: "SIYAM",
        role: 0,
        category: "utility",
        description: "Generate an image with user name"
    },

    execute: async (bot, msg, args) => {
        try {
            const chatId = msg.chat.id;
            const messageId = msg.message_id;

            let targetName = args.join(" ");
            if (msg.reply_to_message && msg.reply_to_message.from) {
                targetName = msg.reply_to_message.from.first_name;
            }
            if (!targetName) {
                targetName = msg.from.first_name || "User";
            }

            // প্যাকেজ কাজ করছে কিনা তা বোঝানোর জন্য একটি ওয়েটিং মেসেজ
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

            // ওয়েটিং মেসেজটি ডিলিট করে মূল ছবি পাঠানো হবে
            await bot.deleteMessage(chatId, waitingMsg.message_id);

            await bot.sendPhoto(chatId, buffer, {
                caption: `✅ সিয়াম ভাই, আপনার প্যাকেজ একদম ঠিকমতো কাজ করছে!\n\n✨ 𝗡𝗔𝗠𝗘: ${targetName}`,
                reply_to_message_id: messageId
            });

        } catch (err) {
            console.error("Namepic Error:", err.message);
            bot.sendMessage(msg.chat.id, "❌ সিয়াম ভাই, রেলওয়ে সার্ভারে ক্যানভাস প্যাকেজটি সাপোর্ট করছে না! (Build Error)", { reply_to_message_id: msg.message_id });
        }
    }
};
