const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/* =========================
   VIDEO LIST
========================= */

const videoList = [
  {
    url: "https://files.catbox.moe/3nus2b.mp4",
    file: "video1.mp4"
  },
  {
    url: "https://files.catbox.moe/t2kbfa.mp4",
    file: "video2.mp4"
  },
  {
    url: "https://files.catbox.moe/qu53g7.mp4",
    file: "video3.mp4"
  },
  {
    url: "https://files.catbox.moe/rzhmck.mp4",
    file: "video4.mp4"
  },
  {
    url: "https://files.catbox.moe/g7jy2d.mp4",
    file: "video5.mp4"
  }
];

/* =========================
   SETTINGS
========================= */

const USER_COOLDOWN = 3 * 60 * 1000;
const lastReplyUser = new Map();

/* =========================
   SAFE HELPERS
========================= */

function getChatId(msg) {
  if (!msg) return null;

  if (msg.chat && msg.chat.id != null) {
    return msg.chat.id;
  }

  if (msg.threadID != null) {
    return msg.threadID;
  }

  return null;
}

function getMessageId(msg) {
  if (!msg) return null;

  return (
    msg.message_id ||
    msg.messageID ||
    null
  );
}

function getSenderId(msg) {
  if (!msg) return null;

  return String(
    msg.from?.id ||
    msg.senderID ||
    "unknown"
  );
}

function getMessageText(msg) {
  if (!msg) return "";

  return String(
    msg.text ||
    msg.body ||
    ""
  ).trim();
}

/* =========================
   DOWNLOAD VIDEO
========================= */

async function downloadVideo(video) {
  const filePath = path.join(CACHE_DIR, video.file);

  // Already downloaded
  if (await fs.pathExists(filePath)) {
    const stat = await fs.stat(filePath);

    // Avoid using an empty/corrupt file
    if (stat.size > 0) {
      return filePath;
    }

    await fs.remove(filePath).catch(() => {});
  }

  const tempPath = `${filePath}.tmp`;

  try {
    console.log(`[DOWNLOAD] Starting: ${video.file}`);

    const response = await axios({
      method: "GET",
      url: video.url,
      responseType: "stream",
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(tempPath);

      let finished = false;

      const done = (err) => {
        if (finished) return;

        finished = true;

        if (err) {
          writer.destroy();
          reject(err);
        } else {
          resolve();
        }
      };

      response.data.on("error", done);
      writer.on("error", done);
      writer.on("finish", () => done());

      response.data.pipe(writer);
    });

    const stat = await fs.stat(tempPath);

    if (!stat.size) {
      throw new Error("Downloaded video is empty");
    }

    await fs.move(tempPath, filePath, {
      overwrite: true
    });

    console.log(`[DOWNLOAD] Success: ${video.file}`);

    return filePath;

  } catch (err) {
    await fs.remove(tempPath).catch(() => {});

    console.log(
      `[DOWNLOAD] Failed: ${video.file} -> ${err.message}`
    );

    throw err;
  }
}

/* =========================
   PRE-DOWNLOAD VIDEOS
========================= */

async function downloadVideos() {
  console.log("[MANTION] Checking videos...");

  for (const video of videoList) {
    try {
      await downloadVideo(video);
    } catch (err) {
      console.log(
        `[MANTION] Could not cache ${video.file}: ${err.message}`
      );
    }
  }

  console.log("[MANTION] Video cache check completed.");
}

// Run in background
downloadVideos().catch(err => {
  console.log("[MANTION] Startup download error:", err.message);
});

/* =========================
   SEND LOADING
========================= */

async function sendLoading(bot, chatId, replyTo) {
  try {
    if (!bot || !chatId) return null;

    return await bot.sendMessage(
      chatId,
      "🔄 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 𝗥𝗘𝗣𝗟𝗬...",
      replyTo
        ? {
            reply_to_message_id: replyTo
          }
        : {}
    );

  } catch (err) {
    console.log(
      "[MANTION] Loading message failed:",
      err.message
    );

    return null;
  }
}

/* =========================
   DELETE LOADING
========================= */

async function deleteLoading(bot, chatId, loadingMsg) {
  try {
    if (!bot || !chatId || !loadingMsg) return;

    const loadingId =
      loadingMsg.message_id ||
      loadingMsg.messageID;

    if (!loadingId) return;

    await bot
      .deleteMessage(chatId, loadingId)
      .catch(() => {});

  } catch (err) {
    console.log(
      "[MANTION] Loading delete failed:",
      err.message
    );
  }
}

/* =========================
   SEND FALLBACK
========================= */

async function sendFallback(bot, chatId, replyTo, text) {
  try {
    if (!bot || !chatId) return false;

    await bot.sendMessage(
      chatId,
      text,
      replyTo
        ? {
            reply_to_message_id: replyTo
          }
        : {}
    );

    return true;

  } catch (err) {
    console.log(
      "[MANTION] Fallback message failed:",
      err.message
    );

    return false;
  }
}

/* =========================
   MODULE
========================= */

module.exports = {

  config: {
    name: "mantion",
    version: "15.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",

    role: 0,

    shortDescription: {
      en: "Admin mention auto reply"
    },

    category: "system",

    countDown: 0,

    guide: {
      en: "{pn}"
    }
  },

  onStart: async function () {},

  /* =========================
     TELEGRAM CHAT EVENT
  ========================= */

  onChat: async function ({ api: bot, event: msg }) {

    let loadingMsg = null;

    // IMPORTANT:
    // Define these BEFORE try/catch
    // so catch block can ALWAYS use them.
    const chatId = getChatId(msg);
    const replyTo = getMessageId(msg);
    const senderID = getSenderId(msg);

    try {

      /* =========================
         BASIC VALIDATION
      ========================= */

      if (!msg) return;

      if (!bot) {
        console.log("[MANTION] Bot object missing.");
        return;
      }

      if (!chatId) {
        console.log("[MANTION] Chat ID missing.");
        return;
      }

      /* =========================
         MESSAGE TEXT
      ========================= */

      const originalText = getMessageText(msg);

      const text = originalText.toLowerCase();

      /* =========================
         TRIGGERS
      ========================= */

      const triggers = [
        "siyam",
        "সিয়াম ভাই",
        "সিয়াম ভাই",
        "@siyamtgbot",
        "@ri_siyam",
        "সিয়াম",
        "সিয়াম",
        "বট ওনার কে"
      ];

      const isTriggered = triggers.some(trigger =>
        text.includes(trigger.toLowerCase())
      );

      /* =========================
         TELEGRAM MENTION CHECK
      ========================= */

      let isMentioned = false;

      if (Array.isArray(msg.entities)) {
        isMentioned = msg.entities.some(entity => {

          if (
            entity &&
            (
              entity.type === "mention" ||
              entity.type === "text_mention"
            )
          ) {
            return true;
          }

          return false;
        });
      }

      /* =========================
         OTHER FRAMEWORK MENTION
      ========================= */

      if (
        !isMentioned &&
        msg.mentions &&
        typeof msg.mentions === "object"
      ) {
        isMentioned =
          Object.keys(msg.mentions).length > 0;
      }

      /* =========================
         NO TRIGGER
      ========================= */

      if (!isTriggered && !isMentioned) {
        return;
      }

      console.log(
        `[MANTION] Trigger detected | chat=${chatId} | user=${senderID}`
      );

      /* =========================
         COOLDOWN
      ========================= */

      const now = Date.now();
      const lastTime = lastReplyUser.get(senderID);

      if (
        lastTime &&
        now - lastTime < USER_COOLDOWN
      ) {
        console.log(
          `[MANTION] Cooldown active for ${senderID}`
        );

        return;
      }

      /* =========================
         SEND LOADING FIRST
      ========================= */

      loadingMsg = await sendLoading(
        bot,
        chatId,
        replyTo
      );

      /* =========================
         CAPTIONS
      ========================= */

      const captions = [
        "Mantion_দিস না _সিয়াম বস এর মন ভালো নেই আজকে-!💔🥀",

        "- আমার বস সিয়াম এর সাথে কেউ সেক্স করে না থুক্কু টেক্স করে নাহ🫂💔",

        "👉আমার বস ♻️ 𝑺𝒊𝒚𝒂𝒎 এখন বিজি আছে। তার ইনবক্সে মেসেজ দিয়ে রাখো https://www.facebook.com/profile.php?id=61589656899295 🔰 ♪√ বস ফ্রি হলে আসবে🧡😁😜🐒",

        "বস সিয়াম কে এত মেনশন না দিয়ে বক্সে আসো হট করে দিবো 🤷‍♂️😘🥒",

        "বস সিয়াম কে Mantion_দিলে চুম্মাইয়া ঠুটের কালার change কইরা,লামু 💋😾🔨",

        "সিয়াম বস এখন বিজি, যা বলার আমাকে বলতে পারেন_!!😼🥰",

        "সিয়াম বস কে এতো মেনশন নাহ দিয়া বস কে একটা জি এফ দে 😒😏",

        "Mantion_না দিয়ে বস সিয়াম এর সাথে সিরিয়াস প্রেম করতে চাইলে ইনবক্স https://www.facebook.com/profile.php?id=61589656899295",

        "বস সিয়াম কে মেনশন দিসনা, পারলে একটা জি এফ দে 😏",

        "বাল পাকনা Mantion_দিস না, বস সিয়াম প্রচুর বিজি আছে 🥵🥀🤐",

        "চুমু খাওয়ার বয়স টা আমার বস সিয়াম চকলেট 🍫 খেয়ে উড়িয়ে দিল 🤗"
      ];

      const rawCaption =
        captions[
          Math.floor(Math.random() * captions.length)
        ];

      const styledCaption = `
───────────────
『 ${rawCaption} 』
───────────────
👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
`;

      /* =========================
         BUTTONS
      ========================= */

      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "👤 𝗢𝗪𝗡𝗘𝗥",
                url: "https://t.me/ri_siyam"
              },
              {
                text: "🤖 𝗔𝗗𝗗 𝗕𝗢𝚃",
                url: "https://t.me/SiyamTgBot?startgroup=true"
              }
            ]
          ]
        }
      };

      /* =========================
         SELECT RANDOM VIDEO
      ========================= */

      const selectedVideo =
        videoList[
          Math.floor(
            Math.random() * videoList.length
          )
        ];

      let videoPath;

      try {

        /*
         * If cached -> use cache
         * If not cached -> download now
         */
        videoPath = await downloadVideo(
          selectedVideo
        );

      } catch (downloadError) {

        console.log(
          "[MANTION] Video download failed:",
          downloadError.message
        );

        /*
         * VIDEO CANNOT BE DOWNLOADED
         * DON'T STAY SILENT
         */

        await deleteLoading(
          bot,
          chatId,
          loadingMsg
        );

        loadingMsg = null;

        lastReplyUser.delete(senderID);

        await sendFallback(
          bot,
          chatId,
          replyTo,
          `⚠️ 𝗩𝗜𝗗𝗘𝗢 𝗔𝗦𝗧𝗘 𝗣𝗔𝗥𝗘𝗡𝗜!\n\n${rawCaption}\n\n👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`
        );

        return;
      }

      /* =========================
         SEND VIDEO
      ========================= */

      try {

        await bot.sendVideo(
          chatId,
          fs.createReadStream(videoPath),
          {
            caption: styledCaption,

            ...(replyTo
              ? {
                  reply_to_message_id: replyTo
                }
              : {}),

            ...inlineKeyboard
          }
        );

        console.log(
          `[MANTION] Video sent successfully | chat=${chatId}`
        );

        /*
         * ONLY SET COOLDOWN
         * AFTER SUCCESSFUL SEND
         */
        lastReplyUser.set(
          senderID,
          Date.now()
        );

      } catch (videoError) {

        console.log(
          "[MANTION] sendVideo failed:",
          videoError.message
        );

        /*
         * VIDEO SEND FAILED
         * SEND TEXT INSTEAD
         */

        lastReplyUser.delete(senderID);

        await sendFallback(
          bot,
          chatId,
          replyTo,
          `⚠️ 𝗩𝗜𝗗𝗘𝗢 𝗦𝗘𝗡𝗗 𝗛𝗢𝗬𝗡𝗜!\n\n${rawCaption}\n\n👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`
        );
      }

      /* =========================
         DELETE LOADING
      ========================= */

      await deleteLoading(
        bot,
        chatId,
        loadingMsg
      );

      loadingMsg = null;

    } catch (err) {

      /*
       * GLOBAL ERROR HANDLER
       */

      console.log(
        "[MANTION] GLOBAL ERROR:",
        err
      );

      /*
       * IMPORTANT:
       * Never leave user without a response.
       */

      lastReplyUser.delete(senderID);

      /* Delete loading */
      await deleteLoading(
        bot,
        chatId,
        loadingMsg
      );

      loadingMsg = null;

      /* Send error/fallback */
      await sendFallback(
        bot,
        chatId,
        replyTo,
        "❌ 𝗞𝗔𝗝 𝗞𝗢𝗥𝗧𝗘 𝗦𝗢𝗠𝗢𝗦𝗦𝗔 𝗛𝗢𝗬𝗘𝗖𝗛𝗘!\n\n🔄 আবার মেনশন করে দেখুন।"
      );
    }
  },

  /* =========================
     ALTERNATIVE HANDLER
  ========================= */

  handleMessage: async function (bot, msg) {
    return this.onChat({
      api: bot,
      event: msg
    });
  }
};
