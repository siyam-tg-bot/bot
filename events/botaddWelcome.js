const config = require("../config");

const botJoinImages = [
  "https://i.imgur.com/y5a5BBP.jpeg",
  "https://i.imgur.com/586Aq55.jpeg"
];

module.exports = {
  name: "botaddWelcome",
  version: "1.0.2",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  category: "events",
  usePrefix: false,
  noPrefix: true,
  hasPrefix: false,
  nonPrefix: true,
  handleEvent: true,

  execute: async (bot, msg) => {
    return module.exports.handleBotJoin(bot, msg);
  },

  onEvent: async function ({ bot, msg }) {
    return module.exports.handleBotJoin(bot, msg);
  },

  handleBotJoin: async function (bot, msg) {
    if (!msg || !msg.chat) return;

    const chatId = msg.chat.id;
    const chatType = msg.chat.type;

    if (chatType !== "group" && chatType !== "supergroup") return;

    const newMembers = msg.new_chat_members || (msg.new_chat_participant ? [msg.new_chat_participant] : []);
    if (!newMembers || newMembers.length === 0) return;

    let botInfo = null;
    try {
      botInfo = await bot.getMe();
    } catch (e) {
      botInfo = { id: null, username: config.botUsername || "SiyamTgBot" };
    }

    const isBotAdded = newMembers.some(member => member.id === botInfo.id || (botInfo.username && member.username === botInfo.username));
    if (!isBotAdded) return;

    const chatTitle = msg.chat.title || "Group";

    let memberCount = "Unknown";
    try {
      if (typeof bot.getChatMemberCount === "function") {
        memberCount = await bot.getChatMemberCount(chatId);
      } else if (typeof bot.getChatMembersCount === "function") {
        memberCount = await bot.getChatMembersCount(chatId);
      }
    } catch (e) {}

    const ownerUsername = config.ownerUsername || "ri_siyam";
    const botUsername = botInfo.username || config.botUsername || "SiyamTgBot";

    const welcomeText = `✨ 𝐁𝐎𝐓 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✨
───────────────
👋 𝐇𝐄𝐋𝐋𝐎! 𝐓𝐇𝐀𝐍𝐊𝐒 𝐅𝐎𝐑 𝐀𝐃𝐃𝐈𝐍𝐆 𝐌𝐄

🤖 𝐁𝐎𝐓 𝐍𝐀𝐌𝐄: @${botUsername}
❤️ 𝐓𝐇𝐀𝐍𝐊𝐒 𝐅𝐎𝐑 𝐀𝐃𝐃𝐈𝐍𝐆 𝐌𝐄 𝐓𝐎 𝐘𝐎𝐔𝐑 𝐆𝐑𝐎𝐔𝐏

───────────────
📌 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
👥 𝐌𝐄𝐌𝐁𝐄𝐑𝐒: ${memberCount}
💬 𝐆𝐑𝐎𝐔𝐏: ${chatTitle}
🤖 𝐏𝐑𝐄𝐅𝐈𝐗: [ / ]

───────────────
📖 𝐆𝐄𝐓 𝐒𝐓𝐀𝐑𝐓𝐄𝐃
» /help - 𝐒𝐄𝐄 𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒
» 𝐂𝐀𝐋𝐋 - 𝐑𝐄𝐏𝐎𝐑𝐓 𝐀𝐍𝐘 𝐈𝐒𝐒𝐔𝐄
» 📞 +𝟖𝟖𝟎𝟏𝟖𝟗𝟏𝟑𝟖𝟏𝟓𝟕
───────────────
👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑

🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐄𝐕𝐄𝐑𝐘𝐎𝐍𝐄!`;

    const randomImgUrl = botJoinImages[Math.floor(Math.random() * botJoinImages.length)];

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
          { text: "📜 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓", callback_data: "cmd_list" }
        ],
        [
          { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${ownerUsername}` }
        ]
      ]
    };

    try {
      await bot.sendPhoto(chatId, randomImgUrl, {
        caption: welcomeText,
        reply_markup: replyMarkup
      });
    } catch (photoErr) {
      try {
        await bot.sendMessage(chatId, welcomeText, {
          reply_markup: replyMarkup
        });
      } catch (msgErr) {}
    }
  }
};
