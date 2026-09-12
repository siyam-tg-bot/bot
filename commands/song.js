const axios = require("axios");

module.exports = {
  name: "song",
  aliases: ["music", "sing", "audio", "play"],
  version: "4.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Download and play song as voice message",
  longDescription: "Ultra-fast multi-engine song downloader supporting YouTube and JioSaavn music databases",
  category: "utility",
  guide: "{pn} <song name>",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (!args || args.length === 0) {
      return bot.sendMessage(
        chatId,
        "❌ **অনুগ্রহ করে গানের নাম লিখুন!**\nউদাহরণ: `,song আরবি গান`",
        { reply_to_message_id: messageId, parse_mode: "Markdown" }
      );
    }

    const query = args.join(" ");
    let loadingMsg = null;

    try {
      loadingMsg = await bot.sendMessage(
        chatId,
        `🔍 **"${query}"** গানটি প্রসেস করা হচ্ছে, অপেক্ষা করুন...`,
        { reply_to_message_id: messageId, parse_mode: "Markdown" }
      );

      let downloadUrl = null;
      let songTitle = query;

      try {
        const saavnRes = await axios.get(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`, { timeout: 7000 });
        if (saavnRes.data && saavnRes.data.data && saavnRes.data.data.results && saavnRes.data.data.results.length > 0) {
          const song = saavnRes.data.data.results[0];
          songTitle = song.name || query;
          if (song.downloadUrl && Array.isArray(song.downloadUrl) && song.downloadUrl.length > 0) {
            downloadUrl = song.downloadUrl[song.downloadUrl.length - 1].url;
          }
        }
      } catch (e) {}

      if (!downloadUrl) {
        let videoUrl = null;
        const searchApis = [
          `https://deliriussapi-official.vercel.app/search/ytsearch?q=${encodeURIComponent(query)}`,
          `https://api.vreden.web.id/api/ytsearch?query=${encodeURIComponent(query)}`,
          `https://api.davidcyriltech.my.id/search/yt?q=${encodeURIComponent(query)}`
        ];

        for (const api of searchApis) {
          try {
            const res = await axios.get(api, { timeout: 8000 });
            const data = res.data;
            if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
              videoUrl = data.data[0].url;
              songTitle = data.data[0].title || query;
              break;
            } else if (data && data.result && Array.isArray(data.result) && data.result.length > 0) {
              videoUrl = data.result[0].url;
              songTitle = data.result[0].title || query;
              break;
            } else if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
              videoUrl = data.results[0].url;
              songTitle = data.results[0].title || query;
              break;
            }
          } catch (e) {}
        }

        if (!videoUrl) {
          videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(query)}`;
        }

        const downloadApis = [
          `https://deliriussapi-official.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
          `https://api.vreden.web.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`,
          `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`,
          `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`,
          `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`
        ];

        for (const api of downloadApis) {
          try {
            const res = await axios.get(api, { timeout: 12000 });
            const d = res.data;
            if (d && d.data && d.data.download && d.data.download.url) {
              downloadUrl = d.data.download.url;
              break;
            } else if (d && d.data && d.data.dl) {
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
      }

      if (!downloadUrl) {
        if (loadingMsg) await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
        return bot.sendMessage(
          chatId,
          `❌ **"${query}"** গানটি সার্ভার থেকে আনা সম্ভব হয়নি।`,
          { reply_to_message_id: messageId, parse_mode: "Markdown" }
        );
      }

      const audioBuffer = await axios.get(downloadUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        timeout: 45000
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
