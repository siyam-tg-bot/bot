const axios = require("axios");

const mahmud = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports = {
    name: "meme",
    aliases: ["memes"],
    version: "1.7",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    category: "fun",
    guide: "/meme",

    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        let loadingMsg;
        try {
            loadingMsg = await bot.sendMessage(chatId, "⏳ 𝐋𝐎𝐀𝐃𝐈𝗡𝙶 𝐌𝐄𝐌𝐄...", {
                reply_to_message_id: messageId
            });
        } catch (e) {
            return;
        }

        try {
            const apiUrlBase = await mahmud();
            const res = await axios.get(apiUrlBase + "/api/meme");
            const imageUrl = res.data?.imageUrl;

            if (!imageUrl) {
                if (loadingMsg && loadingMsg.message_id) {
                    await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
                }
                return bot.sendMessage(chatId, "× কোনো মিম খুঁজে পাওয়া যায়নি!", {
                    reply_to_message_id: messageId
                });
            }

            const response = await axios({
                method: "GET",
                url: imageUrl,
                responseType: "arraybuffer",
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            const imageBuffer = Buffer.from(response.data);
            const successText = "🐸 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐦𝐞𝐦𝐞 𝐛𝐚𝐛𝐲\n👑 𝐎𝐖𝐍𝐄𝗥: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

            await bot.sendPhoto(chatId, imageBuffer, {
                caption: successText,
                reply_to_message_id: messageId
            });

            if (loadingMsg && loadingMsg.message_id) {
                await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
            }

        } catch (err) {
            if (loadingMsg && loadingMsg.message_id) {
                await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
            }
            return bot.sendMessage(chatId, "× মিম আনতে সমস্যা হয়েছে!", {
                reply_to_message_id: messageId
            });
        }
    }
};
