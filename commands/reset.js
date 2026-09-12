const fs = require("fs");
const path = require("path");
const axios = require("axios");

const resetFilePath = path.join(__dirname, "reset_data.json");

(async () => {
  if (fs.existsSync(resetFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(resetFilePath, "utf8"));
      fs.unlinkSync(resetFilePath);

      const endTime = Date.now();
      const timeTaken = ((endTime - data.startTime) / 1000).toFixed(2);

      const convertToBold = (text) => {
        const charMap = {
          '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗','.' : '.'
        };
        return text.split('').map(c => charMap[c] || c).join('');
      };

      const boldTime = convertToBold(String(timeTaken));

      const text = `👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
🔄 𝐑𝐄𝐒𝐄𝐓 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄𝐃
───────────────
⏱️ 𝐓𝐈𝐌𝐄 𝐓𝐀𝐊𝐄𝐍: ${boldTime} 𝐒𝐄𝐂𝐎𝐍𝐃𝐒
───────────────
⚡ 𝐁𝐘: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

      const url = `https://api.telegram.org/bot${data.token}/editMessageText`;
      await axios.post(url, {
        chat_id: data.chatId,
        message_id: data.messageId,
        text: text
      });
    } catch (e) {}
  }
})();

module.exports = {
  name: "reset",
  aliases: ["restart", "reboot"],
  version: "1.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 2,
  category: "system",
  shortDescription: "Resets and restarts the bot",
  longDescription: "Restarts the bot process and displays the total time taken in seconds.",
  guide: "/reset",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const initialText = `👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
🔄 𝐑𝐄𝐒𝐄𝐓𝐓𝐈𝐍𝐆 𝐁𝐎𝐓...
───────────────
⏳ 𝐏𝐋𝐄𝐀𝐒𝐄 𝐖𝐀𝐈𝐓...
───────────────
⚡ 𝐁𝐘: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

    const sentMsg = await bot.sendMessage(chatId, initialText, {
      reply_to_message_id: messageId
    });

    const botToken = bot.token || (bot.options && bot.options.token) || process.env.BOT_TOKEN;

    const resetData = {
      chatId: chatId,
      messageId: sentMsg.message_id,
      startTime: Date.now(),
      token: botToken
    };

    fs.writeFileSync(resetFilePath, JSON.stringify(resetData, null, 2));

    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
};
