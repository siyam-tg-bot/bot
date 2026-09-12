const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const { downloadVideo } = require("joy-video-downloader");

const LOCKED_AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

function safeRun(fn) {
  try {
    return fn();
  } catch (e) {
    return null;
  }
}

module.exports = {
  config: {
    name: "song",
    version: "9.2.0",
    author: LOCKED_AUTHOR,
    role: 0,
    description: "Stable YouTube music downloader",
    prefix: true,
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

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(
        cacheDir,
        `song_${Date.now()}.mp3`
      );

      const data = await downloadVideo(ytLink, filePath);

      try {
        await bot.deleteMessage(chatId, loading.message_id);
      } catch (e) {}

      if (!data || !data.filePath) {
        return bot.sendMessage(
          chatId,
          "❌ গান ডাউনলোড ব্যর্থ হয়েছে",
          { reply_to_message_id: messageId }
        );
      }

      const title = data.title || "Unknown Song";
      const savedPath = data.filePath;

      return bot.sendAudio(
        chatId,
        fs.createReadStream(savedPath),
        {
          caption: 
`🎵 SONG DOWNLOADED

📌 Title: ${title}
🔗 Link: ${ytLink}
👑𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑`,
          reply_to_message_id: messageId
        }
      ).then(() => {
        safeRun(() => {
          if (fs.existsSync(savedPath)) fs.unlinkSync(savedPath);
        });
      }).catch(() => {
        safeRun(() => {
          if (fs.existsSync(savedPath)) fs.unlinkSync(savedPath);
        });
      });

    } catch (err) {
      bot.sendMessage(
        chatId,
        "❌ সমস্যা হয়েছে 🚨বস সিয়াম এর ইনবক্সে নক দাও🌚 https://www.facebook.com/profile.php?id=100037154624637",
        { reply_to_message_id: messageId }
      );
    }
  },

  run: async function (data) {
    return module.exports.onStart(data);
  }
};
