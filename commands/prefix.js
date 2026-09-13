const fs = require("fs");
const path = require("path");
const https = require("https");
const moment = require("moment-timezone");
const config = require("../config");

function downloadMedia(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject(new Error("Media download failed"));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

global.prefixVideoToggle = global.prefixVideoToggle || {};

const mediaList = [
  "https://tmpfiles.org/dl/wdwFibqdw8im/catbox_1785488054781.gif",
  "https://tmpfiles.org/dl/wCwXisPFpvOc/catbox_1785488006710.gif"
];

module.exports = {
  name: "prefix",
  version: "2.6",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Change & show bot prefix",
  longDescription: "Change & show bot prefix interactively with buttons",
  category: "config",
  guide: "{pn} <new_prefix> | {pn} reset",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const userId = msg.from ? msg.from.id : 0;
    const currentPrefix = config.prefix || "/";

    // ১. কোনো আর্গুমেন্ট না থাকলে প্যানেল দেখাবে (onChat এর মতো কাজ করবে)
    if (!args || args.length === 0) {
      if (global.prefixVideoToggle[chatId] === undefined)
        global.prefixVideoToggle[chatId] = 0;

      const index = global.prefixVideoToggle[chatId];
      global.prefixVideoToggle[chatId] = index === 0 ? 1 : 0;

      const randomUrl = mediaList[index];
      const cacheDir = path.join(__dirname, "..", "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const mediaPath = path.join(cacheDir, `prefix_${Date.now()}.gif`);

      const systemPrefix = config.prefix || "/";
      const groupPrefix = config.prefix || "/";
      const groupName = msg.chat.title || "Private Chat";

      const time = moment().tz("Asia/Dhaka").format("hh:mm A");
      const date = moment().tz("Asia/Dhaka").format("DD MMM YYYY");
      const owner = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
      const totalCommands = bot.commands ? bot.commands.size : 0;

      const design1 = `╭👑 𝐏𝐑𝐄𝐅𝐈𝐗 𝐏𝐀𝐍𝐄𝐋 👑 ╮
🏷️ 𝐆𝐑𝐎𝐔𝐏 ➜ ${groupName}
🔰 𝐒𝐘𝐒𝐓𝐄𝐌 ➜ ${systemPrefix}
💬 𝐏𝐑𝐄𝐅𝐈𝐗 ➜ ${groupPrefix}
⏰ 𝐓𝐈𝐌𝐄 ➜ ${time}
📅 𝐃𝐀𝐓𝐄 ➜ ${date}
👑 𝐎𝐖𝐍𝐄𝐑 ➜ ${owner}
📊 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 ➜ ${totalCommands}
🚀 𝐕𝐄𝐑𝐒𝐈𝐎𝐍 ➜ 𝐕𝟐 • 𝐕𝟑 • 𝐕𝟓
⚡ 𝐒𝐓𝐀𝐓𝐔𝐒 ➜ 𝐎𝐍𝐋𝐈𝐍𝐄
〔 💎𝐍𝐈𝐉𝐇𝐔𝐌 𝐁𝐎𝐓💎 〕`;

      const design2 = `◢◤◢◤◢◤◢◤◢◤◢◤◢◤
🔥 𝐏𝐑𝐄𝐅𝐈𝐗 𝐏𝐀𝐍𝐄𝐋 🔥
➥ 👥 𝐆𝐑𝐎𝐔𝐏 :: ${groupName}
➥ ⚙️ 𝐒𝐘𝐒𝐓𝐄𝐌 :: ${systemPrefix}
➥ 💬 𝐏𝐑𝐄𝐅𝐈𝐗 :: ${groupPrefix}
➥ ⏰ 𝐓𝐈𝐌𝐄 :: ${time}
➥ 📆 𝐃𝐀𝐓𝐄 :: ${date}
➥ 👑 𝐎𝐖𝐍𝐄𝐑 :: ${owner}
➥ 📊 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 :: ${totalCommands}
➥ 🚀 𝐕𝐄𝐑𝐒𝐈𝐎𝐍 :: 𝐕𝐕𝟐 • 𝐕𝟑 • 𝐕𝟓
➥ ⚡ 𝐒𝐓𝐀𝐓𝐔𝐒 :: 𝐎𝐍𝐋𝐈𝐍𝐄
💎𝐒𝐈𝐘𝐀𝐌 𝐄𝐌𝐏𝐈𝐑𝐄💎`;

      const textToSend = index === 0 ? design1 : design2;

      try {
        await downloadMedia(randomUrl, mediaPath);
        return await bot.sendAnimation(chatId, mediaPath, {
          caption: textToSend,
          parse_mode: "Markdown",
          reply_to_message_id: messageId
        });
      } catch (err) {
        return await bot.sendMessage(chatId, textToSend, {
          reply_to_message_id: messageId
        });
      }
    }

    // ২. প্রিফিক্স রিসেট বা পরিবর্তন করার কমান্ড হ্যান্ডলার
    if (args[0] === "reset") {
      config.prefix = "/";
      fs.writeFileSync(
        path.join(__dirname, "..", "config.json"),
        JSON.stringify(config, null, 2)
      );
      return bot.sendMessage(chatId, `✅ 𝐏𝐫𝐞𝐟𝐢𝐱 𝐑𝐞𝐬𝐞𝐭 𝐒𝐮𝐜𝐜𝐞𝐬𝐬!\n🔰 𝐒𝐲𝐬𝐭𝐞𝐦: /`, { reply_to_message_id: messageId });
    }

    const newPrefix = args[0];
    const setGlobal = args[1] === "-g";

    // অ্যাডমিন চেক (রোল ২ মানে অ্যাডমিন বা ওনার)
    const isOwner = String(userId) === String(config.ownerID);
    if (setGlobal && !isOwner) {
      return bot.sendMessage(chatId, `⛔ 𝐎𝐧𝐥𝐲 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧 𝐂𝐚𝐧 𝐂𝐡𝐚𝐧𝐠𝐞 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱.`, { reply_to_message_id: messageId });
    }

    const confirmMsg = setGlobal
      ? "⚠️ 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱 𝐂𝐡𝐚𝐧𝐠𝐞?\n👉 𝐂𝐥𝐢𝐜𝐤 𝐁𝐞𝐥𝐨𝐰 𝐓𝐨 𝐂𝐨𝐧𝐟𝐢𝐫𝐦"
      : "⚠️ 𝐆𝐫𝐨𝐮𝐩 𝐏𝐫𝐞𝐟𝐢𝐱 𝐂𝐡𝐚𝐧𝐠𝐞?\n👉 𝐂𝐥𝐢𝐜𝐤 𝐁𝐞𝐥𝐨𝐰 𝐓𝐨 𝐂𝐨𝐧𝐟𝐢𝐫𝐦";

    const confirmMarkup = {
      inline_keyboard: [
        [
          { text: "✅ 𝐂𝐎𝐍𝐅𝐈𝐑𝐌", callback_data: `pref_conf_${newPrefix}_${setGlobal ? 1 : 0}` },
          { text: "❌ 𝐂𝐀𝐍𝐂𝐄𝐋", callback_data: "pref_cancel" }
        ]
      ]
    };

    return bot.sendMessage(chatId, confirmMsg, {
      reply_to_message_id: messageId,
      reply_markup: confirmMarkup
    });
  },

  // ইনলাইন বাটন হ্যান্ডলার (যা টেলিগ্রামে রিঅ্যাকশনের বিকল্প হিসেবে কাজ করবে)
  onCallbackQuery: async function (bot, callbackQuery) {
    const data = callbackQuery.data;
    const qMsg = callbackQuery.message;
    if (!qMsg) return;

    if (data.startsWith("pref_conf_")) {
      const parts = data.split("_");
      const newPrefix = parts[2];
      const isGlobal = parts[3] === "1";

      if (isGlobal) {
        config.prefix = newPrefix;
        try {
          fs.writeFileSync(
            path.join(__dirname, "..", "config.json"),
            JSON.stringify(config, null, 2)
          );
        } catch (e) {}

        await bot.answerCallbackQuery(callbackQuery.id, { text: "Global Prefix Changed!" });
        return await bot.editMessageText(`✅ 𝐆𝐋𝐎𝐁𝐀𝐋 𝐏𝐑𝐄𝐅𝐈𝐗 𝐂𝐇𝐀𝐍𝐆𝐄𝐃!\n🆕 ${newPrefix}`, {
          chat_id: qMsg.chat.id,
          message_id: qMsg.message_id
        });
      } else {
        // সিঙ্গেল চ্যাট বা লোকাল প্রিফিক্স সেটআপ
        await bot.answerCallbackQuery(callbackQuery.id, { text: "Prefix Changed for Chat!" });
        return await bot.editMessageText(`✅ 𝐆𝐑𝐎𝐔𝐏 𝐏𝐑𝐄𝐅𝐈𝐗 𝐂𝐇𝐀𝐍𝐆𝐄𝐃!\n🆕 ${newPrefix}`, {
          chat_id: qMsg.chat.id,
          message_id: qMsg.message_id
        });
      }
    } else if (data === "pref_cancel") {
      await bot.answerCallbackQuery(callbackQuery.id, { text: "Cancelled!" });
      return await bot.editMessageText("❌ Prefix change cancelled.", {
        chat_id: qMsg.chat.id,
        message_id: qMsg.message_id
      });
    }
  }
};
