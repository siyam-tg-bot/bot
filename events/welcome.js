module.exports = function(bot) {
    bot.on("message", async (msg) => {
        if (!msg.chat) return;
        const chatId = msg.chat.id;
        const threadName = msg.chat.title || "Group";

        try {
            let botInfo = await bot.getMe();
            let botId = botInfo.id;
            let memberCount = await bot.getChatMemberCount(chatId);

            if (msg.new_chat_members) {
                for (const member of msg.new_chat_members) {
                    const memberId = member.id;
                    const firstName = member.first_name || "User";
                    const userName = member.username ? "@" + member.username : firstName;

                    if (memberId === botId) {
                        let botConnectText = "✨ 𝐁𝐎𝐓 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✨\n──────────────────\n👋 হ্যালো 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n\n🤖 আমি টেলিগ্রাম বট\n❤️ আমাকে গ্রুপে Add করার জন্য ধন্যবাদ\n\n──────────────────\n📌 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎\n» 👥 𝐌𝐄𝐌𝐁𝐄𝐑𝐒 : " + memberCount + "\n» 🤖 𝐏𝐑𝐄𝐅𝐈𝐗 : /\n\n──────────────────\n📖 𝐆𝐄𝐓 𝐒𝐓𝐀𝐑𝐓𝐄𝐃\n» /help — সকল কমান্ড দেখুন\n─────────────────\n👑 𝐎𝐖𝗡𝐄𝐑 : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n\n🌸 সবাইকে স্বাগতম";
                        
                        await bot.sendMessage(chatId, botConnectText);
                        continue;
                    }

                    let welcomeText = "🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌸\n━━━━━━━━━━━━\nস্বাগতম " + firstName + "! আমাদের গ্রুপে এড হওয়ার জন্য ধন্যবাদ।\n🏷️ 𝐆𝐫𝐨𝐮𝐩: " + threadName + "\n🔢 𝐌𝐞𝐦𝐛𝐞𝐫 #" + memberCount + "\n━━━━━━━━━━━━\nআশা করি আমাদের সাথে দারুণ সময় কাটবে!😊";
                    
                    await bot.sendMessage(chatId, welcomeText);
                }
            }
        } catch (err) {}
    });
};
