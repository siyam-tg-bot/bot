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
  version: "1.0.8",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "media",
  shortDescription: "𝗢𝗪𝗡𝗘𝗥 𝗚𝗜𝗙",
  longDescription: "𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗢𝗪𝗡𝗘𝗥 𝗚𝗜𝗙 𝗦𝗘𝗡𝗗𝗘𝗥 𝗪𝗜𝗧𝗛 𝗡𝗘𝗫𝗧 𝗕𝗨𝗧𝗧𝗢𝗡",
  guide: "owner2",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let loadingMsg;
    try {
      loadingMsg = await bot.sendMessage(chatId, `🔄 𝗟𝗢𝗔𝗗𝗜𝗡𝙶 𝗢𝗪𝗡𝗘𝗥 2...`, {
        reply_to_message_id: messageId
      });
    } catch (e) {
      return;
    }

    try {
      const cacheFolder = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheFolder);

      const filePath = path.join(cacheFolder, `owner2_${Date.now()}.gif`);
      const index = 0;
      const randomGifUrl = gifUrls[index];

      const response = await axios({
        method: "GET",
        url: randomGifUrl,
        responseType: "arraybuffer",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      fs.writeFileSync(filePath, Buffer.from(response.data));

      const replyText = `🫵তোর আব্বু লাগে 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n\n📄 𝗣𝗔𝗚𝗘: ${index + 1}/${gifUrls.length}`;

      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "⏭️ 𝗡𝗘𝗫𝗧", callback_data: `owner2_next_${index + 1}` }
            ],
            [
              { text: "👤 𝗢𝗪𝗡𝗘𝗥", url: "https://t.me/ri_siyam" },
              { text: "🤖 𝗔𝗗𝗗 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
            ]
          ]
        }
      };

      global.owner2Session = global.owner2Session || {};
      global.owner2Session[chatId] = { gifUrls };

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
      await bot.sendMessage(chatId, `❌ 𝗞𝗔𝗝 𝗞𝗢𝗥𝗧𝗘 𝗦𝗢𝗠𝗢𝗦𝗦𝗔 𝗛𝗢𝗬𝗘𝗖𝗛𝗘!`, {
        reply_to_message_id: messageId
      });
    }
  }
};

module.exports.handleCallbackQuery = async (bot, query) => {
  const data = query.data;
  if (!data || !data.startsWith("owner2_")) return;

  const chatId = query.message.chat.id;

  const session = global.owner2Session && global.owner2Session[chatId];
  if (!session) {
    return bot.answerCallbackQuery(query.id, { text: "𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗘𝗫𝗣𝗜𝗥𝗘𝗗!", show_alert: true });
  }

  const { gifUrls } = session;

  if (data.startsWith("owner2_next_")) {
    let currentIndex = parseInt(data.split("_")[2]);
    if (isNaN(currentIndex)) currentIndex = 0;

    let nextIndex = currentIndex % gifUrls.length;
    const gifUrl = gifUrls[nextIndex];

    try {
      const cacheFolder = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheFolder);
      const filePath = path.join(cacheFolder, `owner2_next_${Date.now()}.gif`);

      const response = await axios({
        method: "GET",
        url: gifUrl,
        responseType: "arraybuffer",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      fs.writeFileSync(filePath, Buffer.from(response.data));

      const displayPage = nextIndex + 1;
      const replyText = `🫵তোর আব্বু লাগে 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n\n📄 𝗣𝗔𝗚𝗘: ${displayPage}/${gifUrls.length}`;

      const nextPointer = (nextIndex + 1) % gifUrls.length;

      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "⏭️ 𝗡𝗘𝗫𝗧", callback_data: `owner2_next_${nextPointer}` }
            ],
            [
              { text: "👤 𝗢𝗪𝗡𝗘𝗥", url: "https://t.me/ri_siyam" },
              { text: "🤖 𝗔𝗗𝗗 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
            ]
          ]
        }
      };

      await bot.sendAnimation(chatId, fs.createReadStream(filePath), {
        caption: replyText,
        ...inlineKeyboard
      });

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

    } catch (e) {
      console.log(e);
    }

    await bot.answerCallbackQuery(query.id);
  }
};
