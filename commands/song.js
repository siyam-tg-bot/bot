const axios = require("axios");

module.exports = {
  name: "song",
  aliases: ["music", "sing", "audio", "play"],
  version: "3.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Download and play song as voice message",
  longDescription: "Searches and streams audio directly through bot buffer to prevent Telegram IP blocks",
  category: "utility",
  guide: "{pn} <song name>",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (!args || args.length === 0) {
      return bot.sendMessage(
        chatId,
        "❌ **অনুগ্রহ করে গানের নাম লিখুন!**\nউদাহরণ: `,song কত স্বপ্ন`",
        { reply_to_message_id: messageId, parse_mode: "Markdown" }
      );
    }

    const query = args.join(" ");
    let loadingMsg = null;

    try {
      loadingMsg = await bot.sendMessage(
        chatId,
        `🔍 **"${query}"** গানটি সার্ভার থেকে প্রসেস ও ডাউনলোড করা হচ্ছে...`,
        { reply_to_message_id: messageId, parse_mode: "Markdown" }
      );

      let videoUrl = null;
      let songTitle = query;

      const searchApis = [
        `https://api.vreden.web.id/api/ytsearch?query=${encodeURIComponent(query)}`,
        `https://api.davidcyriltech.my.id/search/yt?q=${encodeURIComponent(query)}`,
        `https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(query)}`
      ];

      for (const api of searchApis) {
        try {
          const res = await axios.get(api, { timeout: 8000 });
          const data = res.data;
          if (data && data.result && Array.isArray(data.result) && data.result.length > 0) {
            videoUrl = data.result[0].url;
            songTitle = data.result[0].title || query;
            break;
          } else if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
            videoUrl = data.results[0].url;
            songTitle = data.results[0].title || query;
            break;
          } else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
            videoUrl = data.data[0].url;
            songTitle = data.data[0].title || query;
            break;
          }
        } catch (e) {}
      }

      if (!videoUrl) {
        videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(query)}`;
      }

      let downloadUrl = null;

      const downloadApis = [
        `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.vreden.web.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.maher-zubair.tech/download/ytmp3?url=${encodeURIComponent(videoUrl)}`
      ];

      for (const api of downloadApis) {
        try {
          const res = await axios.get(api, { timeout: 12000 });
          const d = res.data;
          if (d && d.data && d.data.dl) {
            downloadUrl = d.data.dl;
            break;
          } else if (d && d.result && d.result.download && d.result.download.url) {
            downloadUrl = d.result.download.url;
            break;
          } else if (d && d.result && d.result.download_url) {
            downloadUrl = d.result.download_url;
            break;
          } else if (d && d.result && d.result.url) {
            downloadUrl = d.result.url;
            break;
          }
        } catch (e) {}
      }

      if (!downloadUrl) {
        if (loadingMsg) await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
        return bot.sendMessage(
          chatId,
          `❌ **"${query}"** গানটির কোনো ডাউনলোড লিঙ্ক পাওয়া যায়নি।`,
          { reply_to_message_id: messageId, parse_mode: "Markdown" }
        );
      }

      const audioBuffer = await axios.get(downloadUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        timeout: 30000
      });

      const bufferData = Buffer.from(audioBuffer.data);

      try {
        await bot.sendVoice(chatId, bufferData, {
          reply_to_message_id: messageId,
          caption: `🎧 **${songTitle}**`
        }, {
          filename: "song.ogg",
          contentType: "audio/ogg"
        });
      } catch (errVoice) {
        await bot.sendAudio(chatId, bufferData, {
          reply_to_message_id: messageId,
          title: songTitle,
          caption: `🎧 **${songTitle}**`
        }, {
          filename: "song.mp3",
          contentType: "audio/mpeg"
        });
      }

      if (loadingMsg) await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

    } catch (error) {
      if (loadingMsg) await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      return bot.sendMessage(
        chatId,
        `❌ **গানটি পাঠাতে সমস্যা হয়েছে!**\nত্রুটি: ${error.message}`,
        { reply_to_message_id: messageId, parse_mode: "Markdown" }
      );
    }
  }
};
