module.exports = function(bot) {
    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;

        if (msg.new_chat_members) {
            for (const member of msg.new_chat_members) {
                if (member.id === bot.botInfo?.id || member.is_bot) continue;
                
                const welcomeText = "স্বাগতম " + (member.first_name || "User") + "! আমাদের গ্রুপে যুক্ত হওয়ার জন্য ধন্যবাদ।";
                
                try {
                    await bot.sendMessage(chatId, welcomeText);
                } catch (err) {}
            }
        }

        if (msg.left_chat_member) {
            const member = msg.left_chat_member;
            if (member.id === bot.botInfo?.id || member.is_bot) return;

            const textVal = "বিদায় " + (member.first_name || "User") + "! আশা করি আবার দেখা হবে।";
            
            try {
                await bot.sendMessage(chatId, textVal);
            } catch (err) {}
        }
    });
};
