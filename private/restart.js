module.exports = {
    name: "restart",
    version: "1.0.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 2,
    category: "admin",
    shortDescription: "Restart the bot instance",
    longDescription: "Restarts the telegram bot server immediately.",
    guide: "restart",

    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        await bot.sendMessage(chatId, `🔄 **বট সফলভাবে রিস্টার্ট হচ্ছে... দয়া করে একটু অপেক্ষা করুন।**`, {
            reply_to_message_id: messageId,
            parse_mode: "Markdown"
        });

        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
};
