const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

const links = [
  "https://drive.google.com/uc?id=1Zg6YCrfLNFVPuIarV3ZBvyg9NW9vKf-i",
  "https://drive.google.com/uc?id=1Tu7vjhlkUls3SKSTl-pGK3y69NYgeGMe",
  "https://drive.google.com/uc?id=1vHhwiHHDRJpflMGCU0Alg7A5ARkugLya", 
  "https://drive.google.com/uc?id=1KrHanrUqkqr0kFjFh1abl72xlmZ0_18a",
  "https://drive.google.com/uc?id=1rs6cbx8oOYg2Zgi_0UZHfbDhEz8LjFlU",
  "https://drive.google.com/uc?id=1thJh4_fG8DYdgKiOhsy8Jkp98O0m-23b",
  "https://drive.google.com/uc?id=1T5x_hAEu5yozou0HeNrCHC6GS3XbgTSx",
  "https://drive.google.com/uc?id=1CRvedhuz9z2JWLY6LH2dNgtt7cwuBBsG",
  "https://drive.google.com/uc?id=1RbPFrHj4y7eno8OsAuYElOfdOsJ75eZp",
  "https://drive.google.com/uc?id=1mY0B0yGi90h0K1GvxVdZ7eLkj-Q-W2Eq",
  "https://drive.google.com/uc?id=1xgh5EePrQq62zeDRu2YAkJTrAXSCXpOp",
  "https://drive.google.com/uc?id=1-aZjX6vnC1HDn25jBoexmyLBlm6bLwli",
  "https://drive.google.com/uc?id=1znMcAJbcDnS0oDG6LCUH8PN0gZOJxhRC", 
  "https://drive.google.com/uc?id=1teEOVYZwvGuz75_Is_ZEEvZwroB1IZW8", 
  "https://drive.google.com/uc?id=10gQjKcAL8MkXOqi8vLYqPYiFg0_Qh-rR", 
  "https://drive.google.com/uc?id=1b0xOpxhPq0xZO7QDpU4BZ-OnRKYPMdLD", 
  "https://drive.google.com/uc?id=1-KLse2-7YKacnPGL7zHH5_KOHQUbVUt0"
];

const captions = [
  "===「𝐏𝐑𝐄𝐅𝐈𝐗-𝐄𝐕𝐄𝐍𝐓」=== \n--❖(✷‿𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓‿✷)❖-- \n✢━━━━━━━━━━━━━━━✢        \n🤡 ♡-𝐅𝐔𝐍𝐍𝐘-𝐕𝐈𝐃𝐄𝐎-♡ 🤡 \n✢━━━━━━━━━━━━━━━✢\n(✷‿𝐎𝐖𝐍𝐄𝐑:-𝐃𝐒-𝐒𝐈𝐘𝐀𝐌‿✷)"
];

module.exports = {
  config: {
    name: "funny",
    version: "2.1.0",
    author: AUTHOR,
    countDown: 5,
    role: 0,
    shortDescription: "Funny video sender 😃",
    longDescription: "Sends random funny video with interactive buttons 😂",
    category: "media",
    guide: {
      en: "{pn}"
    }
  },

  execute: async function ({ bot, msg, args }) {
    await sendFunnyVideo(bot, msg.chat.id, msg.message_id);
  },

  onStart: async function ({ bot, msg, args }) {
    await sendFunnyVideo(bot, msg.chat.id, msg.message_id);
  },

  onCallbackQuery: async function (bot, query) {
    try {
      const data = query.data;
      if (data === "funny_next") {
        const chatId = query.message.chat.id;

        await bot.answerCallbackQuery(query.id, { text: "⏳ পরবর্তী ফানি ভিডিও পাঠানো হচ্ছে..." });

        const link = links[Math.floor(Math.random() * links.length)];
        const caption = captions[Math.floor(Math.random() * captions.length)];
        const cachePath = path.join(__dirname, "cache", `funny_${Date.now()}.mp4`);

        await fs.ensureDir(path.join(__dirname, "cache"));

        const response = await axios({
          url: encodeURI(link),
          method: "GET",
          responseType: "arraybuffer",
          maxRedirects: 5
        });

        await fs.writeFile(cachePath, response.data);

        await bot.sendVideo(chatId, fs.createReadStream(cachePath), {
          caption: `「 ${caption} 」`,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "⏭️ 𝐍𝐄𝐗𝐓", callback_data: "funny_next" },
                { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
              ],
              [
                { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
              ]
            ]
          }
        });

        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }
    } catch (err) {
      console.error("Funny Callback Error:", err.message);
    }
  }
};

async function sendFunnyVideo(bot, chatId, messageId) {
  let loadingMsg;
  try {
    loadingMsg = await bot.sendMessage(chatId, "⏳ *ফানি ভিডিও লোড হচ্ছে, দয়া করে অপেক্ষা করুন...*", {
      parse_mode: "Markdown",
      reply_to_message_id: messageId
    });

    const link = links[Math.floor(Math.random() * links.length)];
    const caption = captions[Math.floor(Math.random() * captions.length)];
    const cachePath = path.join(__dirname, "cache", `funny_${Date.now()}.mp4`);

    await fs.ensureDir(path.join(__dirname, "cache"));

    const response = await axios({
      url: encodeURI(link),
      method: "GET",
      responseType: "arraybuffer",
      maxRedirects: 5
    });

    await fs.writeFile(cachePath, response.data);

    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) {}

    await bot.sendVideo(chatId, fs.createReadStream(cachePath), {
      caption: `「 ${caption} 」`,
      reply_to_message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⏭️ 𝐍𝐄𝐗𝐓", callback_data: "funny_next" },
            { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
          ],
          [
            { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
          ]
        ]
      }
    });

    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

  } catch (error) {
    console.error(error);
    if (loadingMsg) {
      try { await bot.deleteMessage(chatId, loadingMsg.message_id); } catch (e) {}
    }
    bot.sendMessage(chatId, "❌ ভিডিও পাঠাতে সমস্যা হয়েছে!", { reply_to_message_id: messageId });
  }
}
