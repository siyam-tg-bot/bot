module.exports = {
  name: "autoreact",
  aliases: ["react"],
  version: "1.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "system",
  usePrefix: false,
  noPrefix: true,
  hasPrefix: false,
  nonPrefix: true,
  handleEvent: true,
  shortDescription: "Auto reacts to all messages",
  longDescription: "Automatically reacts with a random emoji to every message sent in the chat.",
  guide: "autoreact",

  execute: async (bot, msg, args) => {
    return;
  },

  onEvent: async function ({ bot, msg }) {
    if (!msg || !msg.chat || !msg.message_id) return;

    const emojis = [
      "👍", "👎", "❤️", "🔥", "🥰", "👏", "😁", "🤔", "🤯", "😱", 
      "🤬", "😢", "🎉", "🤩", "🤮", "💩", "🙏", "👌", "🕊️", "🤡", 
      "🥱", "🥴", "😍", "🐳", "🌭", "💯", "🤣", "⚡", "🍌", "🏆", 
      "💔", "🤨", "😐", "🍓", "🍾", "🍿", "🗣️", "🤝", "🫡", "👾", 
      "🫠", "💅", "🗿", "💘", "🙈", "🙉", "🙊", "🤖", "🎃", "🎄", 
      "💎", "👻", "⚡", "✨", "🌟", "💫", "💥", "🔥", "🌈", "☀️", 
      "🌙", "⭐", "🌺", "🌸", "🌼", "🌻", "🌹", "🌷", "🌱", "🌴", 
      "🎈", "🎁", "🎂", "🎃", "🎗️", "🎟️", "🎫", "🎖️", "🏆", "🥇", 
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", 
      "🎯", "🎮", "🕹️", "🎲", "🧩", "🎨", "🎭", "🎤", "🎧", "🎼", 
      "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🎬", "📱", "📲", 
      "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🗜️", "💽", "💾", "💿", "📀", 
      "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", 
      "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "⏱️", "⏲️", "⏰", "🕰️", 
      "⏳", "⌛", "📡", "🔋", "🔌", "💡", "🔦", "🕯️", "🧯", "🛢️", 
      "💸", "💵", "💴", "💶", "💷", "💰", "💳", "💎", "⚖️", "🧰", 
      "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🔩", "⚙️", "🧱", "⛓️", "🧲", 
      "🔫", "💣", "🔪", "🗡️", "⚔️", "🛡️", "🚬", "⚰️", "⚱️", "🏺", 
      "🔮", "📿", "🧿", "💈", "⚗️", "🔭", "🔬", "🕳️", "💊", "💉", 
      "🩸", "🩹", "🩺", "🏷️", "🔖", "🔑", "🗝️", "🚪", "🛋️", "🛏️", 
      "🛎️", "🖼️", "🛍️", "🛒", "🎁", "🎈", "✉️", "📩", "📨", "📧", 
      "📦", "🏷️", "📜", "📄", "📅", "📆", "📊", "📈", "📉", "📋", 
      "📌", "📍", "📎", "📏", "📐", "✂️", "🔒", "🔓", "🔏", "🔐", 
      "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", 
      "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", 
      "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", 
      "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🈳", "🈛", "⚠️", 
      "⛔", "🚫", "🚳", "🚭", "🚯", "🚱", "🚷", "📵", "🔞", "☢️", 
      "☣️", "⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️", "↕️", 
      "↔️", "↩️", "↪️", "⤴️", "⤵️", "🔃", "🔄", "🔙", "🔚", "🔛"
    ];

    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    try {
      await bot.setMessageReaction(msg.chat.id, msg.message_id, {
        reaction: [{ type: "emoji", emoji: randomEmoji }],
        is_big: false
      });
    } catch (e) {
      try {
        await bot._request("setMessageReaction", {
          chat_id: msg.chat.id,
          message_id: msg.message_id,
          reaction: JSON.stringify([{ type: "emoji", emoji: randomEmoji }])
        });
      } catch (err) {}
    }
  }
};
