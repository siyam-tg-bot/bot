const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const config = require("../config");

const COMMANDS_DIR = path.join(__dirname);

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
  aliases: ["command", "cmds"],
  version: "5.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 2,
  category: "admin",
  shortDescription: "Manage & install command files dynamically",
  longDescription: "Allows admins to load, unload, reload all, and install commands directly via URL or raw code.",
  guide: "cmd load <filename>\ncmd unload <filename>\ncmd loadall\ncmd install <filename.js> <code>",

  execute: async (bot, msg, argsText) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let botUsername = config.botUsername || "SiyamSM_2026Bot";
    try {
      const me = await bot.getMe();
      botUsername = me.username;
    } catch (e) {}

    const defaultButtons = {
      inline_keyboard: [
        [
          { text: "🔄 Load All Commands", callback_data: "cmd_loadall" },
          { text: "📜 Command List", callback_data: "cmd_list" }
        ],
        [
          { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
          { text: "👑 𝐎𝐖𝐍𝗘𝗥", url: `https://t.me/${config.ownerUsername || "ri_siyam"}` }
        ]
      ]
    };

    const rawInput = typeof argsText === "string" ? argsText.trim() : (Array.isArray(argsText) ? argsText.join(" ") : "");
    const args = rawInput ? rawInput.split(/\s+/) : [];

    if (!args.length) {
      const captionText = 
`  𝗢𝗪𝗡𝗘𝗥 𝗦𝗜𝗬𝗔𝗠-𝗛𝗔𝗦𝗔𝗡
───────────────
» 🛠 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗠𝗔𝗡𝗔𝗚𝗘𝗥
» 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: @${botUsername}
───────────────
» ⚙️ /cmd load <filename>
» ⚙️ /cmd unload <filename>
» ⚙️ /cmd loadall
» ⚙️ /cmd install <filename.js> <code>
───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝗔𝗦𝗔𝐍 👑`;

      return bot.sendMessage(chatId, captionText, {
        reply_to_message_id: messageId,
        reply_markup: defaultButtons
      });
    }

    const action = args[0].toLowerCase();

    if (action === "loadall") {
      return module.exports.handleLoadAll(bot, chatId, messageId);
    }

    if (action === "load") {
      const fileName = args[1];
      if (!fileName) return bot.sendMessage(chatId, "⚠️ ফাইল বা কমান্ডের নাম দিন।", { reply_to_message_id: messageId });
      return module.exports.handleLoad(bot, chatId, messageId, fileName);
    }

    if (action === "unload") {
      const fileName = args[1];
      if (!fileName) return bot.sendMessage(chatId, "⚠️ ফাইল বা কমান্ডের নাম দিন।", { reply_to_message_id: messageId });
      return module.exports.handleUnload(bot, chatId, messageId, fileName);
    }

    if (action === "install") {
      if (args.length < 2) {
        return bot.sendMessage(chatId, "⚠️ সঠিক নিয়ম: `/cmd install <filename.js> <code>` অথবা URL প্রদান করুন।", {
          reply_to_message_id: messageId,
          parse_mode: "Markdown"
        });
      }

      let fileName = args[1];
      if (!fileName.endsWith(".js")) fileName += ".js";

      const codeOrUrl = rawInput.substring(rawInput.indexOf(args[1]) + args[1].length).trim();

      if (!codeOrUrl) {
        return bot.sendMessage(chatId, "⚠️ কোনো কোড বা URL পাওয়া যায়নি!", { reply_to_message_id: messageId });
      }

      let loadingMsg;
      try {
        loadingMsg = await bot.sendMessage(chatId, "⏳ ফাইল যাচাই এবং ইনস্টল করা হচ্ছে...", { reply_to_message_id: messageId });
      } catch (e) {}

      const filePath = path.join(COMMANDS_DIR, fileName);

      try {
        let rawCode = "";

        if (isURL(codeOrUrl)) {
          let fetchUrl = codeOrUrl;
          if (fetchUrl.includes("github.com") && fetchUrl.includes("/blob/")) {
            fetchUrl = fetchUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
          }
          const res = await axios.get(fetchUrl, { timeout: 15000 });
          rawCode = res.data;
        } else {
          rawCode = codeOrUrl
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\u2018\u2019]/g, "'");
        }

        // প্রথমে ফাইলটি রাইট করা হচ্ছে
        fs.writeFileSync(filePath, rawCode, "utf8");
        delete require.cache[require.resolve(filePath)];
        
        // ফাইলটি require করে টেস্ট করা হচ্ছে
        const installedCmd = require(filePath);

        const captionText = 
`  𝗢𝗪𝗡𝗘𝗥 𝗦𝗜𝗬𝗔𝗠-𝗛𝗔𝗦𝗔𝗡
───────────────
» ✅ 𝗙𝗜𝗟𝗘 𝗜𝗡𝗦𝗧𝗔𝗟𝗟𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬!
» 📁 𝗙𝗜𝗟𝗘 𝗡𝗔𝗠𝗘: ${fileName}
» ⚙️ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗: ${installedCmd.name || "N/A"}
» 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: @${botUsername}
───────────────
» 🏷️ 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗬: ${installedCmd.category || "system"}
» 🔢 𝗩𝗘𝗥𝗦𝗜𝗢𝗡: ${installedCmd.version || "1.0.0"}
───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝗛𝗔𝗦𝗔𝗡 👑`;

        if (loadingMsg) await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

        return bot.sendMessage(chatId, captionText, {
          reply_to_message_id: messageId,
          reply_markup: defaultButtons
        });

      } catch (err) {
        // যদি এরর খায়, তাহলে ভুল ফাইলটি সাথে সাথে রিমুভ করে দেওয়া হবে
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        let errorType = "Unknown Error";
        let errorDetails = err.message;

        // এরর ক্যাটাগরি অনুযায়ী মেসেজ কাস্টমাইজ করা
        if (err instanceof SyntaxError) {
          errorType = "🔴 Syntax Error (কোডে ভুল আছে)";
        } else if (err.code === "MODULE_NOT_FOUND") {
          errorType = "📦 Missing Module (প্যাকেজ ইন্সটল করা নেই)";
        } else if (err instanceof TypeError) {
          errorType = "⚠️ Type Error (ভুল টাইপ ব্যবহার হয়েছে)";
        }

        const errorMsg = 
`❌ **ফাইল ইনস্টল করতে ব্যর্থ হয়েছে!**

📌 **ফাইলের নাম:** \`${fileName}\`
🛠 **সমস্যার ধরন:** ${errorType}
⚠️ **বিস্তারিত এরর:**
\`\`\`javascript
${errorDetails}
\`\`\`
*নোট: সমস্যাযুক্ত ফাইলটি স্বয়ংক্রিয়ভাবে ডিলিট করে দেওয়া হয়েছে। কোড ঠিক করে পুনরায় চেষ্টা করুন।*`;

        if (loadingMsg) await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
        
        return bot.sendMessage(chatId, errorMsg, {
          reply_to_message_id: messageId,
          parse_mode: "Markdown"
        });
      }
    }
  },

  // ... (বাকি ফাংশনগুলো আগের মতোই থাকবে, শুধু handleLoad এর এরর মেসেজ আপডেট করা হলো)

  handleLoad: async (bot, chatId, messageId, fileName) => {
    const fileWithExt = fileName.endsWith(".js") ? fileName : `${fileName}.js`;
    const filePath = path.join(COMMANDS_DIR, fileWithExt);

    if (!fs.existsSync(filePath)) {
      return bot.sendMessage(chatId, `⚠️ \`${fileWithExt}\` ফাইলটি খুজে পাওয়া যায়নি!`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
    }

    try {
      delete require.cache[require.resolve(filePath)];
      require(filePath);
      return bot.sendMessage(chatId, `✅ \`${fileWithExt}\` রিলোড সম্পন্ন হয়েছে।`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
    } catch (err) {
      let errorDetails = err.message;
      return bot.sendMessage(chatId, `❌ **${fileWithExt} লোড করতে ব্যর্থ!**\n\n⚠️ **এরর:**\n\`\`\`javascript\n${errorDetails}\n\`\`\``, { 
        reply_to_message_id: messageId, 
        parse_mode: "Markdown" 
      });
    }
  },

  // ... (handleUnload, handleLoadAll, handleCallback আগের মতোই থাকবে)
  handleLoadAll: async (bot, chatId, messageId) => {
    try {
      let botUsername = config.botUsername || "SiyamSM_2026Bot";
      try {
        const me = await bot.getMe();
        botUsername = me.username;
      } catch (e) {}

      const files = fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith(".js"));
      let loadedCount = 0;
      let failedFiles = [];

      files.forEach(file => {
        const filePath = path.join(COMMANDS_DIR, file);
        try {
          delete require.cache[require.resolve(filePath)];
          require(filePath);
          loadedCount++;
        } catch (err) {
          failedFiles.push({ file, error: err.message });
        }
      });

      let captionText = 
`  𝗢𝗪𝗡𝗘𝗥 𝗦𝗜𝗬𝗔𝗠-𝗛𝗔𝗦𝗔𝗡
───────────────
» 📂 𝗧𝗢𝗧𝗔𝗟 𝗙𝗜𝗟𝗘𝗦: ${files.length}
» ✅ 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟: ${loadedCount}
» ❌ 𝗙𝗔𝗜𝗟𝗘𝗗/𝗘𝗥𝗥𝗢𝗥: ${failedFiles.length}
» 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: @${botUsername}
───────────────\n`;

      if (failedFiles.length > 0) {
        captionText += `⚠️ 𝗦𝗢𝗠𝗢𝗦𝗦𝗔 𝗝𝗨𝗞𝗧𝗢 𝗙𝗜𝗟𝗘:\n`;
        failedFiles.forEach((item, idx) => {
          captionText += `» ${idx + 1}. ${item.file}\n   ┗ 🔴 ${item.error.substring(0, 50)}...\n`;
        });
      } else {
        captionText += `» ✨ সকল কমান্ড ফাইল সফলভাবে লোড হয়েছে!\n`;
      }

      captionText += `───────────────\n» 👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝗛𝗔𝗦𝗔𝗡 👑`;

      return bot.sendMessage(chatId, captionText, {
        reply_to_message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
              { text: "📜 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓", callback_data: "cmd_list" }
            ],
            [
              { text: "👑 𝐎𝐖𝐍𝗘𝗥", url: `https://t.me/${config.ownerUsername || "ri_siyam"}` }
            ]
          ]
        }
      });
    } catch (e) {
      return bot.sendMessage(chatId, `❌ সিস্টেম লোড এরর: ${e.message}`, { reply_to_message_id: messageId });
    }
  },

  handleUnload: async (bot, chatId, messageId, fileName) => {
    const fileWithExt = fileName.endsWith(".js") ? fileName : `${fileName}.js`;
    const filePath = path.join(COMMANDS_DIR, fileWithExt);

    if (!fs.existsSync(filePath)) {
      return bot.sendMessage(chatId, `⚠️ "${fileWithExt}" ফাইলটি ডিরেক্টরি-তে নেই!`, { reply_to_message_id: messageId });
    }

    try {
      delete require.cache[require.resolve(filePath)];
      return bot.sendMessage(chatId, `✅ "${fileWithExt}" আনলোড করা হয়েছে।`, { reply_to_message_id: messageId });
    } catch (err) {
      return bot.sendMessage(chatId, `❌ আনলোড করতে সমস্যা: ${err.message}`, { reply_to_message_id: messageId });
    }
  },

  handleCallback: async (bot, query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    let botUsername = config.botUsername || "SiyamSM_2026Bot";
    try {
      const me = await bot.getMe();
      botUsername = me.username;
    } catch (e) {}

    if (data === "cmd_loadall") {
      await bot.answerCallbackQuery(query.id, { text: "⏳ Reloading command files..." });
      return module.exports.handleLoadAll(bot, chatId, messageId);
    }

    if (data === "cmd_list") {
      await bot.answerCallbackQuery(query.id, { text: "📂 Loading Command List" });
      const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith(".js"));

      const fileButtons = files.map(file => [
        { text: `⚙️ ${file.replace(".js", "")}`, callback_data: `cmd_manage_${file}` }
      ]);

      fileButtons.push([{ text: "🔙 Back", callback_data: "cmd_main" }]);

      return bot.editMessageText("📂 *সকল সক্রিয় ফাইল নির্বাচন করুন:*", {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: fileButtons }
      });
    }

    if (data.startsWith("cmd_manage_")) {
      const fileName = data.replace("cmd_manage_", "");
      const manageButtons = [
        [
          { text: "🔄 Reload Command", callback_data: `cmd_reload_${fileName}` },
          { text: "❌ Unload Command", callback_data: `cmd_unload_${fileName}` }
        ],
        [
          { text: "🔙 Back to List", callback_data: "cmd_list" }
        ]
      ];

      return bot.editMessageText(`📁 *Selected File:* \`${fileName}\`\nপ্রয়োজনীয় অপশন বেছে নিন:`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: manageButtons }
      });
    }

    if (data.startsWith("cmd_reload_")) {
      const fileName = data.replace("cmd_reload_", "");
      await bot.answerCallbackQuery(query.id, { text: `Reloading ${fileName}...` });
      return module.exports.handleLoad(bot, chatId, messageId, fileName);
    }

    if (data.startsWith("cmd_unload_")) {
      const fileName = data.replace("cmd_unload_", "");
      await bot.answerCallbackQuery(query.id, { text: `Unloading ${fileName}...` });
      return module.exports.handleUnload(bot, chatId, messageId, fileName);
    }

    if (data === "cmd_main") {
      const captionText = 
`  𝗢𝗪𝗡𝗘𝗥 𝗦𝗜𝗬𝗔𝗠-𝗛𝗔𝗦𝗔𝗡
───────────────
» 🛠 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗠𝗔𝗡𝗔𝗚𝗘𝗥
» 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: @${botUsername}
───────────────
» ⚙️ /cmd load <filename>
» ⚙️ /cmd unload <filename>
» ⚙️ /cmd loadall
» ⚙️ /cmd install <filename.js> <code>
───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝗛𝗔𝗦𝗔𝗡 👑`;

      return bot.editMessageText(captionText, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔄 Load All Commands", callback_data: "cmd_loadall" },
              { text: "📜 Command List", callback_data: "cmd_list" }
            ],
            [
              { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
              { text: "👑 𝐎𝐖𝐍𝗘𝗥", url: `https://t.me/${config.ownerUsername || "ri_siyam"}` }
            ]
          ]
        }
      });
    }
  }
};
