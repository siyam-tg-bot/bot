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
      } catch (err) {}
    }
  }
}

downloadVideos();

const _0x5a1b = ['U0lZQU0tSEFTQU4=', 'from'];
const getAuthor = () => Buffer[_0x5a1b[1]](_0x5a1b[0], 'base64').toString('utf-8');

module.exports = function(bot) {
  bot.on("message", async (msg) => {
    try {
      if (!msg.text || !msg.chat) return;

      const chatId = msg.chat.id;
      const messageId = msg.message_id;
      const senderID = msg.from ? msg.from.id.toString() : "";
      const text = msg.text.toLowerCase().trim();

      const ownerUsername = "ri_siyam";

      const triggers = [
        "@ri_siyam",
        "siyam",
        "সিয়াম ভাই",
        "boss siyam",
        "r",
        "সিয়াম",
        "বট ওনার কে"
      ];

      const isTriggered = triggers.some(trigger => text.includes(trigger.toLowerCase()));
      const isMentioned = msg.entities && msg.entities.some(entity => {
        if (entity.type === "mention") {
          const mentionedText = msg.text.substring(entity.offset, entity.offset + entity.length);
          return mentionedText.toLowerCase().includes(ownerUsername.toLowerCase());
        }
        return false;
      });

      if (!isTriggered && !isMentioned) return;

      const now = Date.now();
      if (lastReplyUser[senderID] && (now - lastReplyUser[senderID] < USER_COOLDOWN)) {
        return;
      }

      lastReplyUser[senderID] = now;

      const captions = [
        "Mantion_দিস না _সিয়াম বস এর মন মন ভালো নেই আস্কে-!💔🥀",
        "- আমার বস সিয়াম এর সাথে কেউ সেক্স করে না থুক্কু টেক্স করে নাহ🫂💔",
        "👉আমার বস ♻️ 𝑺𝒊𝒚𝒂𝒎 এখন বিজি আছে । তার ইনবক্সে এ মেসেজ দিয়ে রাখো https://t.me/ri_siyam 🔰 ♪√বস ফ্রি হলে আসবে🧡😁😜🐒",
        "বস সিয়াম কে এত মেনশন না দিয়ে ইনবক্স আসো হট করে দিবো🤷‍ঝাং 😘🥒",
        "বস সিয়াম কে Mantion_দিলে চুম্মাইয়া ঠুটের কালার change কইরা,লামু 💋😾😾🔨",
        "সিয়াম বস এখন বিজি জা বলার আমাকে বলতে পারেন_!!😼🥰",
        "সিয়াম বস কে এতো মেনশন নাহ দিয়া বস কে একটা জি এফ দে 😒 😏",
        "Mantion_না দিয়ে বস সিয়াম এর সাথে সিরিয়াস প্রেম করতে চাইলে ইনবক্স https://t.me/ri_siyam",
        "বস সিয়াম কে মেনশন দিসনা পারলে একটা জি এফ দে",
        "বাল পাকনা Mantion_দিস না বস সিয়াম প্রচুর বিজি আছে 🥵🥀🤐",
        "চুমু খাওয়ার বয়স টা আমার বস সিয়াম চকলেট🍫খেয়ে উড়িয়ে দিল 🤗"
      ];

      const rawCaption = captions[Math.floor(Math.random() * captions.length)];
      const styledCaption = `\n❖═══•༻🌺༺•═══❖\n『 ${rawCaption} 』\n❖═══•༻🌺༺•═══❖\n`;

      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "👤 𝗢𝗪𝗡𝗘𝗥", url: "https://t.me/ri_siyam" },
              { text: "🤖 𝗔𝗗𝗗 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
            ]
          ]
        }
      };

      const selectedVideo = videoList[Math.floor(Math.random() * videoList.length)];
      const videoPath = path.join(CACHE_DIR, selectedVideo.file);

      if (fs.existsSync(videoPath)) {
        await bot.sendVideo(chatId, fs.createReadStream(videoPath), {
          caption: styledCaption,
          ...inlineKeyboard,
          reply_to_message_id: messageId
        });
      } else {
        try {
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
            ...inlineKeyboard,
            reply_to_message_id: messageId
          });
        } catch (err) {
          await bot.sendMessage(chatId, styledCaption, { 
            ...inlineKeyboard,
            reply_to_message_id: messageId 
          });
        }
      }

    } catch (err) {}
  });
};
