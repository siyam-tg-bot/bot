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

global.pendingInstalls = global.pendingInstalls || new Map();

module.exports = {
  name: "cmd",
  version: "3.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 2,
  category: "admin",
  description: "Advanced command manager with smart overwrite system",

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
» 👑 𝗢𝐖𝐍𝗘𝗥: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

      return bot.sendMessage(chatId, helpText, {
        reply_to_message_id: messageId,
        reply_markup: defaultButtons
      });
    }

    const action = args[0].toLowerCase();

    if (action === "load" && args[1]) {
      const fileName = args[1].replace(".js", "");
      try {
        global.utils.loadCommandFile(fileName);
        return bot.sendMessage(chatId, `✅ সফলভাবে \`${fileName}.js\` লোড হয়েছে।`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
      } catch (err) {
        return bot.sendMessage(chatId, `❌ লোড করতে ব্যর্থ: ${err.message}`, { reply_to_message_id: messageId });
      }
    }

    else if (action === "loadall" || action === "load-all") {
      const files = fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith(".js"));
      let loadedCount = 0;
      files.forEach(file => {
        try {
          global.utils.loadCommandFile(file.replace(".js", ""));
          loadedCount++;
        } catch (e) {}
      });
      return bot.sendMessage(chatId, `✅ সফলভাবে মোট ${loadedCount} টি কমান্ড লোড হয়েছে।`, { reply_to_message_id: messageId, reply_markup: defaultButtons });
    }

    else if (action === "unload" && args[1]) {
      const fileName = args[1].replace(".js", "");
      try {
        global.utils.unloadCommandFile(fileName);
        return bot.sendMessage(chatId, `✅ \`${fileName}.js\` আনলোড করা হয়েছে।`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
      } catch (err) {
        return bot.sendMessage(chatId, `❌ আনলোড করতে সমস্যা: ${err.message}`, { reply_to_message_id: messageId });
      }
    }

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

      let loadingMsg = await bot.sendMessage(chatId, "⏳ কোড ফেচ এবং যাচাই করা হচ্ছে...", { reply_to_message_id: messageId }).catch(() => {});

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
          return bot.sendMessage(chatId, "⚠️ কোনো কোড বা বৈধ ইউআরএল পাওয়া যায়নি!", { reply_to_message_id: messageId });
        }

        const cleanFileName = fileName.replace(".js", "");
        const filePath = path.join(COMMANDS_DIR, `${cleanFileName}.js`);

        if (loadingMsg) bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

        if (fs.existsSync(filePath)) {
          global.pendingInstalls.set(`${chatId}_${messageId}`, { filePath, rawCode, cleanFileName, fileName });
          
          const confirmText = 
`⚠️ **সতর্কবার্তা!**
────────────────
এই নামে (\`${fileName}\`) ইতিমধ্যে একটি কমান্ড ফাইল বিদ্যমান রয়েছে। আপনি কি পুরনো ফাইলটি মুছে নতুন ফাইলটি ইনস্টল করতে চান?`;

          return bot.sendMessage(chatId, confirmText, {
            reply_to_message_id: messageId,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🔄 𝗜𝗡𝗦𝗧𝗔𝗟𝗟 𝗡𝗢𝗪", callback_data: `cmd_overwrite_${chatId}_${messageId}` },
                  { text: "❌ 𝗖𝗔𝗡𝗖𝗘𝗟", callback_data: `cmd_cancel_${chatId}_${messageId}` }
                ]
              ]
            }
          });
        }

        fs.writeFileSync(filePath, rawCode, "utf8");

        try {
          global.utils.loadCommandFile(cleanFileName);
        } catch (loadErr) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          throw loadErr;
        }

        return bot.sendMessage(chatId, `✅ সফলভাবে \`${fileName}\` ইনস্টল ও লোড হয়েছে!`, { reply_to_message_id: messageId, reply_markup: defaultButtons });

      } catch (err) {
        if (loadingMsg) bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
        return bot.sendMessage(chatId, `❌ ইনস্টল ব্যর্থ!\n\n⚠️ এরর: \`${err.message}\``, { reply_to_message_id: messageId, parse_mode: "Markdown" });
      }
    }
  },

  onCallbackQuery: async ({ bot, query }) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (data.startsWith("cmd_overwrite_")) {
      const key = data.replace("cmd_overwrite_", "");
      const pendingData = global.pendingInstalls.get(key);

      if (!pendingData) {
        return bot.answerCallbackQuery(query.id, { text: "⚠️ সময়সীমা শেষ অথবা ডেটা পাওয়া যায়নি!", show_alert: true });
      }

      const { filePath, rawCode, cleanFileName, fileName } = pendingData;

      try {
        fs.writeFileSync(filePath, rawCode, "utf8");
        global.utils.loadCommandFile(cleanFileName);
        global.pendingInstalls.delete(key);

        await bot.answerCallbackQuery(query.id, { text: "✅ Successfully Installed!" });
        return bot.editMessageText(`✅ সফলভাবে পুরনো ফাইল ওভাররাইট করে \`${fileName}\` ইনস্টল ও লোড করা হয়েছে!`, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🔄 Load All", callback_data: "cmd_loadall" },
                { text: "📜 Command List", callback_data: "cmd_list" }
              ]
            ]
          }
        });
      } catch (err) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return bot.editMessageText(`❌ ওভাররাইট ও ইনস্টল করতে গিয়ে এরর এসেছে:\n\`\`\`javascript\n${err.message}\n\`\`\``, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown"
        });
      }
    }

    if (data.startsWith("cmd_cancel_")) {
      const key = data.replace("cmd_cancel_", "");
      global.pendingInstalls.delete(key);
      await bot.answerCallbackQuery(query.id, { text: "❌ Installation Cancelled." });
      return bot.editMessageText("❌ ইনস্টলেশন বাতিল করা হয়েছে। পুরনো ফাইলটি বহাল আছে।", {
        chat_id: chatId,
        message_id: messageId
      });
    }

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
