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
                        let botConnectText = "✨ 𝐁𝐎𝐓 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✨\n──────────────────\n👋 হ্যালো 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n\n🤖 আমি টেলিগ্রাম বট\n❤️ আমাকে গ্রুপে Add করার জন্য ধন্যবাদ\n\n──────────────────\n📌 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎\n» 👥 𝐌𝐄𝐌𝐁𝐄𝐑𝐒 : " + memberCount + "\n» 🤖 𝐏𝐑𝐄𝐅𝐈𝐗 : /\n\n──────────────────\n📖 𝐆𝐄𝐓 𝐒𝐓𝐀𝗥𝐓𝐄𝐃\n» /help — সকল কমান্ড দেখুন\n─────────────────\n👑 𝐎𝐖𝐍𝐄𝐑 : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n\n🌸 সবাইকে স্বাগতম";
                        
                        await bot.sendMessage(chatId, botConnectText);
                        continue;
                    }

                    let welcomeText = "🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌸\n━━━━━━━━━━━━\n🌷 𝐍𝐚𝐦𝐞: " + userName + "\n🏷️ 𝐆𝐫𝐨𝐮𝐩: " + threadName + "\n🔢 𝐌𝐞𝐦𝐛𝐞𝐫 #" + memberCount + "\n━━━━━━━━━━━━\n𝐄𝐧𝐣𝐨𝐲 𝐲𝐨𝐮𝐫 𝐬𝐭𝐚𝐲! 😊";
                    
                    await bot.sendMessage(chatId, welcomeText);
                }
            }

            if (msg.left_chat_member) {
                const member = msg.left_chat_member;
                if (member.id === botId || member.is_bot) return;

                const firstName = member.first_name || "User";
                const textVal = "বিদায় " + firstName + "! আশা করি আবার দেখা হবে।";
                
                await bot.sendMessage(chatId, textVal);
            }
        } catch (err) {}
    });
};
