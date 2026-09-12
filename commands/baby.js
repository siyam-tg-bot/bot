const axios = require("axios");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

const mahmud = [
  "baby", "bby", "babu", "bbu", "jan", "janu", "bot",
  "জান", "জানু", "বেবি", "hi", "বট", "নিঝুম"
];

const randomStickerReplies = [
  "🙈 ইশশ! এত মিষ্টি স্টিকার দিচ্ছ কেন?",
  "উম্মাহ! 😘 কি সুন্দর স্টিকার!",
  "স্টিকার না দিয়ে একটু ভালোবেসে কথা বলো তো! 💖",
  "বেশি স্টিকার মারলে কিন্তু কামড় দিমু 🤭",
  "বসের দেওয়া বট আমি, প্রেমে পড়ে গেলাম তো! 🫣"
];

const randomNoPrefixReplies = [
  "বাবু ক্ষুধা লাগছে🥺",
  "Hop beda😾, Boss বল boss😼",
  "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘",
  "গোলাপ ফুল এর জায়গায় আমি দিলাম তোমায় মেসেজ 🌸",
  "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
  "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
  "𝗕𝗯𝘆 𝗯𝗼𝗹𝗹𝗮 𝗽𝗮𝗽 𝗵𝗼𝗶𝗯𝗼 😒😒",
  "বেশি bby Bbby করলে leave নিবো কিন্তু 😒😒",
  "__বেশি বেবি বললে কামুর দিমু 🤭🤭",
  "𝙏𝙪𝙢𝙖𝙧 𝙜𝙛 𝙣𝙖𝙞, 𝙩𝙖𝙮 𝙖𝙢𝙠 𝙙𝙖𝙠𝙨𝙤? 😂😂😂",
  "আমাকে ডেকো না,আমি ব্যাস্ত আসি🙆🏻‍♀",
  "𝗕𝗯𝘆 𝗕𝗯𝘆 না করে আমার বস মানে, 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 এর কথা চিন্তা করো 😑",
  "🍺 এই নাও জুস খাও..! 𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
  "𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 🐤🐤",
  "খাওয়া দাওয়া করসো 🙄",
  "এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈",
  "আরে Bolo আমার জান, কেমন আসো? 😚",
  "amr JaNu lagbe,Tumi ki single aso?",
  "কথা দেও আমাকে পটাবা...!! 😌"
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
  if (!text) return text;
  const badWords = ["sex", "chodi", "mugi", "nude", "১৮+", "চুদা", "চোদ"];
  let cleanText = text;
  badWords.forEach(word => {
    if (cleanText.toLowerCase().includes(word)) {
      cleanText = "ছিঃ! ভালো হয়ে যাও, এসব পচা কথা বলতে নেই 🙈";
    }
  });
  return cleanText;
}

async function fetchAiReply(userText) {
  try {
    const baseUrl = await baseApiUrl();
    const res = await axios.post(`${baseUrl}/api/hinata`, { text: userText, style: 3 }, { timeout: 10000 });
    let reply = res.data ? res.data.message : null;
    if (!reply) throw new Error("Empty reply");
    return filterText(reply);
  } catch (e) {
    return randomNoPrefixReplies[Math.floor(Math.random() * randomNoPrefixReplies.length)];
  }
}

module.exports = {
  config: {
    name: "bby",
    aliases: ["baby", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "4.0-FINAL",
    author: AUTHOR,
    role: 0,
    shortDescription: "Always Active AI Baby Chatbot",
    longDescription: "Fast 100% active AI chatbot with no-prefix and auto-reply support",
    category: "chat",
    guide: "{pn} [text] | reply to message/sticker"
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (this.config.author !== AUTHOR) {
      return bot.sendMessage(chatId, "⚠️ Author name changed! Command locked.", { reply_to_message_id: messageId });
    }

    if (msg.sticker) {
      const reply = randomStickerReplies[Math.floor(Math.random() * randomStickerReplies.length)];
      return bot.sendMessage(chatId, reply, { reply_to_message_id: messageId });
    }

    let userText = args ? args.join(" ").trim() : "";
    if (!userText && msg.reply_to_message && msg.reply_to_message.text) {
      userText = msg.reply_to_message.text;
    }

    if (!userText) {
      const ran = ["Bolo baby, কি বলবা? 😚", "I love you baby ❤️", "আমাকে ডাকলে কিন্তু কিস করে দেবো 😘"];
      return bot.sendMessage(chatId, ran[Math.floor(Math.random() * ran.length)], { reply_to_message_id: messageId });
    }

    const replyMsg = await fetchAiReply(userText);
    return bot.sendMessage(chatId, replyMsg, { reply_to_message_id: messageId });
  },

  onChat: async function ({ bot, msg }) {
    if (!msg || this.config.author !== AUTHOR) return;

    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    // ১. বটের মেসেজে রিপ্লাই করলে (Reply to Bot)
    const isReplyToBot = msg.reply_to_message && msg.reply_to_message.from && (msg.reply_to_message.from.is_bot || msg.reply_to_message.from.id === bot.botId);

    if (isReplyToBot) {
      if (msg.sticker) {
        const reply = randomStickerReplies[Math.floor(Math.random() * randomStickerReplies.length)];
        return bot.sendMessage(chatId, reply, { reply_to_message_id: messageId });
      }

      const input = (msg.text || msg.caption || "").trim();
      if (input) {
        const replyMsg = await fetchAiReply(input);
        return bot.sendMessage(chatId, replyMsg, { reply_to_message_id: messageId });
      }
    }

    // ২. প্রিফিক্স ছাড়া সাধারণ মেসেজে ট্রিগার হলে (No-Prefix Trigger)
    const text = (msg.text || msg.caption || "").toLowerCase().trim();
    if (!text) return;

    const matchedTrigger = mahmud.find(word => text.startsWith(word) || text === word);

    if (matchedTrigger) {
      const words = text.split(/\s+/);

      if (words.length === 1) {
        const randomMsg = randomNoPrefixReplies[Math.floor(Math.random() * randomNoPrefixReplies.length)];
        return bot.sendMessage(chatId, randomMsg, { reply_to_message_id: messageId });
      }

      let cleanQuery = text.substring(matchedTrigger.length).trim();
      if (!cleanQuery) cleanQuery = text;

      const replyMsg = await fetchAiReply(cleanQuery);
      return bot.sendMessage(chatId, replyMsg, { reply_to_message_id: messageId });
    }
  },

  onReply: async function ({ bot, msg }) {
    if (!msg || this.config.author !== AUTHOR) return;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    
    if (msg.sticker) {
      const reply = randomStickerReplies[Math.floor(Math.random() * randomStickerReplies.length)];
      return bot.sendMessage(chatId, reply, { reply_to_message_id: messageId });
    }

    const input = (msg.text || msg.caption || "").trim();
    if (input) {
      const replyMsg = await fetchAiReply(input);
      return bot.sendMessage(chatId, replyMsg, { reply_to_message_id: messageId });
    }
  }
};
