const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

const links = [
  "https://drive.google.com/uc?id=14emH_6vF3fuJe2vmeC52e575TppboHne",
  "https://drive.google.com/uc?id=15APJbSuGLY7zCiZsAgU7HjCJeinYDX9K",
  "https://drive.google.com/uc?id=15ImMIXM_mqPM8hXpQNPLTGCrm9sh0RPS",
  "https://drive.google.com/uc?id=14qUnMm3J3cUqImDDy4ehRjDiv_NeRpMo",
  "https://drive.google.com/uc?id=15ZqanDuEYrC-lHSsiIYAjWagr1h8yZpP",
  "https://drive.google.com/uc?id=155rlKywUHP3xzgJkQ1ztxXpKnDxXtXlb",
  "https://drive.google.com/uc?id=156MaTKck-_ureBfj7NI-iU7_rGut-ssD",
  "https://drive.google.com/uc?id=15l4gxljfoe9-WvQKzffjambLC5Tt1YNd",
  "https://drive.google.com/uc?id=15fauLjjElJ0loxajhUvDeaKTqW4YdskK",
  "https://drive.google.com/uc?id=16IBAHr7AlKM1RR4hiTBuvAn5x27ed6j4",
  "https://drive.google.com/uc?id=15amvNN6WLIKwg17ufgFhs7EqI0EXNxy5",
  "https://drive.google.com/uc?id=15OS5gFi2QGZm5TTStIn6iD3YRUNHw1Zm",
  "https://drive.google.com/uc?id=168qMjWaEyObyBgJrilyTb4vOcvgynQAD",
  "https://drive.google.com/uc?id=15FFHINVpAbr4ykjkhk1_vQ5uDQakTcpy",
  "https://drive.google.com/uc?id=14j501R3TheTH3YLInLZlLTU-oXVvjegw",
  "https://drive.google.com/uc?id=15UmCBW1ddt6Kpt9xytqPpXiJip-05bDG",
  "https://drive.google.com/uc?id=14e0lCDG6vwzGi8apiDcm38Wov911501y",
  "https://drive.google.com/uc?id=15Cbl-YGajKcV0QMp6bDtRT4dI-K6lWR0",
  "https://drive.google.com/uc?id=15hJ9St2amhdLnowAvuDn0BicgZ5Aw0rW",
  "https://drive.google.com/uc?id=15QIjrXblGNjf5b3J6dRQ4XMSV-_j7soB",
  "https://drive.google.com/uc?id=15tgfSnX-ICfO8V5T6vXbb_AwYkfl_EYX"
];

const captions = [
  "===「𝐏𝐑𝐄𝐅𝐈𝐗-𝐄𝐕𝐄𝐍𝐓」=== \n--❖(✷‿𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓‿✷)❖-- \n✢━━━━━━━━━━━━━━━✢        \n🕋 ♡-𝐈𝐒𝐋𝐀𝐌𝐈𝐂-𝐕𝐈𝐃𝐄𝐎-♡ 🕋 \n✢━━━━━━━━━━━━━━━✢\n(✷‿𝐎𝐖𝐍𝐄𝐑:-‿𝐃-𝐒 𝐒𝐈𝐘𝐀𝐌‿✷)"
];

module.exports = {
  config: {
    name: "islamic",
    version: "2.2.0",
    author: AUTHOR,
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Islamic video sender 🕋"
    },
    longDescription: {
      en: "Sends random Islamic video with emotional captions and interactive next button 🕋"
    },
    category: "media"
  },

  execute: async (bot, msg, args) => {
    await sendIslamicVideo(bot, msg.chat.id, msg.message_id);
  },

  onStart: async function ({ bot, msg, args }) {
    await sendIslamicVideo(bot, msg.chat.id, msg.message_id);
  },

  onCallbackQuery: async function (bot, query) {
    try {
      const data = query.data;
      if (data === "islamic_next") {
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;

        await bot.answerCallbackQuery(query.id, { text: "⏳ পরবর্তী ভিডিও লোড হচ্ছে..." });
        
        // শুধু আগের ভিডিওর ক্যাপশন এডিট করে লোডিং মেসেজ দেখানো হবে, আগের ভিডিও ডিলিট হবে না
        await bot.editMessageCaption("⏳ *পরবর্তী ইসলামিক ভিডিও লোড করা হচ্ছে, একটু অপেক্ষা করুন...*", {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown"
        }).catch(() => {});

        const link = links[Math.floor(Math.random() * links.length)];
        const caption = captions[Math.floor(Math.random() * captions.length)];
        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const cachePath = path.join(cacheDir, `islamic_${Date.now()}.mp4`);

        const response = await axios({
          url: encodeURI(link),
          method: "GET",
          responseType: "stream"
        });

        const writer = fs.createWriteStream(cachePath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
          try {
            // আগের লোডিং মেসেজযুক্ত ভিডিওটি ডিলিট করে নতুন ভিডিও পাঠানো হবে
            await bot.deleteMessage(chatId, messageId);
          } catch (e) {}

          await bot.sendVideo(
            chatId,
            cachePath,
            {
              caption: caption,
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "⏭️ 𝐍𝐄𝐗𝐓", callback_data: "islamic_next" }
                  ],
                  [
                    { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" },
                    { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
                  ],
                  [
                    { text: "🔗 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊", url: "https://www.facebook.com/profile.php?id=61592677587804" }
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
      console.error("Islamic Callback Error:", err.message);
    }
  }
};

async function sendIslamicVideo(bot, chatId, messageId) {
  try {
    const loadingMsg = await bot.sendMessage(chatId, "⏳ *ইসলামিক ভিডিও লোড হচ্ছে, দয়া করে অপেক্ষা করুন...*", {
      parse_mode: "Markdown",
      reply_to_message_id: messageId
    });

    const link = links[Math.floor(Math.random() * links.length)];
    const caption = captions[Math.floor(Math.random() * captions.length)];
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const cachePath = path.join(cacheDir, `islamic_${Date.now()}.mp4`);

    const response = await axios({
      url: encodeURI(link),
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(cachePath);
    response.data.pipe(writer);

    writer.on("finish", async () => {
      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}

      await bot.sendVideo(
        chatId,
        cachePath,
        {
          caption: caption,
          reply_to_message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "⏭️ 𝐍𝐄𝐗𝐓", callback_data: "islamic_next" }
              ],
              [
                { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" },
                { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
              ],
              [
                { text: "🔗 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊", url: "https://www.facebook.com/profile.php?id=61592677587804" }
              ]
            ]
          }
        }
      );
      fs.unlinkSync(cachePath);
    });

    writer.on("error", async () => {
      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}
      await bot.sendMessage(chatId, "❌ ভিডিও পাঠাতে সমস্যা হয়েছে!", { reply_to_message_id: messageId });
    });

  } catch (error) {
    console.error(error);
    await bot.sendMessage(chatId, "❌ কিছু একটা সমস্যা হয়েছে ভিডিও আনতে।", { reply_to_message_id: messageId });
  }
}
