module.exports = (bot) => {
    bot.on('message', async (msg) => {
        try {
            if (!msg || !msg.chat) return;
            const chatId = msg.chat.id;
            const text = msg.text ? msg.text.trim().toLowerCase() : "";

            if (text === "allremove") {
                const messageId = msg.message_id;
                await bot.sendMessage(chatId, `🔄 𝐑𝐄𝐌𝐎𝐕𝐈𝐍𝐆 𝐀𝐋𝐋 𝐌𝐄𝐒𝐒𝐀𝐆𝐄𝚂... 𝐏𝐋𝐄𝐀𝐒𝐄 𝐖𝐀𝐈𝐓.`, {
                    reply_to_message_id: messageId
                });

                let deletedCount = 0;
                for (let i = messageId; i > messageId - 100; i--) {
                    try {
                        await bot.deleteMessage(chatId, i);
                        deletedCount++;
                    } catch (e) {}
                }

                console.log(`Allremove executed. Total attempted: ${deletedCount}`);
                return;
            }

            if (msg.reply_to_message) {
                const triggerWords = ["r", "s", "ক", "ই"];
                if (triggerWords.includes(text)) {
                    const botMessageId = msg.reply_to_message.message_id;
                    const userMessageId = msg.message_id;

                    try {
                        await bot.deleteMessage(chatId, botMessageId);
                    } catch (e) {}

                    try {
                        await bot.deleteMessage(chatId, userMessageId);
                    } catch (e) {}
                }
            }
        } catch (err) {
            console.error("MessageCleaner Error:", err.message);
        }
    });

    bot.on('message_reaction', async (reaction) => {
        try {
            if (!reaction || !reaction.chat || !reaction.message_id) return;
            const chatId = reaction.chat.id;
            const messageId = reaction.message_id;

            const newReactions = reaction.new_reaction || [];
            const hasDeleteEmoji = newReactions.some(r => r.emoji === "🔥" || r.emoji === "❤️" || r.emoji === "👍" || r.emoji === "👎" || r.emoji === "🥰" || r.emoji === "👏" || r.emoji === "😁");

            if (hasDeleteEmoji) {
                await bot.deleteMessage(chatId, messageId);
            }
        } catch (err) {
            console.error("Reaction Cleaner Error:", err.message);
        }
    });
};
