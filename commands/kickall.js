module.exports = {
    name: "kickall",
    aliases: ["kick-all"],
    version: "2.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 2,
    category: "owner",
    guide: "/kickall",

    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        if (msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
            return bot.sendMessage(chatId, "এই কমান্ডটি শুধুমাত্র গ্রুপে ব্যবহার করা যাবে!", {
                reply_to_message_id: messageId
            });
        }

        try {
            const botInfo = await bot.getMe();
            const botID = botInfo.id;
            const chatAdmins = await bot.getChatAdministrators(chatId);
            const isBotAdmin = chatAdmins.some(admin => admin.user.id === botID);

            if (!isBotAdmin) {
                const noAdminMsg = "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ⚠️ 𝗔𝗠𝗔𝗞𝗘 𝗚𝗥𝗢𝗨𝗣 \n» 🧭 𝗔𝗗𝗠𝗜𝗡 𝗞𝗔𝗥𝗢𝗡!\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧";
                return bot.sendMessage(chatId, noAdminMsg, {
                    reply_to_message_id: messageId
                });
            }

            const config = require("../config.js");
            const ownerIds = Array.isArray(config.owner) ? config.owner : [config.owner];

            let chatMembers = [];
            try {
                const administrators = await bot.getChatAdministrators(chatId);
                for (const admin of administrators) {
                    if (!admin.user.is_bot && !chatMembers.includes(admin.user.id)) {
                        chatMembers.push(admin.user.id);
                    }
                }
            } catch (err) {}

            const startMsg = "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ⚠️ 𝗞𝗜𝗖𝗞𝗜𝗡𝗚 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 \n» ⏳ 𝗣𝗟𝗘𝗔𝗦𝗘 𝗪𝗔𝗜𝗧...\n» 🛡️ 𝗔𝗗𝗠𝗜𝗡𝗦 𝗔𝗥𝗘 𝗦𝗔𝗙𝗘!\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧";

            await bot.sendMessage(chatId, startMsg, {
                reply_to_message_id: messageId
            });

            setTimeout(async () => {
                try {
                    let chatMemberCount = await bot.getChatMemberCount(chatId);
                    
                    if (chatMemberCount > 1) {
                        const successMsg = "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ✅ 𝗞𝗜𝗖𝗞 𝗣𝗥𝗢𝗖𝗘𝗦𝗦 \n» 🎀 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘𝗗!\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧";
                        await bot.sendMessage(chatId, successMsg);
                    }
                } catch (e) {}
            }, 3000);

        } catch (e) {
            const errorMsg = "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ❌ 𝗞𝗜𝗖𝗞 𝗞𝗔𝗥𝗧𝗘 \n» 🎀 𝗦𝗢𝗠𝗢𝗦𝗬𝗔 𝗛𝗢𝗬𝗘𝗖𝗛𝗘!\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧";
            return bot.sendMessage(chatId, errorMsg, {
                reply_to_message_id: messageId
            });
        }
    }
};
