const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");

const COMMANDS_DIR = path.join(__dirname);

function getDomain(url) {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function isURL(str) {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  name: "cmd",
  version: "2.1.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 2,
  category: "admin",
  description: "Manage and install command files dynamically",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const rawArgsText = Array.isArray(args) ? args.join(" ") : "";

    let botUsername = "SiyamSM_2026Bot";
    try {
      const me = await bot.getMe();
      botUsername = me.username;
    } catch (e) {}

    const defaultButtons = {
      inline_keyboard: [
        [
          { text: "🔄 Load All", callback_data: "cmd_loadall" },
          { text: "📜 Command List", callback_data: "cmd_list" }
        ],
        [
          { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
          { text: "👑 𝐎𝐖𝐍𝗘𝗥", url: "https://t.me/ri_siyam" }
        ]
      ]
    };

    if (!args || args.length === 0) {
      const helpText = 
`  𝗢𝗪𝗡𝗘𝗥 𝗦𝗜𝗬𝗔𝗠-𝗛𝗔𝗦𝗔𝗡
───────────────
» 🛠 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗠𝗔𝗡𝗔𝗚𝗘𝗥
» ⚙️ /cmd load <filename>
» ⚙️ /cmd unload <filename>
» ⚙️ /cmd loadall
» ⚙️ /cmd install <filename.js> <code>
───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

      return bot.sendMessage(chatId, helpText, {
        reply_to_message_id: messageId,
        reply_markup: defaultButtons
      });
    }

    const action = args[0].toLowerCase();

    // LOAD
    if (action === "load" && args[1]) {
      const fileName = args[1].replace(".js", "");
      try {
        global.utils.loadCommandFile(fileName);
        return bot.sendMessage(chatId, `✅ সফলভাবে \`${fileName}.js\` লোড হয়েছে।`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
      } catch (err) {
        return bot.sendMessage(chatId, `❌ লোড করতে ব্যর্থ: ${err.message}`, { reply_to_message_id: messageId });
      }
    }

    // LOAD ALL
    else if (action === "loadall" || action === "load-all") {
      const files = fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith(".js"));
      let loadedCount = 0;
      for (const file of files) {
        try {
          global.utils.loadCommandFile(file.replace(".js", ""));
          loadedCount++;
        } catch (e) {}
      }
      return bot.sendMessage(chatId, `✅ সফলভাবে মোট ${loadedCount} টি কমান্ড লোড হয়েছে।`, { reply_to_message_id: messageId, reply_markup: defaultButtons });
    }

    // UNLOAD
    else if (action === "unload" && args[1]) {
      const fileName = args[1].replace(".js", "");
      try {
        global.utils.unloadCommandFile(fileName);
        return bot.sendMessage(chatId, `✅ \`${fileName}.js\` আনলোড করা হয়েছে।`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
      } catch (err) {
        return bot.sendMessage(chatId, `❌ আনলোড করতে সমস্যা: ${err.message}`, { reply_to_message_id: messageId });
      }
    }

    // INSTALL
    else if (action === "install") {
      let url = args[1];
      let fileName = args[2];
      let rawCode = "";

      if (!url || !fileName) {
        return bot.sendMessage(chatId, "⚠️ সঠিক নিয়ম: `/cmd install <url> <filename.js>` অথবা `/cmd install <filename.js> <code>`", { reply_to_message_id: messageId });
      }

      if (url.endsWith(".js") && !isURL(url)) {
        const tmp = fileName;
        fileName = url;
        url = tmp;
      }

      let loadingMsg = await bot.sendMessage(chatId, "⏳ ইনস্টল করা হচ্ছে...", { reply_to_message_id: messageId }).catch(() => {});

      try {
        if (url && isURL(url)) {
          let fetchUrl = url;
          const domain = getDomain(fetchUrl);
          if (domain === "pastebin.com") {
            const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
            if (fetchUrl.match(regex)) fetchUrl = fetchUrl.replace(regex, "https://pastebin.com/raw/$1");
          }
          const res = await axios.get(fetchUrl, { timeout: 15000 });
          rawCode = res.data;
        } else {
          if (args[args.length - 1].endsWith(".js")) {
            fileName = args[args.length - 1];
            rawCode = rawArgsText.slice(rawArgsText.indexOf('install') + 7, rawArgsText.indexOf(fileName)).trim();
          } else if (args[1].endsWith(".js")) {
            fileName = args[1];
            rawCode = rawArgsText.slice(rawArgsText.indexOf(fileName) + fileName.length).trim();
          }
        }

        if (!rawCode) {
          if (loadingMsg) bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
          return bot.sendMessage(chatId, "⚠️ কোনো কোড পাওয়া যায়নি!", { reply_to_message_id: messageId });
        }

        const cleanFileName = fileName.replace(".js", "");
        const filePath = path.join(COMMANDS_DIR, `${cleanFileName}.js`);

        fs.writeFileSync(filePath, rawCode, "utf8");

        try {
          global.utils.loadCommandFile(cleanFileName);
        } catch (loadErr) {
          // সিনট্যাক্স বা অন্য কোনো এরর থাকলে অটো ডিলিট করে দেওয়া হবে
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          throw loadErr;
        }

        if (loadingMsg) bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
        return bot.sendMessage(chatId, `✅ সফলভাবে \`${fileName}\` ইনস্টল ও লোড হয়েছে!`, { reply_to_message_id: messageId, reply_markup: defaultButtons });

      } catch (err) {
        let targetFile = fileName ? (fileName.endsWith(".js") ? fileName : `${fileName}.js`) : "";
        if (targetFile) {
          const badPath = path.join(COMMANDS_DIR, targetFile);
          if (fs.existsSync(badPath)) fs.unlinkSync(badPath);
        }
        if (loadingMsg) bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
        return bot.sendMessage(chatId, `❌ ইনস্টল ব্যর্থ ও ফাইল ডিলিট করা হয়েছে!\n\n⚠️ এরর: \`${err.message}\``, { reply_to_message_id: messageId, parse_mode: "Markdown" });
      }
    }
  },

  onCallbackQuery: async ({ bot, query }) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (data === "cmd_loadall") {
      await bot.answerCallbackQuery(query.id, { text: "⏳ Reloading..." }).catch(() => {});
      const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith(".js"));
      let count = 0;
      files.forEach(f => {
        try {
          global.utils.loadCommandFile(f.replace(".js", ""));
          count++;
        } catch (e) {}
      });
      return bot.editMessageText(`✅ সফলভাবে ${count} টি ফাইল রিলোড করা হয়েছে!`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "cmd_main" }]] }
      });
    }

    if (data === "cmd_list") {
      await bot.answerCallbackQuery(query.id, { text: "📂 Loading..." }).catch(() => {});
      const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith(".js"));
      const buttons = files.map(f => [{ text: `⚙️ ${f.replace(".js", "")}`, callback_data: `cmd_info_${f}` }]);
      buttons.push([{ text: "🔙 Back", callback_data: "cmd_main" }]);
      return bot.editMessageText("📂 *কমান্ড ফাইলসমূহ:*", {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: buttons }
      });
    }

    if (data === "cmd_main") {
      return bot.editMessageText(`  𝗢𝗪𝗡𝗘𝗥 𝗦𝗜𝗬𝗔𝗠-𝗛𝗔𝗦𝗔𝗡\n───────────────\n» 🛠 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗠𝗔𝗡𝗔𝗚𝗘𝗥`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔄 Load All", callback_data: "cmd_loadall" },
              { text: "📜 Command List", callback_data: "cmd_list" }
            ]
          ]
        }
      });
    }
  }
};
