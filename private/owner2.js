const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const gifUrls = [
  "https://i.imgur.com/4FUSn8C.gif",
  "https://i.imgur.com/N3JxhT8.gif",
  "https://i.imgur.com/rOTsKJd.gif"
];

module.exports = {
  name: "owner2",
  version: "1.0.1",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "media",
  shortDescription: "𝗢𝗪𝗡𝗘𝗥 𝗚𝗜𝗙",
  longDescription: "𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗢𝗪𝗡𝗘𝗥 𝗚𝗜𝗙 𝗦𝗘𝗡𝗗𝗘𝗥 𝗪𝗜𝗧𝗛 𝗜𝗡𝗟𝗜𝗡𝗘 𝗕𝗨𝗧𝗧𝗢𝗡𝗦.",
  guide: "owner2",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let loadingMsg;
    try {
      loadingMsg = await bot.sendMessage(chatId, `🔄 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 𝗢𝗪𝗡𝗘𝗥 2...`, {
        reply_to_message_id: messageId
      });
    } catch (e) {
      return;
    }

    try {
      const cacheFolder = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheFolder);

      const filePath = path.join(
        cacheFolder,
        `owner2_${Date.now()}.gif`
      );

      const randomGifUrl = gifUrls[Math.floor(Math.random() * gifUrls.length)];

      const response = await axios({
        method: "GET",
        url: randomGifUrl,
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      fs.writeFileSync(filePath, Buffer.from(response.data));

      const replyText = `🫵তোর আব্বু লাগে 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑`;

      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "👑 𝗢𝗪𝗡𝗘𝗥", url: "https://t.me/ri_siyam" },
              { text: "🤖 𝗔𝗗𝗗 𝗕𝗢𝗧", url: "https://t.me/SiyamTgBot?startgroup=true" }
            ]
          ]
        }
      };

      await bot.sendAnimation(chatId, fs.createReadStream(filePath), {
        caption: replyText,
        ...inlineKeyboard
      });

      if (loadingMsg && loadingMsg.message_id) {
        await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

    } catch (e) {
      console.log(e);
      if (loadingMsg && loadingMsg.message_id) {
        await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      }
      await bot.sendMessage(chatId, `❌ 𝙺𝙰𝙹 𝙺𝙾𝚁𝚃𝙴 𝚂𝙾𝙼𝙾𝚂𝚂𝙰 𝙷𝙾𝚈𝙴𝙲𝙷𝙴!`, {
        reply_to_message_id: messageId
      });
    }
  }
};
