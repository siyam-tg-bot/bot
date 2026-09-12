const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "video",
    version: "2.2.3",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Search & download YouTube videos",
    longDescription: "Search YouTube videos by name and download",
    category: "media",
    guide: "video <video name>"
  },

  async searchVideo(query) {
    const apis = [
      `https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`,
      `https://yt-api-imran.vercel.app/api/search?query=${encodeURIComponent(query)}`,
      `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(query)}`
    ];

    for (let url of apis) {
      try {
        const res = await axios.get(url);
        let video = null;

        if (res.data?.[0]) video = res.data[0];
        else if (res.data?.results?.[0]) video = res.data.results[0];
        else if (res.data?.items?.[0]) {
          const item = res.data.items[0];
          video = {
            title: item.snippet?.title,
            url: `https://www.youtube.com/watch?v=${item.id?.videoId}`
          };
        }

        if (video?.url) return video;
      } catch (e) {
        continue;
      }
    }

    return null;
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const creatorName = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

    let query = args.join(" ");

    if (!query && msg.text) {
      query = msg.text.replace(/^video\s+/i, "").trim();
    }

    if (!query || query.toLowerCase() === "video") {
      return bot.sendMessage(
        `❌ Please provide a song name.\n📌 Example: video Let Me Love You`,
        { reply_to_message_id: messageId }
      );
    }

    let tempMsgId = null;

    try {
      const searching = await bot.sendMessage(
        chatId,
        `🔍 Searching\n━━━━━━━━━━━━━━━\n📌 Query: ${query}\n⏳ Please wait...`,
        { reply_to_message_id: messageId }
      );
      tempMsgId = searching.message_id;

      const video = await module.exports.searchVideo(query);

      if (!video || !video.url) throw new Error("No results found from all APIs.");

      try {
        await bot.deleteMessage(chatId, tempMsgId);
      } catch (e) {}

      const downloading = await bot.sendMessage(
        chatId,
        `🎬 Video Found\n━━━━━━━━━━━━━━━\n📖 Title: ${video.title}\n⬇️ Downloading...`,
        { reply_to_message_id: messageId }
      );
      tempMsgId = downloading.message_id;

      const dlRes = await axios.get(
        `https://yt-api-imran.vercel.app/api?url=${video.url}`
      );

      const downloadUrl = dlRes.data?.downloadUrl;
      if (!downloadUrl) throw new Error("Download link not available.");

      const buffer = (
        await axios.get(downloadUrl, { responseType: "arraybuffer" })
      ).data;

      const cacheDir = path.join(process.cwd(), "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);
      await fs.writeFile(filePath, buffer);

      const captionText = 
        `━━━━━━━━━━━━━━━━━━\n` +
        `🎬 VIDEO READY\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📖 Title: ${video.title}\n` +
        `⏱ Duration: ${video.time || "N/A"}\n` +
        `🖌️ 𝐏𝐎𝐖𝐄𝐑 𝐁𝐘: ${creatorName}\n` +
        `━━━━━━━━━━━━━━━━━━`;

      await bot.sendVideo(
        chatId,
        fs.createReadStream(filePath),
        {
          caption: captionText,
          reply_to_message_id: messageId
        }
      );

      try {
        if (fs.existsSync(filePath)) await fs.unlink(filePath);
      } catch (e) {}

      try {
        if (tempMsgId) await bot.deleteMessage(chatId, tempMsgId);
      } catch (e) {}

    } catch (err) {
      try {
        if (tempMsgId) await bot.deleteMessage(chatId, tempMsgId);
      } catch (e) {}

      bot.sendMessage(
        chatId,
        `❌ Failed\n━━━━━━━━━━━━━━━\n${err.message || "An unexpected error occurred."}`,
        { reply_to_message_id: messageId }
      );
    }
  }
};
