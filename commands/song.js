const yts = require("yt-search");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const LOCKED_AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

module.exports = {
  config: {
    name: "song",
    version: "9.3.0",
    author: LOCKED_AUTHOR,
    role: 0,
    description: "Stable YouTube music downloader",
    category: "media",
    guide: "song <name/link>",
    cooldowns: 5
  },

  onStart: async function ({ bot, msg, args }) {
    if (module.exports.config.author !== LOCKED_AUTHOR) {
      module.exports.config.author = LOCKED_AUTHOR;
      try {
        fs.writeFileSync(__filename, fs.readFileSync(__filename, "utf8"));
      } catch (e) {}
    }

    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (!args.length) {
      return bot.sendMessage(
        chatId,
        "⚠️ গান নাম বা YouTube link দিন",
        { reply_to_message_id: messageId }
      );
    }

    let query = args.join(" ");
    let ytLink = query;

    try {
      if (!ytLink.includes("youtu")) {
        const search = await yts(query);

        if (!search?.videos?.length) {
          return bot.sendMessage(
            chatId,
            "❌ গান পাওয়া যায়নি",
            { reply_to_message_id: messageId }
          );
        }

        ytLink = search.videos[0].url;
      }

      const loading = await bot.sendMessage(
        chatId,
        "🎧 Downloading...",
        { reply_to_message_id: messageId }
      );

      const apiRes = await axios.get(`https://yt-api-imran.vercel.app/api?url=${ytLink}`);
      const downloadLink = apiRes.data?.audio || apiRes.data?.downloadUrl;
      const title = apiRes.data?.title || "Unknown Song";

      if (!downloadLink) {
        try { await bot.deleteMessage(chatId, loading.message_id); } catch (e) {}
        return bot.sendMessage(
          chatId,
          "❌ গান ডাউনলোড লিংক পাওয়া যায়নি",
          { reply_to_message_id: messageId }
        );
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(cacheDir, `song_${Date.now()}.mp3`);

      const response = await axios({
        url: downloadLink,
        method: "GET",
        responseType: "stream",
        timeout: 60000
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      try { await bot.deleteMessage(chatId, loading.message_id); } catch (e) {}

      await bot.sendAudio(
        chatId,
        fs.createReadStream(filePath),
        {
          caption: 
`🎵 SONG DOWNLOADED

📌 Title: ${title}
🔗 Link: ${ytLink}
👑𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑`,
          reply_to_message_id: messageId
        }
      );

      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {}

    } catch (err) {
      bot.sendMessage(
        chatId,
        "❌ সমস্যা হয়েছে 🚨বস সিয়াম এর ইনবক্সে নক দাও🌚 https://www.facebook.com/profile.php?id=100037154624637",
        { reply_to_message_id: messageId }
      );
    }
  },

  run: async function (context) {
    return module.exports.onStart(context);
  }
};
