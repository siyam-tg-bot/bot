const emojiList = ["👍", "❤️", "🔥", "🥰", "👏", "🎉", "🤩", "⚡", "😎", "💯", "❤️‍🔥", "😍", "🗿"];

module.exports = (bot) => {
    bot.on("message", async (msg) => {
        try {
            if (!msg || !msg.chat || !msg.message_id) return;

            const chatId = msg.chat.id;
            const messageId = msg.message_id;

            const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];

            const reactionPayload = {
                chat_id: chatId,
                message_id: messageId,
                reaction: JSON.stringify([{ type: "emoji", emoji: randomEmoji }])
            };

            if (typeof bot._request === "function") {
                await bot._request("setMessageReaction", reactionPayload);
            } else if (typeof bot.setMessageReaction === "function") {
                await bot.setMessageReaction(chatId, messageId, {
                    reaction: JSON.stringify([{ type: "emoji", emoji: randomEmoji }])
                });
            }
        } catch (error) {
            console.log(`[Auto React Skipped]: ${error.message}`);
        }
    });
};
