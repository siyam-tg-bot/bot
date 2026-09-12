const axios = require("axios");
const fs = require("fs");
const path = require("path");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

module.exports = {
  config: {
    name: "voice",
    aliases: ["Voice", "fk"],
    version: "1.9",
    author: AUTHOR,
    role: 0,
    shortDescription: "Random captions with video and owner link",
    longDescription: "Bangla + English captions with direct video and owner contact link",
    category: "FUN",
    guide: "{pn}"
  },

  onStart: async function ({ bot, msg }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (this.config.author !== AUTHOR) {
      return bot.sendMessage(
        chatId,
        "⚠️ [ SECURITY ALERT ]\nAuthor name change detected! This command will not work unless the original author '𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍' is set.",
        { reply_to_message_id: messageId }
      );
    }

    let loadingMsg;
    const cacheDir = path.join(__dirname, "..", "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const tempPath = path.join(cacheDir, `voice_${Date.now()}.mp4`);

    try {
      loadingMsg = await bot.sendMessage(chatId, "⚡ 𝗦𝗜𝗬𝗔𝗠 𝗕𝗢𝗦𝗦 𝗔𝗥 𝗩𝗜𝗗𝗘𝗢 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 𝗛𝗢𝗦𝗦𝗘... ⚡", {
        reply_to_message_id: messageId
      });

      const data = [
        {
          cap: `জীবনটা সহজ না, কিন্তু সুন্দর 😊\nকষ্ট থাকলেও হাসতে শিখো 💫\nনিজের উপর বিশ্বাস রাখো 💪`,
          link: "https://files.catbox.moe/bs84st.mp4"
        },
        {
          cap: `সবাই পাশে থাকবে না 😌\nকিন্তু নিজে নিজেকে কখনো ছাড়ো না 💯\nনিজের ভ্যালু বুঝতে শিখো 🔥`,
          link: "https://files.catbox.moe/hgo8gp.mp4"
        },
        {
          cap: `স্বপ্ন দেখতে ভয় পেয়ো না 💭\nআজ ছোট হলেও কাল বড় হবে 🚀\nধৈর্য ধরো, সময় আসবে,⏳🕰️`,
          link: "https://files.catbox.moe/23zj4q.mp4"
        },
        {
          cap: `মন খারাপ হলেও চুপ থেকো না 😔\nনিজের সাথে কথা বলো 🙂\nসব ঠিক হয়ে যাবে একদিন 🌸`,
          link: "https://files.catbox.moe/gogfic.mp4"
        },
        {
          cap: `নিজের মতো থাকো 😎\nকারো জন্য বদলাতে যেও না ❌`,
          link: "https://files.catbox.moe/9uvit1.mp4"
        },
        {
          cap: `সময় অনেক কিছু শিখায় ⏳\nমানুষ চিনতে শেখায় 😶\nভুল থেকে শিক্ষা নাও 📖`,
          link: "https://files.catbox.moe/l15d8y.mp4"
        },
        {
          cap: `ভালোবাসা পেতে হলে আগে নিজেকে ভালোবাসো ❤️\nনিজের যত্ন নাও 💫\nনিজেই নিজের happiness 😊🌸`,
          link: "https://files.catbox.moe/22enjn.mp4"
        },
        {
          cap: `ছোট ছোট মুহূর্ত উপভোগ করো 📸\nএইগুলোই একদিন স্মৃতি হবে 💖\nহাসো, খেলো, বাঁচো 😊✨`,
          link: "https://files.catbox.moe/gitfya.mp4"
        },
        {
          cap: `জীবন একটা যুদ্ধ ⚔️\nহার মানলে শেষ 😔\nলড়াই চালিয়ে যাও 💪🔥`,
          link: "https://files.catbox.moe/src6qb.mp4"
        },
        {
          cap: `চুপ থাকা সবসময় দুর্বলতা না 🤫\nকখনো এটা শক্তি 💯\nসব কথা বলার দরকার নেই 😌`,
          link: "https://files.catbox.moe/9iqdo0.mp4"
        }
      ];

      const randomItem = data[Math.floor(Math.random() * data.length)];
      const footer = `\n✢━━━━━━━━━━━━━━━✢\n--❖(✷‿𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓‿✷)❖--\n✢━━━━━━━━━━━━━━━✢\n[সিয়াম বসের ফ্রেন্ড ফারহানের ভয়েজ]\n✢━━━━━━━━━━━━━━━✢\n(✷‿𝐎𝐖𝐍𝐄𝐑:-𝐒𝐈𝐘𝐀𝐌‿✷)`;

      const res = await axios.get(randomItem.link, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      fs.writeFileSync(tempPath, Buffer.from(res.data));

      await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

      await bot.sendVideo(chatId, fs.createReadStream(tempPath), {
        reply_to_message_id: messageId,
        caption: randomItem.cap + footer
      });

      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    } catch (error) {
      if (loadingMsg) await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

      console.error(error);
      return bot.sendMessage(chatId, "video load hote error hoyeche!", {
        reply_to_message_id: messageId
      });
    }
  }
};
