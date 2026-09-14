const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const videoList = [
  { url: "https://files.catbox.moe/3nus2b.mp4", file: "video1.mp4" },
  { url: "https://files.catbox.moe/t2kbfa.mp4", file: "video2.mp4" },
  { url: "https://files.catbox.moe/qu53g7.mp4", file: "video3.mp4" },
  { url: "https://files.catbox.moe/rzhmck.mp4", file: "video4.mp4" },
  { url: "https://files.catbox.moe/g7jy2d.mp4", file: "video5.mp4" }
];

const USER_COOLDOWN = 3 * 60 * 1000;
const lastReplyUser = {};

async function downloadVideos() {
  for (const vid of videoList) {
    const filePath = path.join(CACHE_DIR, vid.file);
    if (!fs.existsSync(filePath)) {
      try {
        const response = await axios({
          method: "GET",
          url: vid.url,
          responseType: "stream",
          timeout: 30000
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      } catch (err) {
        console.log(`[DOWNLOAD] Failed: ${vid.file}`, err.message);
      }
    }
  }
}

downloadVideos();

module.exports = {
  config: {
    name: "mantion",
    version: "14.5",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    shortDescription: { en: "Admin mention auto reply" },
    category: "system",
    countDown: 0,
    guide: { en: "{pn}" }
  },

  onStart: async function () {},

  // টেলিগ্রাম ইভেন্টের জন্য onChat বা handleMessage दोन्ही సపోర్ట్ చేసేలా 
  onChat: async function ({ api: bot, event: msg }) {
    let loadingMsg = null;
    try {
      if (!msg) return;
      const chatId = msg.chat ? msg.chat.id : msg.threadID;
      const senderID = String(msg.from ? msg.from.id : msg.senderID);
      const text = msg.text ? msg.text.toLowerCase().trim() : (msg.body ? msg.body.toLowerCase().trim() : "");

      const triggers = [
        "siyam",
        "সিয়াম ভাই",
        "@SiyamTgBot",
        "@ri_siyam",
        "সিয়াম",
        "বট ওনার কে"
      ];

      const isTriggered = triggers.some(trigger => text.includes(trigger));
      const isMentioned = (msg.entities && msg.entities.some(e => e.type === "mention" || e.type === "text_mention")) || (msg.mentions && Object.keys(msg.mentions).length > 0);

      if (!isTriggered && !isMentioned) return;

      const now = Date.now();
      if (lastReplyUser[senderID] && (now - lastReplyUser[senderID] < USER_COOLDOWN)) {
        return;
      }

      lastReplyUser[senderID] = now;

      try {
        loadingMsg = await bot.sendMessage(chatId, `🔄 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 𝗥𝗘𝗣𝗟𝗬...`, {
          reply_to_message_id: msg.message_id || msg.messageID
        });
      } catch (e) {
        // লোডিং মেসেজ পাঠানো না গেলে ইগনোর করবে
      }

      const captions = [
        "Mantion_দিস না _সিয়াম বস এর মন মন ভালো নেই আস্কে-!💔🥀",
        "- আমার বস সিয়াম এর সাথে কেউ সেক্স করে না থুক্কু টেক্স করে নাহ🫂💔",
        "👉আমার বস ♻️ 𝑺𝒊𝒚𝒂𝒎 এখন বিজি আছে । তার ইনবক্সে এ মেসেজ দিয়ে রাখো https://www.facebook.com/profile.php?id=61589656899295🔰 ♪√বস ফ্রি হলে আসবে🧡😁😜🐒",
        "বস সিয়াম কে এত মেনশন না দিয়ে باکس আসো হট করে দিবো🤷‍ঝাং 😘🥒",
        "বস সিয়াম কে Mantion_দিলে চুম্মাইয়া ঠুটের কালার change কইরা,লামু 💋😾😾🔨",
        "সিয়াম বস এখন বিজি জা বলার আমাকে বলতে পারেন_!!😼🥰",
        "সিয়াম বস কে এতো মেনশন নাহ দিয়া বস কে একটা জি এফ দে 😒 😏",
        "Mantion_না দিয়ে বস সিয়াম এর সাথে সিরিয়াস প্রেম করতে চাইলে ইনবক্স https://www.facebook.com/profile.php?id=61589656899295",
        "বস সিয়াম কে মেনশন দিসনা পারলে একটা জি এফ দে",
        "বাল পাকনা Mantion_দিস না বস সিয়াম প্রচুর বিজি আছে 🥵🥀🤐",
        "চুমু খাওয়ার বয়স টা আমার বস সিয়াম চকলেট🍫খেয়ে উড়িয়ে দিল 🤗"
      ];

      const rawCaption = captions[Math.floor(Math.random() * captions.length)];
      const styledCaption = 
`───────────────
『 ${rawCaption} 』
───────────────
👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "👤 𝗢𝗪𝗡𝗘𝗥", url: "https://t.me/ri_siyam" },
              { text: "🤖 𝗔𝗗𝗗 𝗕𝗢𝚃", url: "https://t.me/SiyamTgBot?startgroup=true" }
            ]
          ]
        }
      };

      const selectedVideo = videoList[Math.floor(Math.random() * videoList.length)];
      const videoPath = path.join(CACHE_DIR, selectedVideo.file);

      if (fs.existsSync(videoPath)) {
        await bot.sendVideo(chatId, fs.createReadStream(videoPath), {
          caption: styledCaption,
          reply_to_message_id: msg.message_id || msg.messageID,
          ...inlineKeyboard
        });
      } else {
        const response = await axios({
          method: "GET",
          url: selectedVideo.url,
          responseType: "stream",
          timeout: 30000
        });

        const writer = fs.createWriteStream(videoPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        await bot.sendVideo(chatId, fs.createReadStream(videoPath), {
          caption: styledCaption,
          reply_to_message_id: msg.message_id || msg.messageID,
          ...inlineKeyboard
        });
      }

      if (loadingMsg && (loadingMsg.message_id || loadingMsg.messageID)) {
        await bot.deleteMessage(chatId, loadingMsg.message_id || loadingMsg.messageID).catch(() => {});
      }

    } catch (err) {
      console.log("AdminMention Error:", err.message);

      if (loadingMsg && (loadingMsg.message_id || loadingMsg.messageID)) {
        await bot.deleteMessage(chatId, loadingMsg.message_id || loadingMsg.messageID).catch(() => {});
      }

      const chatId = msg.chat ? msg.chat.id : msg.threadID;
      await bot.sendMessage(chatId, `❌ 𝗞𝗔𝗝 𝗞𝗢𝗥𝗧𝗘 𝗦𝗢𝗠𝗢𝗦𝗦𝗔 𝗛𝗢𝗬𝗘𝗖𝗛𝗘!`, {
        reply_to_message_id: msg.message_id || msg.messageID
      }).catch(() => {});
    }
  },

  handleMessage: async function (bot, msg) {
    return this.onChat({ api: bot, event: msg });
  }
};
