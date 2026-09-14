const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");

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
  } catch (e) {}

  const media = mediaLinks[index];
  const nextIndex = (index + 1) % mediaLinks.length;

  try {
    fs.writeFileSync(countFile, JSON.stringify({ index: nextIndex }));
  } catch (e) {}

  return media;
}

module.exports = {
  name: "owner",
  version: "4.5.5",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "owner",
  shortDescription: "𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢",
  longDescription: "𝗦𝗛𝗢𝗪𝗦 𝗧𝗛𝗘 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 𝗪𝗜𝗧𝗛 𝗥𝗢𝗧𝗔𝗧𝗜𝗡𝗚 𝗠𝗘𝗗𝗜𝗔.",
  guide: "owner",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let loadingMsg;
    try {
      loadingMsg = await bot.sendMessage(chatId, `🔄 𝗟𝗢𝗔𝗗𝗜𝗡𝙶 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢...`, {
        reply_to_message_id: messageId
      });
    } catch (e) {
      return;
    }

    const ownerFB1 = "https://www.facebook.com/share/14k1GZFVH2T/";
    const ownerFB2 = "https://www.facebook.com/share/14k1GZFVH2T/";
    const ownerWA = "https://wa.me/+8801789138157";

    const mediaUrl = getNextMedia();
    const time = moment().tz("Asia/Dhaka").format("hh:mm:ss A");
    const date = moment().tz("Asia/Dhaka").format("DD MMMM YYYY");

    const replyText = 
`───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 👑
───────────────
» 👤 𝗢𝗪𝗡𝗘𝗥 ➜ 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
» 🏠 𝗔𝗗𝗗𝗥𝗘𝗦𝗦: 𝗞𝗜𝗦𝗛𝗢𝗥𝗘𝗚𝗔𝗡𝗝
» 🕋 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡: 𝗜𝗦𝗟𝗔𝗠
» 🚻 𝗚𝗘𝗡𝗗𝗘𝗥: 𝗠𝗔𝗟𝗘
» 💞 𝗥𝗘𝗟𝗔𝗧𝗜𝗢𝗡𝗦𝗛𝗜𝗣: 𝗦𝗜𝗡𝗚𝗟𝗘
» 🧑‍🎓 𝗪𝗢𝗥𝗞: 𝗦𝗧𝗨𝗗𝗘𝗡𝗧
───────────────
» 📅 𝗗𝗮𝘁𝗲: ${date}
» ⏰ 𝗧𝗶𝗺𝗲: ${time}
───────────────
» 📝 আরো দেখতে লিখুন: /owner2
───────────────
👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 ➜ 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑`;

    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "👤 𝗢𝗪𝗡𝗘𝗥", url: "https://t.me/ri_siyam" },
            { text: "🤖 𝗔𝗗𝗗 𝗕𝗢𝗧", url: "https://t.me/SiyamTgBot?startgroup=true" }
          ],
          [
            { text: "🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 𝟭", url: ownerFB1 },
            { text: "🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 𝟮", url: ownerFB2 }
          ],
          [
            { text: "📞 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣", url: ownerWA }
          ]
        ]
      }
    };

    try {
      if (mediaUrl.endsWith(".mp4")) {
        await bot.sendVideo(chatId, mediaUrl, {
          caption: replyText,
          ...inlineKeyboard
        });
      } else {
        await bot.sendPhoto(chatId, mediaUrl, {
          caption: replyText,
          ...inlineKeyboard
        });
      }

      if (loadingMsg && loadingMsg.message_id) {
        await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      }
    } catch (err) {
      try {
        await bot.editMessageText(replyText, {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
          reply_markup: inlineKeyboard.reply_markup
        });
      } catch (e) {
        await bot.sendMessage(chatId, replyText, inlineKeyboard);
      }
    }
  }
};
