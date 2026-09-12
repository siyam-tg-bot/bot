const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const activeReplies = new Map();

const baseApiUrl = async () => {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
    );
    return res.data.mahmud;
  } catch (e) {
    return "https://default-api.example.com";
  }
};

const apiList = async () => {
  const base = await baseApiUrl();
  return [
    base,
    "https://mahmudx7-api.vercel.app",
    "https://backup-api.example.com"
  ];
};

async function fetchWithFallback(urlBuilder) {
  const apis = await apiList();

  for (let base of apis) {
    try {
      const url = urlBuilder(base);
      const res = await axios.get(url, { timeout: 15000 });
      if (res?.data) return res.data;
    } catch (e) {}
  }

  throw new Error("All APIs failed");
}

module.exports = {
  config: {
    name: "ytb",
    aliases: ["youtube", "yt", "ytb2"],
    version: "2.3",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    countDown: 6,
    role: 0,
    description: "YouTube search & download system",
    category: "media",
    guide: "ytb <song name> or ytb2 <song name>"
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const senderID = msg.from.id;
    const input = args.join(" ").trim();

    if (!input) {
      return bot.sendMessage(chatId, "👉 ব্যবহার: ytb song name অথবা ytb2 song name", { reply_to_message_id: messageId });
    }

    const usedCommand = (msg.text || "").split(" ")[0].toLowerCase();
    const isYtb2 = usedCommand.includes("ytb2");

    try {
      const searchingMsg = await bot.sendMessage(chatId, `🔎 𝐒ᴇᴀʀᴄʜɪɴɢ... ❝ ${input} ❞`, { reply_to_message_id: messageId });

      const data = await fetchWithFallback((base) =>
        `${base}/api/ytb/search?q=${encodeURIComponent(input)}`
      );

      const results = data?.results?.slice(0, 6);

      if (!results?.length) {
        return bot.sendMessage(chatId, `⭕ কিছু পাওয়া যায়নি: ${input}`, { reply_to_message_id: messageId });
      }

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);

      let msgText = "";
      let attachments = [];

      if (!isYtb2) {
        const thumbs = await Promise.all(
          results.map(async (r, i) => {
            try {
              const thumbPath = path.join(
                cacheDir,
                `thumb_${senderID}_${Date.now()}_${i}.jpg`
              );

              const res = await axios.get(r.thumbnail, {
                responseType: "arraybuffer",
                timeout: 10000
              });

              fs.writeFileSync(thumbPath, Buffer.from(res.data));
              return thumbPath;
            } catch {
              return null;
            }
          })
        );
        attachments = thumbs.filter(Boolean);
      }

      results.forEach((r, i) => {
        msgText += `${i + 1}. ${r.title}\n⏱ ${r.time}\n\n`;
      });

      try {
        await bot.deleteMessage(chatId, searchingMsg.message_id);
      } catch (e) {}

      let sentMsg;
      const fullBody = `📌 নাম্বার দিয়ে রিপ্লাই করো:\n\n${msgText}`;

      if (attachments.length > 0) {
        sentMsg = await bot.sendPhoto(chatId, attachments[0], {
          caption: fullBody,
          reply_to_message_id: messageId
        });
      } else {
        sentMsg = await bot.sendMessage(chatId, fullBody, {
          reply_to_message_id: messageId
        });
      }

      activeReplies.set(sentMsg.message_id, {
        author: senderID,
        results,
        menuMsgID: sentMsg.message_id
      });

      for (let p of attachments) {
        try { fs.unlinkSync(p); } catch (e) {}
      }

    } catch (e) {
      return bot.sendMessage(chatId, `❌ API সমস্যা: ${e.message}`, { reply_to_message_id: messageId });
    }
  },

  onChat: async function ({ bot, msg }) {
    try {
      if (!msg || !msg.reply_to_message || !msg.text) return;

      const repliedId = msg.reply_to_message.message_id;
      if (!activeReplies.has(repliedId)) return;

      const session = activeReplies.get(repliedId);
      const { author, results, menuMsgID } = session;

      if (msg.from.id !== author) return;

      const choice = parseInt(msg.text.trim());
      if (!choice || choice < 1 || choice > results.length) return;

      const chatId = msg.chat.id;
      const messageId = msg.message_id;
      const videoID = results[choice - 1].id;

      try {
        if (menuMsgID) {
          await bot.deleteMessage(chatId, menuMsgID);
        }
      } catch (e) {}

      activeReplies.delete(repliedId);

      const downloadingMsg = await bot.sendMessage(chatId, `⏳ ডাউনলোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন`, { reply_to_message_id: messageId });

      const data = await fetchWithFallback((base) =>
        `${base}/api/ytb/get?id=${videoID}&type=video`
      );

      const downloadLink = data?.data?.downloadLink;
      const title = data?.data?.title;

      if (!downloadLink) throw new Error("Download link not found");

      const filePath = path.join(__dirname, "cache", `yt_${Date.now()}.mp4`);

      const response = await axios({
        url: downloadLink,
        method: "GET",
        responseType: "stream",
        timeout: 20000
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      try {
        await bot.deleteMessage(chatId, downloadingMsg.message_id);
      } catch (e) {}

      await bot.sendVideo(
        chatId,
        fs.createReadStream(filePath),
        {
          caption: `👑 𝗢𝗪𝗡𝗘𝗥 🪄 **𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍** 👑\n\n${title}`,
          reply_to_message_id: messageId
        }
      );

      try {
        fs.unlinkSync(filePath);
      } catch (e) {}

    } catch (e) {
      bot.sendMessage(msg.chat.id, `❌ সমস্যা: ${e.message}`, { reply_to_message_id: msg.message_id });
    }
  }
};
