const EMOJIS = [
  "👍", "👎", "❤️", "🔥", "🥰", "👏", "😁", "🤔", "🤯", "😱", 
  "🤬", "😢", "🎉", "🤩", "🤮", "💩", "🙏", "👌", "🕊️", "🤡", 
  "🥱", "🥴", "😍", "🐳", "🌚", "⚡", "🍌", "🏆", "💔", "🤨"
];

module.exports = {
  name: "autoreact",
  aliases: ["react"],
  version: "1.0.2",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "system",
  usePrefix: false,
  noPrefix: true,
  hasPrefix: false,
  nonPrefix: true,
  handleEvent: true,
  shortDescription: "Automatically reacts to messages",
  longDescription: "Listens to all messages and reacts with standard supported emojis.",
  guide: "autoreact",

  execute: async (bot, msg) => {
    return module.exports.handleReaction(bot, msg);
  },

  onEvent: async function ({ bot, msg }) {
    return module.exports.handleReaction(bot, msg);
  },

  handleReaction: async function (bot, msg) {
    if (!msg || !msg.chat || !msg.message_id) return;

    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    try {
      if (typeof bot.setMessageReaction === "function") {
        await bot.setMessageReaction(chatId, messageId, {
          reaction: [{ type: "emoji", emoji: randomEmoji }],
          is_big: false
        });
      } else if (bot._request) {
        await bot._request("setMessageReaction", {
          chat_id: chatId,
          message_id: messageId,
          reaction: JSON.stringify([{ type: "emoji", emoji: randomEmoji }])
        });
      }
    } catch (err) {}
  }
};
