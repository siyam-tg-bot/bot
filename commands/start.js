const fs = require("fs");
const path = require("path");

const startTime = Date.now();
const registeredBots = new WeakSet();

function getUptime() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;

  return `${days}𝐝 ${hours}𝐡 ${minutes}𝐦 ${seconds}𝐬`;
}

/* =========================
   FIND COMMAND DIRECTORY
========================= */

function findCommandFolder() {
  const possible = [
    path.join(process.cwd(), "commands"),
    path.join(process.cwd(), "command"),
    path.join(process.cwd(), "Commands"),
    path.join(process.cwd(), "Command"),
    path.join(__dirname, "..", "commands"),
    path.join(__dirname, "..", "command")
  ];

  for (const dir of possible) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      return dir;
    }
  }

  return null;
}

/* =========================
   LOAD ALL COMMANDS
========================= */

function getAllCommands() {
  const commandDir = findCommandFolder();

  if (!commandDir) {
    return [];
  }

  const result = [];

  function scanDirectory(dir) {
    let files = [];

    try {
      files = fs.readdirSync(dir);
    } catch {
      return;
    }

    for (const file of files) {
      const fullPath = path.join(dir, file);

      let stat;

      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
        continue;
      }

      if (!file.endsWith(".js")) continue;

      // Don't load this file again
      if (fullPath === __filename) continue;

      try {
        delete require.cache[require.resolve(fullPath)];

        const command = require(fullPath);

        if (!command || !command.config) continue;

        const config = command.config;

        if (!config.name) continue;

        result.push({
          name: config.name,
          category: config.category || "other",
          description:
            config.shortDescription ||
            config.description ||
            "𝐍𝐨 𝐝𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧",
          aliases: Array.isArray(config.aliases)
            ? config.aliases
            : []
        });

      } catch (error) {
        console.log(
          `⚠️ Could not load command: ${file}`
        );
      }
    }
  }

  scanDirectory(commandDir);

  return result;
}

/* =========================
   CATEGORY LIST
========================= */

function getCategories() {
  const commands = getAllCommands();

  const categories = {};

  for (const command of commands) {
    const category =
      String(command.category || "other")
        .trim()
        .toUpperCase();

    if (!categories[category]) {
      categories[category] = [];
    }

    categories[category].push(command);
  }

  return categories;
}

/* =========================
   HELP CATEGORY MENU
========================= */

function createHelpMenu(page = 0) {
  const categories = getCategories();

  const categoryNames = Object.keys(categories).sort();

  if (!categoryNames.length) {
    return {
      text:
`╭━━━━━━━━━━━━━━━━━━╮
┃     📚 𝐇𝐄𝐋𝐏 𝐌𝐄𝐍𝐔
╰━━━━━━━━━━━━━━━━━━━╯

❌ 𝐍𝐨 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐟𝐨𝐮𝐧𝐝.

📁 𝐌𝐚𝐤𝐞 𝐬𝐮𝐫𝐞 𝐲𝐨𝐮𝐫 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐟𝐢𝐥𝐞𝐬 𝐚𝐫𝐞 𝐢𝐧 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐟𝐨𝐥𝐝𝐞𝐫.`,
      keyboard: [
        [
          {
            text: "🔙 𝐁𝐀𝐂𝐊",
            callback_data: "start_back"
          }
        ]
      ]
    };
  }

  const perPage = 6;
  const totalPages = Math.ceil(categoryNames.length / perPage);

  page = Math.max(0, Math.min(page, totalPages - 1));

  const start = page * perPage;
  const currentCategories = categoryNames.slice(
    start,
    start + perPage
  );

  let text =
`╭━━━━━━━━━━━━━━━━━━━╮
┃     📚 𝐇𝐄𝐋𝐏 𝐌𝐄𝐍𝐔
┃       𝐏𝐀𝐆𝐄 ${page + 1}/${totalPages}
╰━━━━━━━━━━━━━━━━━━━╯

🤖 𝐍𝐈𝐉𝐇𝐔𝐌 𝐁𝐎𝐓 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒

✨ 𝐒𝐞𝐥𝐞𝐜𝐭 𝐚 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲:

`;

  const keyboard = [];

  for (let i = 0; i < currentCategories.length; i += 2) {
    const row = [];

    const category1 = currentCategories[i];

    row.push({
      text: `📂 ${category1}`,
      callback_data: `cat_${encodeURIComponent(category1)}`
    });

    if (currentCategories[i + 1]) {
      const category2 = currentCategories[i + 1];

      row.push({
        text: `📂 ${category2}`,
        callback_data: `cat_${encodeURIComponent(category2)}`
      });
    }

    keyboard.push(row);
  }

  const navigation = [];

  if (page > 0) {
    navigation.push({
      text: "◀️ 𝐏𝐑𝐄𝐕",
      callback_data: `help_page_${page - 1}`
    });
  }

  navigation.push({
    text: `📄 ${page + 1}/${totalPages}`,
    callback_data: "no_action"
  });

  if (page < totalPages - 1) {
    navigation.push({
      text: "𝐍𝐄𝐗𝐓 ▶️",
      callback_data: `help_page_${page + 1}`
    });
  }

  keyboard.push(navigation);

  keyboard.push([
    {
      text: "🔙 𝐁𝐀𝐂𝐊",
      callback_data: "start_back"
    }
  ]);

  return { text, keyboard };
}

/* =========================
   CATEGORY COMMAND MENU
========================= */

function createCategoryMenu(category) {
  const categories = getCategories();

  const commands = categories[category] || [];

  let text =
`╭━━━━━━━━━━━━━━━━━━╮
┃     📂 ${category}
╰━━━━━━━━━━━━━━━━━━━╯

`;

  if (!commands.length) {
    text += "❌ 𝐍𝐨 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐟𝐨𝐮𝐧𝐝.";
  } else {
    commands.forEach((command, index) => {
      text +=
        `${index + 1}. /${command.name}\n` +
        `   └─ ${command.description}\n`;

      if (command.aliases.length) {
        text +=
          `   └─ 𝐀𝐥𝐢𝐚𝐬𝐞𝐬: ${command.aliases
            .map(a => "/" + a)
            .join(", ")}\n`;
      }

      text += "\n";
    });
  }

  text +=
`━━━━━━━━━━━━━━━━━━━━
💡 𝐔𝐬𝐞 /${commands[0]?.name || "start"} 𝐭𝐨 𝐫𝐮𝐧 𝐚 𝐜𝐨𝐦𝐦𝐚𝐧𝐝.`;

  return {
    text,
    keyboard: [
      [
        {
          text: "🔙 𝐁𝐀𝐂𝐊 𝐓𝐎 𝐇𝐄𝐋𝐏",
          callback_data: "help_page_0"
        }
      ],
      [
        {
          text: "🏠 𝐇𝐎𝐌𝐄",
          callback_data: "start_back"
        }
      ]
    ]
  };
}

/* =========================
   START MENU
========================= */

function createStartMenu(msg) {
  const user = msg.from || {};

  const userName = user.first_name || "𝐔𝐬𝐞𝐫";
  const userId = user.id || "𝐍𝐨𝐧𝐞";

  const username = user.username
    ? `@${user.username}`
    : "𝐍𝐨 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞";

  const now = new Date();

  const date = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka"
  });

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Dhaka"
  });

  const memory = Math.round(
    process.memoryUsage().rss / 1024 / 1024
  );

  return {
    text: `
╭━━━━━━━━━━━━━━━━━━╮
┃   💎 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎
┃    🤖 𝐍𝐈𝐉𝐇𝐔𝐌 𝐁𝐎𝐓
╰━━━━━━━━━━━━━━━━━━╯

🌸 𝐇𝐞𝐥𝐥𝐨, ${userName}!
✨ 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐍𝐢𝐣𝐡𝐮𝐦 𝐁𝐨𝐭.

╭━〔 👤 𝐔𝐒𝐄𝐑 〕━╮
┃ 🆔 𝐈𝐃 : ${userId}
┃ 👤 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 : ${username}
╰━━━━━━━━━━━━━╯

╭━〔 🤖 𝐁𝐎𝐓 〕━╮
┃ 🟢 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐎𝐧𝐥𝐢𝐧𝐞
┃ ⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞 : ${getUptime()}
┃ 🧠 𝐌𝐞𝐦𝐨𝐫𝐲 : ${memory} 𝐌𝐁
╰━━━━━━━━━━━━━╯

╭━〔 📅 𝐒𝐘𝐒𝐓𝐄𝐌 〕━╮
┃ 📆 𝐃𝐚𝐭𝐞 : ${date}
┃ ⏰ 𝐓𝐢𝐦𝐞 : ${time}
┃ 🌐 𝐙𝐨𝐧𝐞 : 𝐀𝐬𝐢𝐚/𝐃𝐡𝐚𝐤𝐚
╰━━━━━━━━━━━━━━╯

💫 𝐘𝐨𝐮𝐫 𝐏𝐞𝐫𝐬𝐨𝐧𝐚𝐥 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 𝐀𝐬𝐬𝐢𝐬𝐭𝐚𝐧𝐭.

╭━━━━━━━━━━━━━━━━━╮
┃ 👑 𝐎𝐰𝐧𝐞𝐫 : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
┃ 💎 𝐍𝐢𝐣𝐡𝐮𝐦 𝐁𝐨𝐭 𝐏𝐫𝐞𝐦𝐢𝐮𝐦
╰━━━━━━━━━━━━━━━━━╯
`,
    keyboard: [
      [
        {
          text: "📚 𝐇𝐄𝐋𝐏",
          callback_data: "help_page_0"
        },
        {
          text: "⚡ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒",
          callback_data: "help_page_0"
        }
      ],
      [
        {
          text: "👑 𝐎𝐖𝐍𝐄𝐑",
          url: "https://t.me/ri_siyam"
        },
        {
          text: "➕ 𝐀𝐃𝐃 𝐁𝐎𝐓",
          url: "https://t.me/SiyamTgBot?startgroup=true"
        }
      ],
      [
        {
          text: "🔄 𝐑𝐄𝐅𝐑𝐄𝐒𝐇",
          callback_data: "refresh_start"
        }
      ]
    ]
  };
}

/* =========================
   CALLBACK HANDLER
========================= */

function registerCallbacks(bot) {
  if (registeredBots.has(bot)) return;

  registeredBots.add(bot);

  bot.on("callback_query", async (query) => {
    try {
      const data = query.data;
      const message = query.message;

      if (!message) return;

      const chatId = message.chat.id;
      const messageId = message.message_id;

      // Stop button spinner
      await bot.answerCallbackQuery(query.id);

      /* ---------- HELP PAGE ---------- */

      if (data.startsWith("help_page_")) {
        const page = parseInt(
          data.replace("help_page_", ""),
          10
        );

        const menu = createHelpMenu(
          Number.isNaN(page) ? 0 : page
        );

        await bot.editMessageText(menu.text, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: menu.keyboard
          }
        });

        return;
      }

      /* ---------- CATEGORY ---------- */

      if (data.startsWith("cat_")) {
        const category = decodeURIComponent(
          data.replace("cat_", "")
        );

        const menu = createCategoryMenu(category);

        await bot.editMessageText(menu.text, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: menu.keyboard
          }
        });

        return;
      }

      /* ---------- BACK TO START ---------- */

      if (data === "start_back") {
        const fakeMsg = {
          chat: message.chat,
          from: query.from
        };

        const menu = createStartMenu(fakeMsg);

        await bot.editMessageText(menu.text, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: menu.keyboard
          }
        });

        return;
      }

      /* ---------- REFRESH ---------- */

      if (data === "refresh_start") {
        const fakeMsg = {
          chat: message.chat,
          from: query.from
        };

        const menu = createStartMenu(fakeMsg);

        await bot.editMessageText(menu.text, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: menu.keyboard
          }
        });

        return;
      }

      /* ---------- IGNORE ---------- */

      if (data === "no_action") {
        return;
      }

    } catch (error) {
      console.error(
        "CALLBACK ERROR:",
        error.message
      );
    }
  });
}

/* =========================
   EXPORT COMMAND
========================= */

module.exports = {

  config: {
    name: "start",
    version: "5.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    shortDescription: "Premium start menu",
    category: "system",
    guide: "/start"
  },

  execute: async (bot, msg) => {

    // Register callback system
    registerCallbacks(bot);

    const menu = createStartMenu(msg);

    await bot.sendMessage(
      msg.chat.id,
      menu.text,
      {
        reply_to_message_id: msg.message_id,

        reply_markup: {
          inline_keyboard: menu.keyboard
        }
      }
    );
  }
};
