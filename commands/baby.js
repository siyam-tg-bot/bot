const axios = require("axios");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

const mahmud = [
  "baby", "bby", "babu", "bbu", "jan", "janu", "bot",
  "জান", "জানু", "বেবি", "hi", "বট", "নিঝুম"
];

const baseApiUrl = async () => {
  try {
    const base = await axios.get("https://raw.githubusercontent.com/mahmud-aura/HINATA/main/baseApiUrl.json", { timeout: 8000 });
    return base.data.mahmud || "https://hinata-api.onrender.com";
  } catch (e) {
    return "https://hinata-api.onrender.com";
  }
};

function filterText(text) {
  if (!text) return "error baby🥹";
  const badWords = ["sex", "chodi", "mugi", "nude", "১৮+", "চুদা", "চোদ"];
  let cleanText = text;
  badWords.forEach(word => {
    if (cleanText.toLowerCase().includes(word)) {
      cleanText = "ছিঃ! ভালো হয়ে যাও, এসব পচা কথা বলতে নেই 🙈";
    }
  });
  return cleanText;
}

async function fetchAiReply(userText) {
  try {
    const baseUrl = await baseApiUrl();
    const res = await axios.post(`${baseUrl}/api/hinata`, { 
      text: userText || "hi", 
      style: 3 
    }, { timeout: 12000 });

    const reply = res.data?.message || res.data?.reply;
    if (reply) return filterText(reply);

    // ব্যাকআপ GET রিকোয়েস্ট (যদি POST কাজ না করে)
    const getRes = await axios.get(`${baseUrl}/api/hinata?text=${encodeURIComponent(userText || "hi")}`, { timeout: 10000 });
    return filterText(getRes.data?.message || getRes.data?.reply || "error baby🥹");
  } catch (e) {
    console.error("API Request Failed:", e.message);
    return "error baby🥹";
  }
}

module.exports = {
  config: {
    name: "bby",
    aliases: ["baby", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "6.0-API-ONLY",
    author: AUTHOR,
    role: 0,
    shortDescription: "Always Active AI Baby Chatbot",
    longDescription: "Fastest 100% API based AI chatbot with no-prefix and auto-reply support",
    category: "chat",
    guide: "{pn} [text] | reply to message/sticker"
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (this.config.author !== AUTHOR) {
      return bot.sendMessage(chatId, "⚠️ Author name changed! Command locked.", { reply_to_message_id: messageId });
    }

    let userText = args ? args.join(" ").trim() : "";
    if (!userText && msg.reply_to_message && msg.reply_to_message.text) {
      userText = msg.reply_to_message.text;
    }

    if (msg.sticker) userText = "sticker";

    const replyMsg = await fetchAiReply(userText || "hi");
    return bot.sendMessage(chatId, replyMsg, { reply_to_message_id: messageId });
  },

  onChat: async function ({ bot, msg }) {
    if (!msg || this.config.author !== AUTHOR) return;

    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    // ১. বটের মেসেজে রিপ্লাই করলে শতভাগ API থেকে মেসেজ আনবে
    const isReplyToBot = msg.reply_to_message && msg.reply_to_message.from && (msg.reply_to_message.from.is_bot || msg.reply_to_message.from.id === bot.botId);

    if (isReplyToBot) {
      const input = msg.sticker ? "sticker" : (msg.text || msg.caption || "hi").trim();
      const replyMsg = await fetchAiReply(input);
      return bot.sendMessage(chatId, replyMsg, { reply_to_message_id: messageId });
    }

    // ২. প্রিফিক্স ছাড়া ট্রিগার হলে শতভাগ API থেকে মেসেজ আনবে
    const text = (msg.text || msg.caption || "").toLowerCase().trim();
    if (!text) return;

    const matchedTrigger = mahmud.find(word => text.startsWith(word) || text === word);

    if (matchedTrigger) {
      let cleanQuery = text.substring(matchedTrigger.length).trim();
      if (!cleanQuery) cleanQuery = text;

      const replyMsg = await fetchAiReply(cleanQuery);
      return bot.sendMessage(chatId, replyMsg, { reply_to_message_id: messageId });
    }
  }
};
