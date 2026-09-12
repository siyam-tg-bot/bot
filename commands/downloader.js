const axios = require("axios");
const config = require("../config");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const COMMAND_NAME = "downloader";
const API_TIMEOUT = 20000;

function extractUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  return match ? match[0].replace(/[),.!?]+$/, "") : null;
}

function convertToBold(text) {
  const charMap = {
    'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉','K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓','U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
    'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣','k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭','u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳',
    '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗'
  };
  return String(text).split('').map(c => charMap[c] || c).join('');
}

function findVideoUrl(data) {
  if (!data) return null;
  const possibleKeys = [
    "video", "videoUrl", "video_url", "download", "downloadUrl", 
    "download_url", "url", "link", "play", "playUrl", "play_url", 
    "high", "hd", "hdplay", "nowm", "noWatermark", "no_watermark", "media", "mp4"
  ];

  function search(obj, depth = 0) {
    if (!obj || depth > 7) return null;

    if (typeof obj === "string") {
      if (/^https?:\/\//i.test(obj) && (obj.includes(".mp4") || obj.includes("video") || obj.includes("download") || obj.includes("googlevideo") || obj.includes("cdn"))) {
        return obj;
      }
      return null;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = search(item, depth + 1);
        if (result) return result;
      }
      return null;
    }

    if (typeof obj === "object") {
      for (const key of possibleKeys) {
        if (obj[key]) {
          const result = search(obj[key], depth + 1);
          if (result) return result;
        }
      }
      for (const key of Object.keys(obj)) {
        const result = search(obj[key], depth + 1);
        if (result) return result;
      }
    }
    return null;
  }

  return search(data);
}

function findTitle(data) {
  if (!data || typeof data !== "object") return "DOWNLOADED VIDEO";
  const keys = ["title", "caption", "description", "name"];

  for (const key of keys) {
    if (typeof data[key] === "string" && data[key].trim()) {
      return data[key].trim().slice(0, 300);
    }
  }

  if (data.data && typeof data.data === "object") return findTitle(data.data);
  if (data.result && typeof data.result === "object") return findTitle(data.result);

  return "DOWNLOADED VIDEO";
}

async function tryDownload(targetUrl) {
  const encoded = encodeURIComponent(targetUrl);
  
  const downloadTasks = [
    async () => {
      const res = await axios.post("https://api.cobalt.tools/api/json", { url: targetUrl }, {
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        timeout: API_TIMEOUT
      });
      if (res.data && res.data.url) {
        return { videoUrl: res.data.url, title: "MEDIA DOWNLOADED", api: "COBALT" };
      }
      return null;
    },
    async () => {
      const res = await axios.get(`https://betadash-search-download.vercel.app/dl?url=${encoded}`, { timeout: API_TIMEOUT });
      const videoUrl = findVideoUrl(res.data);
      if (videoUrl) {
        return { videoUrl, title: findTitle(res.data), api: "BETADASH" };
      }
      return null;
    },
    async () => {
      const res = await axios.get(`https://mahmudx7-api.vercel.app/api/alldl?url=${encoded}`, { timeout: API_TIMEOUT });
      const videoUrl = findVideoUrl(res.data);
      if (videoUrl) {
        return { videoUrl, title: findTitle(res.data), api: "MAHMUD-SERVER" };
      }
      return null;
    },
    async () => {
      const res = await axios.get(`https://www.tikwm.com/api/?url=${encoded}`, { timeout: API_TIMEOUT });
      if (res.data && res.data.data && res.data.data.play) {
        const playUrl = res.data.data.play.startsWith("http") ? res.data.data.play : `https://www.tikwm.com${res.data.data.play}`;
        return { videoUrl: playUrl, title: res.data.data.title || "TIKTOK VIDEO", api: "TIKWM" };
      }
      return null;
    }
  ];

  for (const task of downloadTasks) {
    try {
      const result = await task();
      if (result && result.videoUrl) return result;
    } catch (e) {
      continue;
    }
  }

  throw new Error("ALL DOWNLOAD SERVERS FAILED");
}

module.exports = {
  name: COMMAND_NAME,
  aliases: ["autodl", "dl", "download"],
  version: "3.1.0",
  author: AUTHOR,
  role: 0,
  category: "media",
  shortDescription: "Auto downloader for social media videos",
  longDescription: "Downloads videos automatically from Facebook, TikTok, Instagram & YouTube links.",
  guide: "downloader [video link]",

  execute: async (bot, msg, args) => {
    if (module.exports.author !== AUTHOR || module.exports.name !== COMMAND_NAME) {
      return;
    }

    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const messageText = (args && args.join(" ")) || msg.text || msg.caption || "";

    const url = extractUrl(messageText);
    if (!url) return;

    let botUsername = "SiyamTgBot";
    try {
      const me = await bot.getMe();
      if (me && me.username) {
        botUsername = me.username;
      }
    } catch (e) {
      botUsername = config.botUsername || "SiyamTgBot";
    }

    const ownerUsername = config.ownerUsername || "ri_siyam";

    let loadingMsg;
    try {
      loadingMsg = await bot.sendMessage(
        chatId,
        `👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
⏳ 𝐅𝐄𝐓𝐂𝐇𝐈𝐍𝐆 𝐌𝐄𝐃𝐈𝐀 𝐈𝐍𝐅𝐎...
───────────────
⚡ 𝐁𝐘: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`,
        { reply_to_message_id: messageId }
      );
    } catch (e) {}

    try {
      const result = await tryDownload(url);
      const videoUrl = result.videoUrl;
      const title = result.title || "DOWNLOADED VIDEO";
      const apiName = result.api;

      const boldTitle = convertToBold(title.slice(0, 100));
      const boldServer = convertToBold(apiName);

      const captionText = `👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
🎬 𝐓𝐈𝐓𝐋𝐄: ${boldTitle}
⚡ 𝐒𝐄𝐑𝐕𝐄𝐑: ${boldServer}
🤖 𝐁𝐎𝐓: @${botUsername}
───────────────
⚡ 𝐁𝐘: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

      const replyMarkup = {
        inline_keyboard: [
          [
            { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
            { text: "📜 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓", callback_data: "cmd_list" }
          ],
          [
            { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${ownerUsername}` }
          ]
        ]
      };

      await bot.sendVideo(chatId, videoUrl, {
        caption: captionText,
        reply_to_message_id: messageId,
        reply_markup: replyMarkup,
        supports_streaming: true
      });

      if (loadingMsg) {
        try {
          await bot.deleteMessage(chatId, loadingMsg.message_id);
        } catch (e) {}
      }

    } catch (err) {
      if (loadingMsg) {
        try {
          await bot.deleteMessage(chatId, loadingMsg.message_id);
        } catch (e) {}
      }

      const errorText = `👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
❌ 𝐅𝐀𝐈𝐋𝐄𝐃 𝐓𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐕𝐈𝐃𝐄𝐎
───────────────
⚡ 𝐁𝐘: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

      return bot.sendMessage(
        chatId,
        errorText,
        { reply_to_message_id: messageId }
      );
    }
  }
};
