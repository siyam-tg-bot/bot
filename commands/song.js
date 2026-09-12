const axios = require("axios");

module.exports = {
  name: "song",
  aliases: ["music", "sing", "audio", "play"],
  version: "2.5",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Download and play song as voice message",
  longDescription: "Searches for any song across multiple servers and sends it as a Telegram voice message",
  category: "utility",
  guide: "{pn} <song name>",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (!args || args.length === 0) {
      return bot.sendMessage(
        chatId,
        "❌ **অনুগ্রহ করে গানের নাম বা কিওয়ার্ড লিখুন!**\nউদাহরণ: `,song faded`",
        { reply_to_message_id: messageId, parse_mode: "Markdown" }
      );
    }

    const query = args.join(" ");
    let loadingMsg = null;

    try {
      loadingMsg = await bot.sendMessage(
        chatId,
        `🔍 **"${query}"** গানটি প্রসেস করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...`,
        { reply_to_message_id: messageId, parse_mode: "Markdown" }
      );

      let videoUrl = null;
      let songTitle = query;

      try {
        const sRes1 = await axios.get(`https://api.vreden.web.id/api/ytsearch?query=${encodeURIComponent(query)}`);
        if (sRes1.data && sRes1.data.result && sRes1.data.result.length > 0) {
          videoUrl = sRes1.data.result[0].url;
          songTitle = sRes1.data.result[0].title || query;
        }
      } catch (e) {}

      if (!videoUrl) {
        try {
          const sRes2 = await axios.get(`https://api.davidcyriltech.my.id/search/yt?q=${encodeURIComponent(query)}`);
          if (sRes2.data && sRes2.data.results && sRes2.data.results.length > 0) {
            videoUrl = sRes2.data.results[0].url;
            songTitle = sRes2.data.results[0].title || query;
          }
        } catch (e) {}
      }

      if (!videoUrl) {
        try {
          const sRes3 = await axios.get(`https://api.agatz.xyz/api/ytsearch?q=${encodeURIComponent(query)}`);
          if (sRes3.data && sRes3.data.data && sRes3.data.data.length > 0) {
            videoUrl = sRes3.data.data[0].url;
            songTitle = sRes3.data.data[0].title || query;
          }
        } catch (e) {}
      }

      if (!videoUrl) {
        videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(query)}`;
      }

      let audioUrl = null;

      try {
        const dRes1 = await axios.get(`https://api.vreden.web.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`);
        if (dRes1.data && dRes1.data.result && dRes1.data.result.download && dRes1.data.result.download.url) {
          audioUrl = dRes1.data.result.download.url;
        }
      } catch (e) {}

      if (!audioUrl) {
        try {
          const dRes2 = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`);
          if (dRes2.data && dRes2.data.result && dRes2.data.result.download_url) {
            audioUrl = dRes2.data.result.download_url;
          }
        } catch (e) {}
      }

      if (!audioUrl) {
        try {
          const dRes3 = await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`);
          if (dRes3.data && dRes3.data.result && dRes3.data.result.download) {
            audioUrl = dRes3.data.result.download;
          }
        } catch (e) {}
      }

      if (!audioUrl) {
        try {
          const dRes4 = await axios.get(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(videoUrl)}`);
          if (dRes4.data && dRes4.data.data && dRes4.data.data.downloadUrl) {
            audioUrl = dRes4.data.data.downloadUrl;
          }
        } catch (e) {}
      }

      if (!audioUrl) {
        if (loadingMsg) {
          await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
        }
        return bot.sendMessage(
          chatId,
          `❌ **"${query}"** গানটি সার্ভার থেকে আনা সম্ভব হয়নি। অনুগ্রহ করে অন্য নাম দিয়ে চেষ্টা করুন।`,
          { reply_to_message_id: messageId, parse_mode: "Markdown" }
        );
      }

      try {
        await bot.sendVoice(chatId, audioUrl, {
          reply_to_message_id: messageId,
          caption: `🎧 **${songTitle}**`
        });
      } catch (voiceErr) {
        await bot.sendAudio(chatId, audioUrl, {
          reply_to_message_id: messageId,
          title: songTitle,
          caption: `🎧 **${songTitle}**`
        });
      }

      if (loadingMsg) {
        await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      }

    } catch (error) {
      if (loadingMsg) {
        await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      }
      return bot.sendMessage(
        chatId,
        `❌ **গানটি পাঠাতে সমস্যা হয়েছে!**\nত্রুটি: ${error.message}`,
        { reply_to_message_id: messageId, parse_mode: "Markdown" }
      );
    }
  }
};
