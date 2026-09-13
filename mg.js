const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "mg",
    aliases: ["magic"],
    version: "1.0.1",
    author: "Denish",
    countDown: 0,
    role: 0,
    shortDescription: "Magic Image Generator",
    longDescription: "Generate AI images using Magic Generator API.",
    category: "ai",
    guide: "{p}mg <prompt>"
  },

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const prompt = args.join(" ");

    if (!prompt) {
      return bot.sendMessage(chatId, "⚠️ Please give me a prompt!", {
        reply_to_message_id: messageId
      });
    }

    const waitingMsg = await bot.sendMessage(chatId, "🎨 Generating image, please wait...", {
      reply_to_message_id: messageId
    });

    try {
      const apiUrl = `https://dens-magic-img.vercel.app/api/generate?prompt=${encodeURIComponent(prompt)}`;
      
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(cacheDir, `magic_${Date.now()}.jpg`);
      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      writer.on("finish", async () => {
        if (waitingMsg && waitingMsg.message_id) {
          try { await bot.deleteMessage(chatId, waitingMsg.message_id); } catch(e){}
        }

        await bot.sendPhoto(chatId, fs.createReadStream(filePath), {
          caption: `✨ **Prompt:** ${prompt}\n👑 *By:* Denish`,
          parse_mode: "Markdown",
          reply_to_message_id: messageId
        });

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      writer.on("error", async () => {
        if (waitingMsg && waitingMsg.message_id) {
          try { await bot.deleteMessage(chatId, waitingMsg.message_id); } catch(e){}
        }
        return bot.sendMessage(chatId, "⚠️ Failed to download and generate image.", {
          reply_to_message_id: messageId
        });
      });

    } catch (err) {
      console.error(err);
      if (waitingMsg && waitingMsg.message_id) {
        try { await bot.deleteMessage(chatId, waitingMsg.message_id); } catch(e){}
      }
      bot.sendMessage(chatId, "⚠️ Failed to generate image.", {
        reply_to_message_id: messageId
      });
    }
  }
};
