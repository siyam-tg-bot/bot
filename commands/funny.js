const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

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

const captionText = "===「𝐏𝐑𝐄𝐅𝐈𝐗-𝐄𝐕𝐄𝐍𝐓」=== \n--❖(✷‿𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓‿✷)❖-- \n✢━━━━━━━━━━━━━━━✢        \n🤡 ♡-𝐅𝐔𝐍𝐍𝐘-𝐕𝐈𝐃𝐄𝐎-♡ 🤡 \n✢━━━━━━━━━━━━━━━✢\n(✷‿𝐎𝐖𝐍𝐄𝐑:-𝐃𝐒-𝐒𝐈𝐘𝐀𝐌‿✷)";

// ভিডিও ডাউনলোড করার জন্য একটি ফাংশন
const downloadVideo = async (url, dest) => {
  const response = await axios({ url, method: 'GET', responseType: 'stream' });
  const writer = fs.createWriteStream(dest);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

module.exports = {
  name: "funny",
  version: "2.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "media",
  shortDescription: "Funny video sender 😃",
  longDescription: "Sends random funny video with emotional captions 😂",
  guide: "/funny",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let loadingMsg;
    try {
      loadingMsg = await bot.sendMessage(chatId, "🔄 𝗟𝗢𝗔𝗗𝗜𝗡𝙶 𝗙𝗨𝗡𝗡𝗬 𝗩𝗜𝗗𝗘𝗢...", {
        reply_to_message_id: messageId
      });
    } catch (e) {
      return;
    }

    try {
      const link = links[Math.floor(Math.random() * links.length)];
      const cacheFolder = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheFolder);
      const cachePath = path.join(cacheFolder, `funny_${Date.now()}.mp4`);

      // ভিডিও ডাউনলোড
      await downloadVideo(link, cachePath);

      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [ { text: "⏭️ 𝗡𝗘𝗫𝗧", callback_data: `funny_next` } ]
          ]
        }
      };

      // ভিডিও পাঠানো
      await bot.sendVideo(chatId, fs.createReadStream(cachePath), {
        caption: captionText,
        ...inlineKeyboard
      });

      // লোডিং মেসেজ ডিলিট করা
      if (loadingMsg && loadingMsg.message_id) {
        await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      }

      // ক্যাশ ফাইল মুছে ফেলা
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

    } catch (error) {
      if (loadingMsg && loadingMsg.message_id) {
        await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      }
      await bot.sendMessage(chatId, "❌ ভিডিও পাঠাতে সমস্যা হয়েছে!", { reply_to_message_id: messageId });
    }
  },

  onCallbackQuery: async (bot, query) => {
    const data = query.data;
    if (!data || data !== "funny_next") return;

    const chatId = query.message.chat.id;

    try {
      // বাটন ক্লিক করার পর লোডিং নোটিফিকেশন দেখানো
      await bot.answerCallbackQuery(query.id, { text: "🔄 Loading next video..." });

      const link = links[Math.floor(Math.random() * links.length)];
      const cacheFolder = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheFolder);
      const cachePath = path.join(cacheFolder, `funny_next_${Date.now()}.mp4`);

      await downloadVideo(link, cachePath);

      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [ { text: "⏭️ 𝗡𝗘𝗫𝗧", callback_data: `funny_next` } ]
          ]
        }
      };

      // নতুন ভিডিও পাঠানো হবে (আগের মেসেজ ডিলিট করার কোড এখানে নেই, তাই আগেরটি থেকে যাবে)
      await bot.sendVideo(chatId, fs.createReadStream(cachePath), {
        caption: captionText,
        ...inlineKeyboard
      });

      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

    } catch (e) {
      await bot.answerCallbackQuery(query.id, { text: "❌ Error loading video!" });
    }
  }
};
