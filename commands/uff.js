const axios = require("axios");
const fs = require("fs");
const path = require("path");

const AUTHOR = "Vex_Kshitiz";

async function checkAuthor(authorName) {
  try {
    const response = await axios.get('https://author-check.vercel.app/name', { timeout: 5000 });
    const apiAuthor = response.data.name;
    return apiAuthor === authorName;
  } catch (error) {
    return true;
  }
}

module.exports = {
  config: {
    name: "uff",
    aliases: ["onlytik"],
    version: "1.0",
    author: AUTHOR,
    role: 2,
    shortDescription: "18+ tiktok video",
    longDescription: "18+ tiktok video downloader",
    category: "18+",
    guide: "{pn}"
  },

  onStart: async function ({ bot, msg }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const isAuthorValid = await checkAuthor(this.config.author);
    if (!isAuthorValid) {
      return bot.sendMessage(chatId, "❌ Author changer alert! This command belongs to Vex_Kshitiz.", {
        reply_to_message_id: messageId
      });
    }

    const cacheDir = path.join(__dirname, "..", "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const tempVideoPath = path.join(cacheDir, `${Date.now()}.mp4`);
    const apiUrl = "https://only-tik.vercel.app/kshitiz";

    let processingMsg;
    try {
      processingMsg = await bot.sendMessage(chatId, "⏳ Processing video...", {
        reply_to_message_id: messageId
      });

      const response = await axios.get(apiUrl, { timeout: 15000 });
      const videoUrl = response.data ? (response.data.videoUrl || response.data.url) : null;

      if (!videoUrl) {
        throw new Error("Video URL not found");
      }

      const videoResponse = await axios.get(videoUrl, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      fs.writeFileSync(tempVideoPath, Buffer.from(videoResponse.data));

      await bot.deleteMessage(chatId, processingMsg.message_id).catch(() => {});

      await bot.sendVideo(chatId, fs.createReadStream(tempVideoPath), {
        reply_to_message_id: messageId,
        caption: "🔞 Here is your video"
      });

      if (fs.existsSync(tempVideoPath)) {
        fs.unlinkSync(tempVideoPath);
      }

    } catch (error) {
      if (processingMsg) {
        await bot.deleteMessage(chatId, processingMsg.message_id).catch(() => {});
      }
      if (fs.existsSync(tempVideoPath)) {
        fs.unlinkSync(tempVideoPath);
      }

      console.error("Error fetching OnlyTik video:", error);
      return bot.sendMessage(chatId, "⚠️ Sorry, an error occurred while processing your request.", {
        reply_to_message_id: messageId
      });
    }
  }
};
