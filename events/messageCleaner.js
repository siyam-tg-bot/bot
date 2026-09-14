module.exports = (bot) => {
    bot.on('message', async (msg) => {
        try {
            if (!msg || !msg.from || !msg.chat) return;
            const chatId = msg.chat.id;
            const userId = msg.from.id;
            const text = msg.text ? msg.text.trim().toLowerCase() : "";

            if (text === "allremove") {
                if (userId !== 8442705758) {
                    await bot.sendMessage(chatId, `⚠️ 𝙾𝙽𝙻𝚈 𝚂𝙸𝙰𝙼 𝙲𝙰𝙽 𝚄𝚂𝙴 𝚃𝙷𝙸𝚂 𝙲𝙾𝙼𝙼𝙰𝙽𝙳!`, {
                        reply_to_message_id: msg.message_id
                    });
                    return;
                }

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
                const triggerWords = ["সিয়াম", "ডিলেট করো", "ডিলিট করো", "ডিলিট কর", "ডিলেট কর", "বট ডিলিট কর", "রিমুভ", "স"];
                const isTrigger = triggerWords.some(word => text.includes(word));

                if (isTrigger) {
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
};
