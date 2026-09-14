const userMessageCounts = new Map();

module.exports = (bot) => {
    bot.on('message', async (msg) => {
        try {
            if (!msg || !msg.from || !msg.chat) return;
            const userId = msg.from.id;
            const chatId = msg.chat.id;

            if (userId === 8442705758) return; 

            const currentTime = Date.now();
            if (!userMessageCounts.has(userId)) {
                userMessageCounts.set(userId, []);
            }

            const timestamps = userMessageCounts.get(userId);
            timestamps.push(currentTime);

            const recentTimestamps = timestamps.filter(time => currentTime - time < 3000);
            userMessageCounts.set(userId, recentTimestamps);

            if (recentTimestamps.length > 4) {
                await bot.sendMessage(chatId, `⚠️ অতিরিক্ত দ্রুত মেসেজ পাঠানো থেকে বিরত থাকুন, অন্যথায় সাময়িকভাবে রেস্ট্রিক্ট করা হবে।`, {
                    reply_to_message_id: msg.message_id
                });
            }
        } catch (err) {
            console.error("AntiFlood Error:", err.message);
        }
    });
};
