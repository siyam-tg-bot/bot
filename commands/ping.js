module.exports = {
  name: "ping",
  version: "1.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "system",
  shortDescription: "Check bot latency",
  longDescription: "Check bot response time",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const startTime = Date.now();

    const sentMsg = await bot.sendMessage(chatId, "Pinging...", { reply_to_message_id: messageId });
    const latency = Date.now() - startTime;

    return bot.editMessageText(`Pong! ⚡ Latency: \`${latency}ms\``, {
      chat_id: chatId,
      message_id: sentMsg.message_id,
      parse_mode: "Markdown"
    });
  }
};
