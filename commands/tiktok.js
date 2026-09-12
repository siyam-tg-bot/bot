const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API = "https://lyric-search-neon.vercel.app/kshitiz?keyword=";
const CACHE = path.join(__dirname, "tiktok_cache");
const activeReplies = new Map();

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt"],
    version: "1.1.0",
    author: "MR_FARHAN",
    role: 0,
    countDown: 5,
    category: "media",
    description: "Search and download TikTok video",
    guide: "tiktok <keyword>"
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const query = args.join(" ");

    if (!query) {
      return bot.sendMessage(chatId, "❌ 𝐒ᴇᴀʀᴄʜ 𝐊ᴇʏᴡᴏʀᴅ 𝐃ᴀᴏ!", { reply_to_message_id: messageId });
    }

    const searchingMsg = await bot.sendMessage(
      chatId,
      `🔎 𝐒ᴇᴀʀᴄʜɪɴɢ 𝐓ɪᴋᴛᴏᴋ...\n🔍 𝐊ᴇʏᴡᴏʀᴅ: ❝ ${query} ❞`,
      { reply_to_message_id: messageId }
    );

    try {
      const res = await axios.get(API + encodeURIComponent(query));
      const results = res.data.slice(0, 6);

      if (!results.length) {
        return bot.sendMessage(chatId, "❌ 𝐍ᴏ 𝐕ɪᴅᴇᴏ 𝐅ᴏᴜɴᴅ!", { reply_to_message_id: messageId });
      }

      let body = "✨ 𝐓ɪᴋᴛᴏᴋ 𝐑ᴇsᴜʟᴛs ✨\n\n";

      results.forEach((v, i) => {
        body += `${i + 1}️⃣ ${v.title.slice(0, 50)}\n`;
        body += `👤 @${v.author.unique_id}\n`;
        body += `⏱️ ${v.duration}s\n\n`;
      });

      body += `📥 𝐑ᴇᴘʟʏ 1-${results.length} 𝐓ᴏ 𝐃ᴏᴡɴʟᴏᴀᴅ`;

      try {
        await bot.deleteMessage(chatId, searchingMsg.message_id);
      } catch (err) {}

      const sentMsg = await bot.sendMessage(chatId, body, { reply_to_message_id: messageId });

      activeReplies.set(sentMsg.message_id, {
        results,
        author: msg.from.id
      });

    } catch (e) {
      return bot.sendMessage(chatId, "❌ 𝐓ɪᴋᴛᴏᴋ 𝐀ᴘɪ 𝐄ʀʀᴏʀ!", { reply_to_message_id: messageId });
    }
  },

  onChat: async function ({ bot, msg }) {
    try {
      if (!msg || !msg.reply_to_message || !msg.text) return;

      const repliedId = msg.reply_to_message.message_id;
      if (!activeReplies.has(repliedId)) return;

      const session = activeReplies.get(repliedId);
      const chatId = msg.chat.id;
      const messageId = msg.message_id;

      const choose = parseInt(msg.text.trim());
      if (isNaN(choose)) return;

      const { results } = session;
      if (choose < 1 || choose > results.length) {
        return bot.sendMessage(chatId, `❌ 𝐈ɴᴠᴀʟɪᴅ!\n1-${results.length} 𝐃ᴀᴏ`, { reply_to_message_id: messageId });
      }

      const video = results[choose - 1];
      await fs.ensureDir(CACHE);

      const name = video.title.slice(0, 25).replace(/[^a-z0-9]/gi, "_");
      const file = path.join(CACHE, `${Date.now()}_${name}.mp4`);

      const downloadingMsg = await bot.sendMessage(
        chatId,
        `⏳ 𝐃ᴏᴡɴʟᴏᴀᴅɪɴɢ...\n🎬 ${video.title}`,
        { reply_to_message_id: messageId }
      );

      const response = await axios({
        url: video.videoUrl,
        responseType: "stream",
        timeout: 300000
      });

      const w = fs.createWriteStream(file);
      response.data.pipe(w);

      await new Promise((resolve, reject) => {
        w.on("finish", resolve);
        w.on("error", reject);
      });

      await bot.sendVideo(
        chatId,
        fs.createReadStream(file),
        {
          caption: `✅ 𝐃ᴏᴡɴʟᴏᴀᴅ 𝐂ᴏᴍᴘʟᴇ𝐭ᴇᴅ!\n\n🎥 ${video.title}\n👤 @${video.author.unique_id}\n⏱️ ${video.duration}s`,
          reply_to_message_id: messageId
        }
      );

      try {
        await bot.deleteMessage(chatId, downloadingMsg.message_id);
      } catch (err) {}

      fs.unlinkSync(file);
    } catch (e) {
      bot.sendMessage(msg.chat.id, "❌ 𝐃ᴏᴡɴʟᴏᴀᴅ 𝐅ᴀɪʟᴇᴅ!", { reply_to_message_id: msg.message_id });
    }
  }
};
