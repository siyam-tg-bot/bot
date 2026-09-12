const axios = require("axios");

module.exports = {
  name: "song",
  aliases: ["music", "sing"],
  version: "1.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Download and play song as voice message",
  longDescription: "Searches for any song and sends it as a Telegram voice message",
  category: "utility",
  guide: "{pn} <song name>",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (!args || args.length === 0) {
      return bot.sendMessage(
        chatId,
        "❌ অনুগ্রহ করে গানের নাম লিখুন!\nউদাহরণ: `,song faded`",
        { reply_to_message_id: messageId }
      );
    }

    const query = args.join(" ");
    let loadingMsg = null;

    try {
      loadingMsg = await bot.sendMessage(
        chatId,
        `⏳ **"${query}"** গানটি খোঁজা এবং প্রসেস করা হচ্ছে...`,
        { reply_to_message_id: messageId, parse_mode: "Markdown" }
      );

      const searchRes = await axios.get(`https://api.davidcyriltech.my.id/search/yt?q=${encodeURIComponent(query)}`);
      
      let videoUrl = null;
      let title = query;

      if (searchRes.data && searchRes.data.status === 200 && searchRes.data.results && searchRes.data.results.length > 0) {
        videoUrl = searchRes.data.results[0].url;
        title = searchRes.data.results[0].title || query;
      } else {
        videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(query)}`;
      }

      let audioUrl = null;

      try {
        const dlRes = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`);
        if (dlRes.data && dlRes.data.status === 200 && dlRes.data.result && dlRes.data.result.download_url) {
          audioUrl = dlRes.data.result.download_url;
        }
      } catch (err) {}

      if (!audioUrl) {
        try {
          const dlRes2 = await axios.get(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(videoUrl)}`);
          if (dlRes2.data && dlRes2.data.status === 200 && dlRes2.data.data && dlRes2.data.data.downloadUrl) {
            audioUrl = dlRes2.data.data.downloadUrl;
          }
        } catch (err) {}
      }

      if (!audioUrl) {
        try {
          const dlRes3 = await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`);
          if (dlRes3.data && dlRes3.data.result && dlRes3.data.result.download) {
            audioUrl = dlRes3.data.result.download;
          }
        } catch (err) {}
      }

      if (!audioUrl) {
        if (loadingMsg) {
          await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
        }
        return bot.sendMessage(
          chatId,
          `❌ **"${query}"** গানটি পাওয়া যায়নি বা ডাউনলোড করতে সমস্যা হয়েছে!`,
          { reply_to_message_id: messageId, parse_mode: "Markdown" }
        );
      }

      await bot.sendVoice(chatId, audioUrl, {
        reply_to_message_id: messageId,
        caption: `🎧 **${title}**`
      });

      if (loadingMsg) {
        await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      }

    } catch (error) {
      if (loadingMsg) {
        await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
      }
      return bot.sendMessage(
        chatId,
        `❌ গানটি আনতে সমস্যা হয়েছে: ${error.message}`,
        { reply_to_message_id: messageId }
      );
    }
  }
};
