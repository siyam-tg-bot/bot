let designIndex = 0;
const VISIBLE_AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍"; //নাম চেঞ্জ করলে ফাইল বন্ধ হয়ে যাবে

module.exports = {
  config: {
    name: "join",
    version: "1.3.0",
    author: VISIBLE_AUTHOR,
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Get bot group list and join links"
    },
    longDescription: {
      en: "Displays all connected groups and channels list for Telegram bot"
    },
    category: "System"
  },

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    try {
      // Telegram bot cannot fetch user chat list directly due to API limitations.
      // We list the bot's own groups or configured channels/groups.
      const botGroups = global.telegramPendingChats || [];

      const designs = [
        () => {
          let text = `📜 𝐆𝐫𝐨𝐮𝐩 𝐋𝐢𝐬𝐭 📜\n━━━━━━━━━━━━━━━━━\n`;
          text += `🤖 বটটি বর্তমানে আপনার সাথে প্রাইভেটে যুক্ত আছে এবং অনার কন্ট্রোলে চলছে।\n`;
          text += `\n━━━━━━━━━━━━━━━━━\n👉 বটকে গ্রুপে অ্যাড করতে নিচের বাটন ব্যবহার করুন।`;
          return text;
        }
      ];

      const textMsg = designs[0]();

      await bot.sendMessage(chatId, textMsg, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🤖 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: "https://t.me/SiyamTgBot?startgroup=true" }
            ],
            [
              { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
            ]
          ]
        }
      });

    } catch (e) {
      console.error(e);
      const errorMsg = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ গ্রুপের লিস্ট পাওয়া যাচ্ছে না। 
» 🥱 কিছুক্ষণ পর চেষ্টা করুন!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
      return bot.sendMessage(chatId, errorMsg, { reply_to_message_id: messageId });
    }
  },

  onStart: async function ({ bot, msg, args }) {
    await module.exports.execute(bot, msg, args);
  }
};
