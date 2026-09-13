const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

const links = [
  "https://drive.google.com/uc?id=1xLc_9r1TYGVM0J33hJ61hmW3yXOBTcEo",
  "https://drive.google.com/uc?id=1xFVA97twVhvJJzmxhXjT9QukwWEDRO2a",
  "https://drive.google.com/uc?id=1xC8J23XORH4zHsXCDkfrgzmVBm1_-b5E",
  "https://drive.google.com/uc?id=1x5EX0grUJwEKzHyzeR63HnzC_UlDdJD6",
  "https://drive.google.com/uc?id=1xM82tBosefpCvaDokhufHoikub1Opupz",
  "https://drive.google.com/uc?id=1xhCqfx7pScogeGph4T4ITnRJFYcUNmJ8",
  "https://drive.google.com/uc?id=1xTgkjk__QRMOVQnkQsSIcEzGfRUwUDLY",
  "https://drive.google.com/uc?id=1xRsWDPe485xXPna9nWhj0TaW_Q9lVJDd",
  "https://drive.google.com/uc?id=1xC30T2eSDWZGr_O8699yxaMS-AZ_X5y8",
  "https://drive.google.com/uc?id=1xcoHMLkNU1naPET4bP2sEiHoXUF23w-R",
  "https://drive.google.com/uc?id=1xcN88lPjPoRJhdxCUesuTFFArtvbUNL2",
  "https://drive.google.com/uc?id=1xUee8t4ukXW_XD4K4pGV_I4VFccwdyqt",
  "https://drive.google.com/uc?id=1xgfepctwXjZ5Y9kxhD3HcTTaJcsWHi-x",
  "https://drive.google.com/uc?id=1xhymaD6J1patQzfass5-e4ewUDg8gnQ9",
  "https://drive.google.com/uc?id=1xCvCvUa2zVWLm3y1pAGFKrr-emyaFicK",
  "https://drive.google.com/uc?id=1x87CHgjwaOjANyN_06_JqB-YKaUQGU2b"
];

const captions = [
  "===「𝐏𝐑𝐄𝐅𝐈𝐗-𝐄𝐕𝐄𝐍𝐓」=== \n--❖(✷‿𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓‿✷)❖-- \n✢━━━━━━━━━━━━━━━✢        \n🎀 ♡-𝐋💞𝐕𝐄-𝐕𝐈𝐃💍-♡ 🎀 \n✢━━━━━━━━━━━━━━━✢\n(✷‿𝐎𝐖𝐍𝐄𝐑:-‿𝐃𝐒-𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍✷)"
];

module.exports = {
  config: {
    name: "love",
    version: "2.2.0",
    author: AUTHOR,
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Love/Sad video sender 💔"
    },
    longDescription: {
      en: "Sends random love/sad video with emotional captions and interactive buttons 💔"
    },
    category: "media"
  },

  execute: async (bot, msg, args) => {
    await sendLoveVideo(bot, msg.chat.id, msg.message_id);
  },

  onStart: async function ({ bot, msg, args }) {
    await sendLoveVideo(bot, msg.chat.id, msg.message_id);
  },

  onCallbackQuery: async function (bot, query) {
    try {
      const data = query.data;
      if (data === "love_next") {
        const chatId = query.message.chat.id;

        await bot.answerCallbackQuery(query.id, { text: "⏳ পরবর্তী ভিডিও পাঠানো হচ্ছে..." });

        const link = links[Math.floor(Math.random() * links.length)];
        const caption = captions[Math.floor(Math.random() * captions.length)];
        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const cachePath = path.join(cacheDir, `love_${Date.now()}.mp4`);

        const response = await axios({
          url: encodeURI(link),
          method: "GET",
          responseType: "stream"
        });

        const writer = fs.createWriteStream(cachePath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
          // আগের ভিডিও বা মেসেজ ডিলিট না করে সরাসরি নতুন ভিডিও পাঠানো হবে
          await bot.sendVideo(
            chatId,
            cachePath,
            {
              caption: caption,
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "⏭️ 𝐍𝐄𝐗𝐓", callback_data: "love_next" },
                    { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
                  ],
                  [
                    { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
                  ]
                ]
              }
            }
          );
          fs.unlinkSync(cachePath);
        });

        writer.on("error", async () => {
          await bot.sendMessage(chatId, "❌ ভিডিও পাঠাতে সমস্যা হয়েছে!");
        });
      }
    } catch (err) {
      console.error("Love Callback Error:", err.message);
    }
  }
};

async function sendLoveVideo(bot, chatId, messageId) {
  try {
    const link = links[Math.floor(Math.random() * links.length)];
    const caption = captions[Math.floor(Math.random() * captions.length)];
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const cachePath = path.join(cacheDir, `love_${Date.now()}.mp4`);

    const response = await axios({
      url: encodeURI(link),
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(cachePath);
    response.data.pipe(writer);

    writer.on("finish", async () => {
      await bot.sendVideo(
        chatId,
        cachePath,
        {
          caption: caption,
          reply_to_message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "⏭️ 𝐍𝐄𝐗𝐓", callback_data: "love_next" },
                { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
              ],
              [
                { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
              ]
            ]
          }
        }
      );
      fs.unlinkSync(cachePath);
    });

    writer.on("error", async () => {
      await bot.sendMessage(chatId, "❌ ভিডিও পাঠাতে সমস্যা হয়েছে!", { reply_to_message_id: messageId });
    });

  } catch (error) {
    console.error(error);
    await bot.sendMessage(chatId, "❌ কিছু একটা সমস্যা হয়েছে ভিডিও আনতে।", { reply_to_message_id: messageId });
  }
}
