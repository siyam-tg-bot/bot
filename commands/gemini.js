const a = require("axios");
const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";
const activeReplies = new Map();

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "chat"],
    version: "0.0.1",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    countDown: 3,
    role: 0,
    shortDescription: "Ask Gemini AI",
    longDescription: "Talk with Gemini AI using Aryan's updated API",
    category: "AI",
    guide: "gemini [your question]"
  },

  onStart: async function({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let e;
    try {
      const apiConfig = await a.get(nix);
      e = apiConfig.data && apiConfig.data.api;
      if (!e) throw new Error("Configuration Error");
    } catch (error) {
      return bot.sendMessage(chatId, "❌ Failed to fetch API configuration from GitHub.", { reply_to_message_id: messageId });
    }

    const p = args.join(" ");
    if (!p) {
      return bot.sendMessage(chatId, "❌ Please provide a question or prompt.", { reply_to_message_id: messageId });
    }

    try {
      const r = await a.get(`${e}/gemini?prompt=${encodeURIComponent(p)}`);
      const reply = r.data?.response; 
      if (!reply) throw new Error("No response");

      const sentMsg = await bot.sendMessage(chatId, reply, { reply_to_message_id: messageId });

      activeReplies.set(sentMsg.message_id, {
        author: msg.from.id,
        baseApi: e
      });

    } catch (error) {
      bot.sendMessage(chatId, "⚠ Gemini API theke response pawa jachchhe na.", { reply_to_message_id: messageId });
    }
  },

  onChat: async function({ bot, msg }) {
    try {
      if (!msg || !msg.reply_to_message || !msg.text) return;

      const repliedId = msg.reply_to_message.message_id;
      if (!activeReplies.has(repliedId)) return;

      const session = activeReplies.get(repliedId);
      const { baseApi: e, author } = session;

      if (msg.from.id !== author) return;

      const chatId = msg.chat.id;
      const messageId = msg.message_id;
      const p = msg.text.trim();

      if (!p) return;

      const r = await a.get(`${e}/gemini?prompt=${encodeURIComponent(p)}`);
      const reply = r.data?.response; 
      if (!reply) throw new Error("No response");

      activeReplies.delete(repliedId);

      const sentMsg = await bot.sendMessage(chatId, reply, { reply_to_message_id: messageId });

      activeReplies.set(sentMsg.message_id, {
        author: msg.from.id,
        baseApi: e
      });

    } catch (error) {
      bot.sendMessage(msg.chat.id, "⚠ Gemini API er response dite somossa hocchhe.", { reply_to_message_id: msg.message_id });
    }
  }
};
