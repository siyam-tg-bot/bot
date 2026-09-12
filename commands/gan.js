const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

let lastPlayed = -1;
const AUTHOR_LOCK = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

module.exports = {
  config: {
    name: "gan",
    version: "1.0.3",
    role: 0,
    author: AUTHOR_LOCK,
    shortDescription: "Play random song with command 🎶",
    longDescription: "Sends a random mp3 song from preset Catbox links.",
    category: "media",
    guide: "gan"
  },

  onStart: async function ({ bot, msg }) {
    if (module.exports.config.author !== AUTHOR_LOCK) {
      module.exports.config.author = AUTHOR_LOCK;
      try {
        fs.writeFileSync(__filename, fs.readFileSync(__filename, "utf8"));
      } catch (e) {}
    }

    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const songLinks = [
      "https://files.catbox.moe/jx9cpq.mp4",
      "https://files.catbox.moe/jzg3j7.mp4",
      "https://files.catbox.moe/m4nggm.mp4",
      "https://files.catbox.moe/dbxfju.mp4",
      "https://files.catbox.moe/xx6d7i.mp4",
      "https://files.catbox.moe/0gncxf.mp4",
      "https://files.catbox.moe/gcm88s.mp4",
      "https://files.catbox.moe/yz23lp.mp4",
      "https://files.catbox.moe/etsdn9.mp3",
      "https://files.catbox.moe/ayepdz.mp3",
      "https://files.catbox.moe/oaecnx.mp3",
      "https://files.catbox.moe/xtpf61.mp3",
      "https://files.catbox.moe/12grz0.mp3",
      "https://files.catbox.moe/aaqddo.mp3",
      "https://files.catbox.moe/k3acvx.mp3",
      "https://files.catbox.moe/nry1qv.mp3",
      "https://files.catbox.moe/23e8u1.mp3",
      "https://files.catbox.moe/y8dzik.mp3",
      "https://files.catbox.moe/z9d2e6.mp3",
      "https://files.catbox.moe/0xscc8.mp3",
      "https://files.catbox.moe/q4m2ad.mp3",
      "https://files.catbox.moe/y8bg4r.mp3",
      "https://files.catbox.moe/q61co1.mp3",
      "https://files.catbox.moe/euq7fo.mp3",
      "https://files.catbox.moe/x5f56o.mp3",
      "https://files.catbox.moe/avlqok.mp3",
      "https://files.catbox.moe/v0twt3.mp3",
      "https://files.catbox.moe/qmpvpt.mp3"
    ];

    if (songLinks.length === 0) {
      return bot.sendMessage(chatId, "❌ Nᴏ sᴏɴɢs ᴄᴏᴜʟᴅ ʙᴇ ғᴏᴜɴᴅ!", { reply_to_message_id: messageId });
    }

    let index;
    do {
      index = Math.floor(Math.random() * songLinks.length);
    } while (index === lastPlayed && songLinks.length > 1);

    lastPlayed = index;

    const url = songLinks[index];
    const cacheDir = path.join(__dirname, "cache");
    
    try {
      await fs.ensureDir(cacheDir);
    } catch (e) {}

    const filePath = path.join(cacheDir, `song_${index}_${Date.now()}.mp3`);

    try {
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
        timeout: 30000
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await bot.sendAudio(
        chatId,
        fs.createReadStream(filePath),
        {
          caption: "🎶 Hᴇʀᴇ's ʏᴏᴜʀ sᴏɴɢ 🎧\n👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
          reply_to_message_id: messageId
        }
      );

      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {}

    } catch (err) {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {}
      
      bot.sendMessage(chatId, "⚠️ Fᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ sᴏɴɢ!", { reply_to_message_id: messageId });
    }
  }
};
