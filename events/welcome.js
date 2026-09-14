module.exports = function(bot) {
    bot.on("message", async (msg) => {
        if (!msg.chat || (msg.chat.type !== "group" && msg.chat.type !== "supergroup")) return;

        try {
            const chatId = msg.chat.id;
            const threadName = msg.chat.title || "Group";
            let botInfo = await bot.getMe();
            const botID = botInfo.id;

            if (msg.new_chat_members) {
                for (const member of msg.new_chat_members) {
                    const memberId = member.id;
                    const firstName = member.first_name || "User";
                    const userName = member.username ? "@" + member.username : firstName;

                    if (memberId === botID) {
                        let chatMemberCount = await bot.getChatMemberCount(chatId);

                        let botConnectText = "✨ 𝐁𝐎𝐓 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✨\n──────────────────\n👋 হ্যালো 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n\n🤖 আমি টেলিগ্রাম বট\n❤️ আমাকে গ্রুপে Add করার জন্য ধন্যবাদ\n\n──────────────────\n📌 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎\n» 👥 𝐌𝐄𝐌𝐁𝐄𝐑𝐒 : " + chatMemberCount + "\n» 🤖 𝐏𝐑𝐄𝐅𝐈𝐗 : /\n\n──────────────────\n📖 𝐆𝐄𝐓 𝐒𝐓𝐀𝐑𝐓𝐄𝐃\n» /help — সকল কমান্ড দেখুন\n─────────────────\n👑 𝐎𝐖𝐍𝐄𝐑 : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n\n🌸 সবাইকে স্বাগতম";

                        await bot.sendMessage(chatId, botConnectText);
                        continue;
                    }

                    let memberCount = await bot.getChatMemberCount(chatId);

                    let memberWelcomeText = "🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌸\n━━━━━━━━━━━━\n🌷 𝐍𝐚𝐦𝐞: " + userName + "\n🏷️ 𝐆𝐫𝐨𝐮𝐩: " + threadName + "\n🔢 𝐌𝐞𝐦𝐛𝐞𝐫 #" + memberCount + "\n━━━━━━━━━━━━\n𝐄𝐧𝐣𝐨𝐲 𝐲𝐨𝐮𝐫 𝐬𝐭𝐚𝐲! 😊";

                    await bot.sendMessage(chatId, memberWelcomeText);
                }
            }
        } catch (error) {
            console.error("Welcome Error:", error.message);
        }
    });
};
