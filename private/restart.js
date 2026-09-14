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
        const startTime = Date.now();

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        await bot.sendMessage(chatId, `🔄 𝐑𝐄𝐒𝚃𝙰𝚁𝚃𝙸𝙽𝙶 𝐁𝐎𝐓... 𝐏𝐋𝐄𝐀𝐒𝐄 𝐖𝐀𝐈𝐓.\n⏱️ 𝐓𝐈𝐌𝐄 𝐓𝐀𝐊𝐄𝐍: ${duration} 𝐒𝐄𝐂𝐎𝐍𝐃𝐒`, {
            reply_to_message_id: messageId
        });

        console.log(`Restart command executed in ${duration} seconds.`);

        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
};
