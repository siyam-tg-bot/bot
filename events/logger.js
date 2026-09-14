module.exports = (bot) => {
    bot.on('message', async (msg) => {
        try {
            if (!msg || !msg.text) return;
            const userName = msg.from.first_name || "Unknown";
            const userId = msg.from.id;
            const chatTitle = msg.chat.title || "Private Chat";
            const text = msg.text;

            console.log(`[LOG] Chat: ${chatTitle} | User: ${userName} (${userId}) | Message: ${text}`);
        } catch (err) {
            console.error("Logger Error:", err.message);
        }
    });
};
