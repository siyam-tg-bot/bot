const fs = require("fs");
const path = require("path");
const https = require("https");
const config = require("../config");

function downloadGif(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject(new Error("GIF download failed"));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

const categoryEmojis = {
  system: "⚙️",
  admin: "🛠️",
  utility: "🧰",
  fun: "🎮",
  others: "📁",
  media: "🎬",
  adult: "🔥"
};

const categoryFont = (str) =>
  str.split("").map(c => {
    const map = {
      A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",
      I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",
      Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",
      Y:"𝐘",Z:"𝐙"
    };
    return map[c] || c;
  }).join("");

module.exports = {
  name: "help",
  aliases: ["commands", "cmdlist"],
  version: "8.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Show all commands",
  longDescription: "Interactive paginated command list UI",
  category: "system",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const prefix = config.prefix || "/";
    const allCommands = bot.commands;

    const BOT_USERNAME = config.botUsername || "SiyamSM_2026Bot";
    const OWNER_USERNAME = config.ownerUsername || "ri_siyam";

    if (args && args.length > 0) {
      const cmdName = args[0].toLowerCase();
      const cmd =
        allCommands.get(cmdName) ||
        [...allCommands.values()].find(c => c.aliases?.includes(cmdName));

      if (!cmd) {
        return bot.sendMessage(
          chatId,
          `❌ Command '${cmdName}' not found!\nType ${prefix}help to get commands list.`,
          { reply_to_message_id: messageId }
        );
      }

      const infoMsg =
`┏━━━━━━━━━━━━━┓
 🧩 𝐂𝐌𝐃 𝐈𝐍𝐅𝐎
┗━━━━━━━━━━━━━┛
 ✦ 𝐍𝐚𝐦𝐞    : ${cmd.name}
 ✦ 𝐀𝐥𝐢𝐚𝐬𝐞𝐬  : ${cmd.aliases?.join(", ") || "None"}
 ✦ 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲 : ${categoryFont((cmd.category || "Others").toUpperCase())}
 ✦ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧  : v${cmd.version || "1.0"}
 ✦ 𝐀𝐮𝐭𝐡𝐨𝐫   : ${cmd.author || "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍"}
 ✦ 𝐑𝐨𝐥𝐞    : ${cmd.role !== undefined ? cmd.role : 0}
 ✦ 𝐔𝐬𝐚𝐠𝐞    : ${prefix}${cmd.name}
━━━━━━━━━━━━━━━
 📝 ${cmd.longDescription || cmd.shortDescription || "No description available."}`;

      return bot.sendMessage(chatId, infoMsg, {
        reply_to_message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
              { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
            ]
          ]
        }
      });
    }

    const commandList = [];
    if (allCommands) {
      for (const [name, cmd] of allCommands) {
        commandList.push({ name, category: cmd.category || "others" });
      }
    }

    const ITEMS_PER_PAGE = 4;
    const totalPages = Math.ceil(commandList.length / ITEMS_PER_PAGE) || 1;
    let currentPage = 0;

    const generatePageContent = (page) => {
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const currentItems = commandList.slice(start, end);

      let text = 
`┏━━━━━━━━━━━━━┓
 📜 𝐂𝐌𝐃 𝐇𝐔𝐁
┗━━━━━━━━━━━━━┛
 ✍️ 𝐀𝐮𝐭𝐡𝐨𝐫   : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
 🏷️ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧  : v8.0
 🔧 𝐏𝐫𝐞𝐟𝐢𝐱    : ${prefix} | 📊 Total: ${commandList.length}
 📄 𝐏𝐚𝐠𝐞     : ${page + 1} / ${totalPages}
━━━━━━━━━━━━━━━\n`;

      const keyboard = [];

      currentItems.forEach((item) => {
        const emoji = categoryEmojis[item.category.toLowerCase()] || "📌";
        text += `\n${emoji} ➥ \`${prefix}${item.name}\` (${item.category.toUpperCase()})`;
        
        keyboard.push([
          { text: `${emoji} ${prefix}${item.name}`, callback_data: `run_${item.name}` }
        ]);
      });

      const paginationRow = [];
      if (page > 0) {
        paginationRow.push({ text: "⬅️ 𝐁𝐀𝐂𝐊", callback_data: `help_page_${page - 1}` });
      }
      if (page < totalPages - 1) {
        paginationRow.push({ text: "➡️ 𝐍𝐄𝐗𝐓", callback_data: `help_page_${page + 1}` });
      }

      if (paginationRow.length > 0) {
        keyboard.push(paginationRow);
      }

      keyboard.push([
        { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
        { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
      ]);

      return { text, keyboard };
    };

    const { text: msgText, keyboard: inlineKeyboard } = generatePageContent(currentPage);

    const gifURLs = [
      "https://i.imgur.com/Xw6JTfn.gif",
      "https://i.imgur.com/mW0yjZb.gif"
    ];
    const randomGifURL = gifURLs[Math.floor(Math.random() * gifURLs.length)];
    const gifFolder = path.join(__dirname, "..", "cache");

    if (!fs.existsSync(gifFolder)) fs.mkdirSync(gifFolder, { recursive: true });
    const gifPath = path.join(gifFolder, path.basename(randomGifURL));

    let sentMessage;
    try {
      if (!fs.existsSync(gifPath)) {
        await downloadGif(randomGifURL, gifPath);
      }
      sentMessage = await bot.sendAnimation(chatId, gifPath, {
        caption: msgText,
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
        reply_markup: { inline_keyboard: inlineKeyboard }
      });
    } catch (err) {
      sentMessage = await bot.sendMessage(chatId, msgText, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
        reply_markup: { inline_keyboard: inlineKeyboard }
      });
    }

    if (bot.listenerCount("help_page_listener_reg") === 0) {
      bot.on("callback_query", async (callbackQuery) => {
        const data = callbackQuery.data;
        if (data.startsWith("help_page_")) {
          const targetPage = parseInt(data.split("_")[2]);
          const newContent = generatePageContent(targetPage);

          try {
            await bot.editMessageCaption(newContent.text, {
              chat_id: callbackQuery.message.chat.id,
              message_id: callbackQuery.message.message_id,
              parse_mode: "Markdown",
              reply_markup: { inline_keyboard: newContent.keyboard }
            });
          } catch (e) {
            try {
              await bot.editMessageText(newContent.text, {
                chat_id: callbackQuery.message.chat.id,
                message_id: callbackQuery.message.message_id,
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: newContent.keyboard }
              });
            } catch (err) {}
          }
          await bot.answerCallbackQuery(callbackQuery.id);
        }
      });
    }
  }
};const fs = require("fs");
const path = require("path");
const https = require("https");
const config = require("../config");

function downloadGif(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject(new Error("GIF download failed"));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// ক্যাটাগরি অনুযায়ী মানানসই ইমোজি
const categoryEmojis = {
  system: "⚙️",
  admin: "🛠️",
  utility: "🧰",
  fun: "🎮",
  others: "📁",
  media: "🎬",
  adult: "🔥"
};

const categoryFont = (str) =>
  str.split("").map(c => {
    const map = {
      A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",
      I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",
      Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",
      Y:"𝐘",Z:"𝐙"
    };
    return map[c] || c;
  }).join("");

module.exports = {
  name: "help",
  aliases: ["commands", "cmdlist"],
  version: "7.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Show all commands with pagination",
  longDescription: "Interactive paginated command list UI with working buttons",
  category: "system",
  guide: "{pn} [command name]",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const prefix = config.prefix || "/";
    const allCommands = bot.commands;

    const BOT_USERNAME = config.botUsername || "SiyamSM_2026Bot";
    const OWNER_USERNAME = config.ownerUsername || "ri_siyam";

    if (args && args.length > 0) {
      const cmdName = args[0].toLowerCase();
      const cmd =
        allCommands.get(cmdName) ||
        [...allCommands.values()].find(c => c.aliases?.includes(cmdName));

      if (!cmd) {
        return bot.sendMessage(
          chatId,
          `❌ Command '${cmdName}' not found!\nType ${prefix}help to get commands list.`,
          { reply_to_message_id: messageId }
        );
      }

      const guideStr = cmd.guide || "{pn}";
      const usage = typeof guideStr === "string"
        ? guideStr.replace("{pn}", cmd.name)
        : cmd.name;

      const infoMsg =
`┏━━━━━━━━━━━━━┓
 🧩 𝐂𝐌𝐃 𝐈𝐍𝐅𝐎
┗━━━━━━━━━━━━━┛
 ✦ 𝐍𝐚𝐦𝐞    : ${cmd.name}
 ✦ 𝐀𝐥𝐢𝐚𝐬𝐞𝐬  : ${cmd.aliases?.join(", ") || "None"}
 ✦ 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲 : ${categoryFont((cmd.category || "Others").toUpperCase())}
 ✦ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧  : v${cmd.version || "1.0"}
 ✦ 𝐀𝐮𝐭𝐡𝐨𝐫   : ${cmd.author || "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍"}
 ✦ 𝐑𝐨𝐥𝐞    : ${cmd.role !== undefined ? cmd.role : 0}
 ✦ 𝐔𝐬𝐚𝐠𝐞    : ${prefix}${usage}
━━━━━━━━━━━━━━━
 📝 ${cmd.longDescription || cmd.shortDescription || "No description available."}`;

      return bot.sendMessage(chatId, infoMsg, {
        reply_to_message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
              { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
            ]
          ]
        }
      });
    }

    // সব কমান্ড একটি অ্যারেতে নেওয়া
    const commandList = [];
    if (allCommands) {
      for (const [name, cmd] of allCommands) {
        commandList.push({ name, category: cmd.category || "others" });
      }
    }

    const ITEMS_PER_PAGE = 4; // প্রতি পেজে ৪টি করে কমান্ড থাকবে
    const totalPages = Math.ceil(commandList.length / ITEMS_PER_PAGE) || 1;
    let currentPage = 0;

    const generatePageContent = (page) => {
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const currentItems = commandList.slice(start, end);

      let text = 
`┏━━━━━━━━━━━━━┓
 📜 𝐂𝐌𝐃 𝐇𝐔𝐁
┗━━━━━━━━━━━━━┛
 ✍️ 𝐀𝐮𝐭𝐡𝐨𝐫   : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
 🏷️ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧  : v7.0
 🔧 𝐏𝐫𝐞𝐟𝐢𝐱    : ${prefix} | 📊 Total: ${commandList.length}
 📄 𝐏𝐚𝐠𝐞     : ${page + 1} / ${totalPages}
━━━━━━━━━━━━━━━\n`;

      const keyboard = [];

      currentItems.forEach((item) => {
        const emoji = categoryEmojis[item.category.toLowerCase()] || "📌";
        text += `\n${emoji} ➥ \`${prefix}${item.name}\` (${item.category.toUpperCase()})`;
        
        // প্রতিটি কমান্ডের নিজস্ব ক্লিকযোগ্য বাটন (যা সরাসরি কমান্ড রান বা চ্যাটে পাঠাবে)
        keyboard.push([
          { text: `${emoji} ${prefix}${item.name}`, callback_data: `run_${item.name}` }
        ]);
      });

      // পেজিনেশন নেক্সট এবং ব্যাক বাটন
      const paginationRow = [];
      if (page > 0) {
        paginationRow.push({ text: "⬅️ 𝐁𝐀𝐂𝐊", callback_data: `help_page_${page - 1}` });
      }
      if (page < totalPages - 1) {
        paginationRow.push({ text: "➡️ 𝐍𝐄𝐗𝐓", callback_data: `help_page_${page + 1}` });
      }

      if (paginationRow.length > 0) {
        keyboard.push(paginationRow);
      }

      // পার্মানেন্ট ওনার ও গ্রুপ বাটন
      keyboard.push([
        { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
        { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
      ]);

      return { text, keyboard };
    };

    const { text: msgText, keyboard: inlineKeyboard } = generatePageContent(currentPage);

    const gifURLs = [
      "https://i.imgur.com/Xw6JTfn.gif",
      "https://i.imgur.com/mW0yjZb.gif"
    ];
    const randomGifURL = gifURLs[Math.floor(Math.random() * gifURLs.length)];
    const gifFolder = path.join(__dirname, "..", "cache");

    if (!fs.existsSync(gifFolder)) fs.mkdirSync(gifFolder, { recursive: true });
    const gifPath = path.join(gifFolder, path.basename(randomGifURL));

    let sentMessage;
    try {
      if (!fs.existsSync(gifPath)) {
        await downloadGif(randomGifURL, gifPath);
      }
      sentMessage = await bot.sendAnimation(chatId, gifPath, {
        caption: msgText,
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
        reply_markup: { inline_keyboard: inlineKeyboard }
      });
    } catch (err) {
      sentMessage = await bot.sendMessage(chatId, msgText, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
        reply_markup: { inline_keyboard: inlineKeyboard }
      });
    }

    // বাটন কাজ করার জন্য মেইন কলব্যাক লিসেনার (Callback Query Handler)
    if (bot.listenerCount("callback_query") === 0) {
      bot.on("callback_query", async (callbackQuery) => {
        const data = callbackQuery.data;
        const qMsg = callbackQuery.message;

        if (data.startsWith("help_page_")) {
          const targetPage = parseInt(data.split("_")[2]);
          const newContent = generatePageContent(targetPage);

          try {
            await bot.editMessageCaption(newContent.text, {
              chat_id: qMsg.chat.id,
              message_id: qMsg.message_id,
              parse_mode: "Markdown",
              reply_markup: { inline_keyboard: newContent.keyboard }
            });
          } catch (e) {
            // যদি অ্যানিমেশন না থাকে শুধু টেক্সট এডিট করার জন্য
            try {
              await bot.editMessageText(newContent.text, {
                chat_id: qMsg.chat.id,
                message_id: qMsg.message_id,
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: newContent.keyboard }
              });
            } catch (err) {}
          }
          await bot.answerCallbackQuery(callbackQuery.id);
        } 
        else if (data.startsWith("run_")) {
          const cmdToRun = data.replace("run_", "");
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: `Running: ${prefix}${cmdToRun}`,
            show_alert: false
          });

          // কমান্ড অটো ট্রিগার করার সিমুলেশন (বট নিজে ওই কমান্ডের execute ফাংশন চালাবে)
          const targetCmd = allCommands.get(cmdToRun);
          if (targetCmd && typeof targetCmd.execute === "function") {
            const fakeMsg = {
              chat: qMsg.chat,
              message_id: qMsg.message_id,
              from: callbackQuery.from
            };
            targetCmd.execute(bot, fakeMsg, []);
          }
        }
      });
    }
  }
};
