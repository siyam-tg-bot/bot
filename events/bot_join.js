const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const botJoinImages = [
    "https://i.imgur.com/y5a5BBP.jpeg",
    "https://i.imgur.com/586Aq55.jpeg"
];

module.exports = {
    config: {
        name: "bot_join",
        version: "1.0",
        author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
        category: "events"
    },
    onChat: async function ({ bot, msg }) {
        if (!msg.new_chat_members || msg.new_chat_members.length === 0) return;

        try {
            const chatId = msg.chat.id;
            const messageId = msg.message_id;
            const addedUser = msg.new_chat_members[0];
            const addedUserId = addedUser.id;

            const botInfo = await bot.getMe();
            const botID = botInfo.id;

            if (addedUserId !== botID) return;

            let memberCount = 1;
            try {
                memberCount = await bot.getChatMemberCount(chatId);
            } catch (e) {}

            let botJoinImgPath;
            let imageStream;
            try {
                const randomBotImgUrl = botJoinImages[Math.floor(Math.random() * botJoinImages.length)];
                const imgResponse = await axios.get(randomBotImgUrl, {
                    responseType: "arraybuffer",
                    headers: {
                        "User-Agent": "Mozilla/5.0"
                    }
                });
                const tempDir = path.join(__dirname, 'temp');
                await fs.ensureDir(tempDir);
                botJoinImgPath = path.join(tempDir, `bot_join_${Date.now()}.jpeg`);
                fs.writeFileSync(botJoinImgPath, Buffer.from(imgResponse.data));
                imageStream = fs.createReadStream(botJoinImgPath);
            } catch (imgError) {}

            const captionText = `✨ 𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 ✨\n──────────────────\n👋 হ্যালো BOT EXPOSED 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 \n\n🤖 আমি 𝗡𝗜𝗝𝗛𝗨𝗠 𝗕𝗢𝗧\n❤️ আমাকে গ্রুপে Add করার জন্য ধন্যবাদ\n\n──────────────────\n📌 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢\n» 👥 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 : ${memberCount}\n» 🤖 𝗣𝗥𝗘𝗙𝗜𝗫 : { , }\n\n──────────────────\n📖 𝗚𝗘𝗧 𝗦𝗧𝗔𝗥𝗧𝗘𝗗\n» /help — সকল কমান্ড দেখুন\n» call আপনার সমস্যা লেখুন\n» 📞 +𝟴𝟴𝟬𝟭𝟴𝟵𝟭𝟯𝟴𝟭𝟱𝟳\n─────────────────\n👑 𝗢𝗪𝗡𝗘𝗥 : 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n\n🌸 সবাইকে স্বাগতম`;

            if (imageStream) {
                await bot.sendPhoto(chatId, imageStream, {
                    caption: captionText,
                    reply_to_message_id: messageId
                });
            } else {
                await bot.sendMessage(chatId, captionText, {
                    reply_to_message_id: messageId
                });
            }

            if (botJoinImgPath && fs.existsSync(botJoinImgPath)) {
                setTimeout(() => fs.unlinkSync(botJoinImgPath), 5000);
            }

        } catch (error) {
            console.error("[Bot Join Error]:", error);
        }
    }
};
