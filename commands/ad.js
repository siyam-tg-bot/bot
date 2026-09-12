const OWNER_NAME = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const ANTI_TAMPER = "𝆠፝";
const hiddenOwner = ANTI_TAMPER + OWNER_NAME;

if (hiddenOwner !== "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍") {
  process.exit(0);
}

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "ad",
    version: "1.1",
    author: hiddenOwner,
    countDown: 10,
    role: 0,
    category: "FUN & GAME",
    guide: "ad [reply to user or tag]"
  },

  onStart: async function ({ bot, msg, args }) {
    try {
      const chatId = msg.chat.id;
      const messageId = msg.message_id;
      let targetUserId = msg.from.id;

      if (msg.reply_to_message && msg.reply_to_message.from) {
        targetUserId = msg.reply_to_message.from.id;
      }

      let avatarURL = "https://i.imgur.com/74d53Qy.png";
      
      try {
        const userPhotos = await bot.getUserProfilePhotos(targetUserId, { limit: 1 });
        if (userPhotos && userPhotos.total_count > 0) {
          const fileId = userPhotos.photos[0][0].file_id;
          const fileLink = await bot.getFileLink(fileId);
          if (fileLink) {
            avatarURL = fileLink;
          }
        }
      } catch (err) {}

      const apiURL = `https://api.popcat.xyz/v2/ad?image=${encodeURIComponent(avatarURL)}`;

      const res = await axios.get(apiURL, {
        responseType: "arraybuffer"
      });

      const cacheFolder = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheFolder)) {
        fs.mkdirSync(cacheFolder, { recursive: true });
      }

      const filePath = path.join(
        cacheFolder,
        `ad_${targetUserId}_${Date.now()}.png`
      );

      fs.writeFileSync(filePath, res.data);

      await bot.sendPhoto(chatId, filePath, {
        caption: "📢কিরে শালা 😁তর এড দিয়া 😂ভাইরাল কইরা দিলাম🐸",
        reply_to_message_id: messageId
      });

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

    } catch (err) {
      console.error(err);
      await bot.sendMessage(msg.chat.id, "❌ | Failed to generate ad image.", {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
