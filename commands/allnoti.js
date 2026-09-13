const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "allnoti",
    version: "3.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 2,
    shortDescription: "Owner Broadcast",
    longDescription: "Send notification with owner name",
    category: "admin",
    usages: "prefix allnoti <message>"
  },

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const broadcastMsg = args.join(" ");
    
    if (!broadcastMsg) {
      return bot.sendMessage(chatId, "⚠️ Message dao!", { reply_to_message_id: messageId });
    }

    let attachment = null;

    if (msg.reply_to_message && msg.reply_to_message.photo) {
      try {
        const photoArray = msg.reply_to_message.photo;
        const fileId = photoArray[photoArray.length - 1].file_id;
        const fileLink = await bot.getFileLink(fileId);
        
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }
        const filePath = path.join(cacheDir, "owner.jpg");

        const res = await axios.get(fileLink, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, res.data);

        attachment = fs.createReadStream(filePath);
      } catch (e) {
        console.error(e);
      }
    }

    const formattedText = `🔔 𝙉𝙊𝙏𝙄𝙁𝙄𝘾𝘼𝙏𝙄𝙊𝙉\n━━━━━━━━━━━━━━━\n📢 From Owner:𓆩👑-𝐒𝐈𝐘𝐀𝐌-👑𓆪\n\n${broadcastMsg}\n━━━━━━━━━━━━━━━`;

    try {
      if (attachment) {
        await bot.sendPhoto(chatId, attachment, {
          caption: formattedText,
          reply_to_message_id: messageId
        });
      } else {
        await bot.sendMessage(chatId, formattedText, {
          reply_to_message_id: messageId
        });
      }

      bot.sendMessage(
        chatId,
        `✅ Done Owner Broadcast\n✔️ Success: 1\n❌ Failed: 0`,
        { reply_to_message_id: messageId }
      );
    } catch (e) {
      console.error(e);
      bot.sendMessage(chatId, "❌ Broadcast pathate somossa hoyeche!", { reply_to_message_id: messageId });
    }
  }
};
