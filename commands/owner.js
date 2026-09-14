const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const mediaLinks = [
  "https://files.catbox.moe/lyppld.mp4",
  "https://files.catbox.moe/4cct1h.jpg"
];

const countFile = path.join(__dirname, "cache", "owner_media_count.json");

function getNextMedia() {
  let index = 0;

  try {
    fs.ensureDirSync(path.join(__dirname, "cache"));
    if (fs.existsSync(countFile)) {
      const data = JSON.parse(fs.readFileSync(countFile, "utf8"));
      index = data.index || 0;
    }
  } catch (e) {
    console.log("Count file error:", e.message);
  }

  const media = mediaLinks[index];
  const nextIndex = (index + 1) % mediaLinks.length;

  try {
    fs.writeFileSync(countFile, JSON.stringify({ index: nextIndex }));
  } catch (e) {
    console.log("Write count error:", e.message);
  }

  return media;
}

module.exports = {
  name: "owner",
  version: "4.5.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "owner",
  shortDescription: "𝙾𝚆𝙽𝙴𝚁 𝙸𝙽𝙵𝙾",
  longDescription: "𝚂𝙷𝙾𝚆𝚂 𝚃𝙷𝙴 𝙱𝙾𝚃 𝙾𝚆𝙽𝙴𝚁 𝙳𝙴𝚃𝙰𝙸𝙻𝚂 𝚆𝙸𝚃𝙷 𝚁𝙾𝚃𝙰𝚃𝙸𝙽𝙶 𝙼𝙴𝙳𝙸𝙰.",
  guide: "owner",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const ownerFB1 = "https://www.facebook.com/share/14k1GZFVH2T/";
    const ownerFB2 = "https://www.facebook.com/share/14k1GZFVH2T/";

    const mediaUrl = getNextMedia();
    const time = moment().tz("Asia/Dhaka").format("hh:mm:ss A");
    const date = moment().tz("Asia/Dhaka").format("DD MMMM YYYY");

    const replyText = 
`───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 👑
───────────────
» 👤 𝗢𝗪𝗡𝗘𝗥 ➜ 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
» 🏠 𝗔𝗗𝗗𝗥𝗘𝗦𝗦: 𝗞𝗜𝗦𝗛𝗢𝗥𝗘𝗚𝗔𝗡𝗝
» 🕋 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡: 𝗜𝗦𝗟𝗔𝗠
» 🚻 𝗚𝗘𝗡𝗗𝗘𝗥: 𝗠𝗔𝗟𝗘
» 💞 𝗥𝗘𝗟𝗔𝗧𝗜𝗢𝗡𝗦𝗛𝗜𝗣: 𝗦𝗜𝗡𝗚𝗟𝗘
» 🧑‍🎓 𝗪𝗢𝗥𝗞: 𝗦𝗧𝗨𝗗𝗘𝗡𝗧
───────────────
» 📅 𝗗𝗮𝘁𝗲: ${date}
» ⏰ 𝗧𝗶𝗺𝗲: ${time}
───────────────
» 📞 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣: https://wa.me/+8801789138157
» 🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 𝟭: ${ownerFB1}
» 🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 𝟮: ${ownerFB2}
───────────────
» 📝 আরো দেখতে লিখুন: /owner2
───────────────
👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 ➜ 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑`;

    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "𝙾𝚆𝙽𝙴𝚁", url: "https://t.me/ri_siyam" },
            { text: "𝙰𝙳𝙳 𝙱𝙾𝚃", url: "https://t.me/SiyamTgBot?startgroup=true" }
          ]
        ]
      }
    };

    try {
      if (mediaUrl.endsWith(".mp4")) {
        await bot.sendVideo(chatId, mediaUrl, {
          caption: replyText,
          reply_to_message_id: messageId,
          ...inlineKeyboard
        });
      } else {
        await bot.sendPhoto(chatId, mediaUrl, {
          caption: replyText,
          reply_to_message_id: messageId,
          ...inlineKeyboard
        });
      }
    } catch (e) {
      await bot.sendMessage(chatId, replyText, {
        reply_to_message_id: messageId,
        ...inlineKeyboard
      });
    }
  }
};
