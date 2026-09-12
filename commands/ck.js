const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ck",
    version: "1.2.1",
    author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    shortDescription: "Reply to get user info",
    category: "Media",
    guide: "{pn} [reply/admin]"
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    if (args[0] === "admin") {
      let adminMsg = `👤 𝐀𝐝𝐦𝐢𝐧: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n🌐 Telegram: t.me/SiyamHasan`;
      return bot.sendMessage(chatId, adminMsg, { reply_to_message_id: messageId });
    }

    let targetUser = msg.from;

    if (msg.reply_to_message && msg.reply_to_message.from) {
      targetUser = msg.reply_to_message.from;
    }

    const userId = targetUser.id;
    const firstName = targetUser.first_name || "Unknown";
    const lastName = targetUser.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const username = targetUser.username ? `@${targetUser.username}` : "None";

    let profileMsg = `📝 𝐍𝐚𝐦𝐞: ${fullName}\n🆔 𝐔𝐈𝐃: ${userId}\n🔗 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞: ${username}\n🤖 𝐈𝐬 𝐁𝐨𝐭: ${targetUser.is_bot ? "Yes" : "No"}`;

    try {
      const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });

      if (photos.total_count > 0) {
        const fileId = photos.photos[0][photos.photos[0].length - 1].file_id;
        return bot.sendPhoto(chatId, fileId, {
          caption: profileMsg,
          reply_to_message_id: messageId
        });
      } else {
        return bot.sendMessage(chatId, profileMsg, { reply_to_message_id: messageId });
      }
    } catch (err) {
      return bot.sendMessage(chatId, profileMsg, { reply_to_message_id: messageId });
    }
  }
};
