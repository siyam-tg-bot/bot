const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot || { configCommands: { envGlobal: {}, envCommands: {} } };
const { log, loading, removeHomeDir } = global.utils || {
  log: { dev: console.log, master: console.log },
  loading: { info: () => {} },
  removeHomeDir: (p) => p
};

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
  config: {
    name: "cmd",
    version: "2.0.0",
    author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    countDown: 5,
    role: 2,
    description: {
      en: "Manage and install command files dynamically with Telegram buttons"
    },
    category: "admin",
    guide: {
      en: "   {pn} load <command file name>\n   {pn} loadAll\n   {pn} unload <command file name>\n   {pn} unloadAll\n   {pn} install <url/code> <filename.js>"
    }
  },

  onStart: async ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName }) => {
    const bot = api;
    const chatId = event.chat?.id || event.chatId || event.threadID;
    const messageId = event.message_id || event.messageID;
    const rawArgsText = Array.isArray(args) ? args.join(" ") : "";

    let botUsername = global.config?.botUsername || "SiyamSM_2026Bot";
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
          { text: "👑 𝐎𝐖𝐍𝗘𝗥", url: `https://t.me/${global.config?.ownerUsername || "ri_siyam"}` }
        ]
      ]
    };

    if (!args || args.length === 0) {
      const helpText = 
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

      return bot.sendMessage(chatId, helpText, {
        reply_to_message_id: messageId,
        reply_markup: defaultButtons
      });
    }

    const action = args[0].toLowerCase();

    if (action === "load" && args.length === 2) {
      const fileName = args[1];
      try {
        const infoLoad = loadScripts("cmds", fileName, log, configCommands, bot, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, (k, ...v) => k);
        if (infoLoad.status === "success") {
          return bot.sendMessage(chatId, `✅ সফলভাবে \`${infoLoad.name}.js\` কমান্ডটি লোড করা হয়েছে।`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
        } else {
          throw infoLoad.error;
        }
      } catch (err) {
        return bot.sendMessage(chatId, `❌ **${fileName} লোড করতে ব্যর্থ!**\n\n⚠️ **এরর বিবরণ:**\n\`\`\`javascript\n${err.message}\n\`\`\``, { reply_to_message_id: messageId, parse_mode: "Markdown" });
      }
    }
    else if (action === "loadall" || action === "load-all") {
      const files = fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith(".js") && file !== "cmd.js");
      let loadedCount = 0;
      let failedFiles = [];

      for (const file of files) {
        const fileName = file.replace(".js", "");
        const infoLoad = loadScripts("cmds", fileName, log, configCommands, bot, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, (k, ...v) => k);
        if (infoLoad.status === "success") {
          loadedCount++;
        } else {
          failedFiles.push({ file, error: infoLoad.error.message });
        }
      }

      let resMsg = 
`  𝗢𝗪𝗡𝗘𝗥 𝗦𝗜𝗬𝗔𝗠-𝗛𝗔𝗦𝗔𝗡
───────────────
» 📂 𝗧𝗢𝗧𝗔𝗟 𝗙𝗜𝗟𝗘𝗦: ${files.length}
» ✅ 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟: ${loadedCount}
» ❌ 𝗙𝗔𝗜𝗟𝗘𝗗: ${failedFiles.length}
» 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: @${botUsername}
───────────────\n`;

      if (failedFiles.length > 0) {
        resMsg += `⚠️ **ত্রুটিপূর্ণ ফাইলসমূহ:**\n`;
        failedFiles.forEach((item, idx) => {
          resMsg += `» ${idx + 1}. \`${item.file}\`\n   ┗ 🔴 ${item.error.substring(0, 60)}...\n`;
        });
      } else {
        resMsg += `» ✨ সকল কমান্ড ফাইল সফলভাবে লোড হয়েছে!\n`;
      }
      resMsg += `───────────────\n» 👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝗛𝗔𝗦𝗔𝗡 👑`;

      return bot.sendMessage(chatId, resMsg, {
        reply_to_message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: defaultButtons
      });
    }
    else if (action === "unload" && args[1]) {
      const fileName = args[1].replace(".js", "");
      try {
        unloadScripts("cmds", fileName, configCommands, (k, ...v) => k);
        return bot.sendMessage(chatId, `✅ \`${fileName}.js\` সফলভাবে আনলোড করা হয়েছে।`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
      } catch (err) {
        return bot.sendMessage(chatId, `❌ আনলোড করতে সমস্যা হয়েছে: ${err.message}`, { reply_to_message_id: messageId });
      }
    }
    else if (action === "unloadall" || action === "unload-all") {
      const { GoatBot } = global;
      let count = 0;
      if (GoatBot && GoatBot.commands) {
        for (const [cmdName, cmdObj] of GoatBot.commands) {
          if (cmdName === "cmd") continue;
          GoatBot.commands.delete(cmdName);
          count++;
        }
      }
      return bot.sendMessage(chatId, `✅ সফলভাবে মোট ${count} টি কমান্ড আনলোড করা হয়েছে।`, { reply_to_message_id: messageId });
    }
    else if (action === "install") {
      let url = args[1];
      let fileName = args[2];
      let rawCode = "";

      if (!url || !fileName) {
        return bot.sendMessage(chatId, "⚠️ সঠিক নিয়ম: `/cmd install <url/code> <filename.js>` অথবা `/cmd install <filename.js> <code>`", { reply_to_message_id: messageId });
      }

      if (url.endsWith(".js") && !isURL(url)) {
        const tmp = fileName;
        fileName = url;
        url = tmp;
      }

      let loadingMsg = await bot.sendMessage(chatId, "⏳ ফাইল যাচাই এবং ইনস্টল করা হচ্ছে...", { reply_to_message_id: messageId }).catch(() => {});

      try {
        if (url && isURL(url)) {
          if (!fileName || !fileName.endsWith(".js")) {
            if (loadingMsg) bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
            return bot.sendMessage(chatId, "⚠️ দয়া করে সঠিক ফাইলের নাম দিন (যেমন: `file.js`)", { reply_to_message_id: messageId });
          }

          let fetchUrl = url;
          const domain = getDomain(fetchUrl);

          if (domain === "pastebin.com") {
            const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
            if (fetchUrl.match(regex)) fetchUrl = fetchUrl.replace(regex, "https://pastebin.com/raw/$1");
            if (fetchUrl.endsWith("/")) fetchUrl = fetchUrl.slice(0, -1);
          } else if (domain === "github.com") {
            const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
            if (fetchUrl.match(regex)) fetchUrl = fetchUrl.replace(regex, "https://raw.githubusercontent.com/$1/$2");
          }

          const res = await axios.get(fetchUrl, { timeout: 15000 });
          rawCode = res.data;

          if (domain === "savetext.net") {
            const $ = cheerio.load(rawCode);
            rawCode = $("#content").text();
          }
        } else {
          if (args[args.length - 1].endsWith(".js")) {
            fileName = args[args.length - 1];
            rawCode = rawArgsText.slice(rawArgsText.indexOf('install') + 7, rawArgsText.indexOf(fileName)).trim();
          } else if (args[1].endsWith(".js")) {
            fileName = args[1];
            rawCode = rawArgsText.slice(rawArgsText.indexOf(fileName) + fileName.length).trim();
          } else {
            if (loadingMsg) bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
            return bot.sendMessage(chatId, "⚠️ ফাইলের নাম পাওয়া যায়নি (.js যুক্ত করুন)।", { reply_to_message_id: messageId });
          }
        }

        if (!rawCode) {
          if (loadingMsg) bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
          return bot.sendMessage(chatId, "⚠️ কোনো কোড বা বৈধ ইউআরএল পাওয়া যায়নি!", { reply_to_message_id: messageId });
        }

        const cleanFileName = fileName.replace(".js", "");
        const filePath = path.join(COMMANDS_DIR, `${cleanFileName}.js`);

        fs.writeFileSync(filePath, rawCode, "utf8");

        const infoLoad = loadScripts("cmds", cleanFileName, log, configCommands, bot, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, (k, ...v) => k);

        if (loadingMsg) bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

        if (infoLoad.status === "success") {
          const successMsg = 
`  𝗢𝗪𝗡𝗘𝗥 𝗦𝗜𝗬𝗔𝗠-𝗛𝗔𝗦𝗔𝗡
───────────────
» ✅ 𝗙𝗜𝗟𝗘 𝗜𝗡𝗦𝗧𝗔𝗟𝗟𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬!
» 📁 𝗙𝗜𝗟𝗘: ${fileName}
» ⚙️ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗: ${infoLoad.command?.config?.name || cleanFileName}
» 🤖 𝗕𝗢𝗧: @${botUsername}
───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝗔𝗦𝗔𝗡 👑`;

          return bot.sendMessage(chatId, successMsg, {
            reply_to_message_id: messageId,
            reply_markup: defaultButtons
          });
        } else {
          throw infoLoad.error;
        }

      } catch (err) {
        let targetFile = fileName ? (fileName.endsWith(".js") ? fileName : `${fileName}.js`) : "";
        if (targetFile) {
          const badPath = path.join(COMMANDS_DIR, targetFile);
          if (fs.existsSync(badPath)) {
            fs.unlinkSync(badPath);
          }
        }

        if (loadingMsg) bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

        let errorType = "Unknown Error";
        if (err instanceof SyntaxError) errorType = "🔴 Syntax Error (কোডে সিনট্যাক্স ভুল আছে)";
        else if (err.code === "MODULE_NOT_FOUND") errorType = "📦 Missing Module (প্রয়োজনীয় প্যাকেজ ইনস্টল করা নেই)";

        const errorMsg = 
`❌ **ফাইল ইনস্টল বা লোড করতে ব্যর্থ হয়েছে!**

📌 **ফাইল:** \`${fileName || "Unknown"}\`
🛠 **ত্রুটির ধরন:** ${errorType}
⚠️ **বিস্তারিত এরর:**
\`\`\`javascript
${err.message}
\`\`\`
*নোট: ত্রুটির কারণে ফাইলটি স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়েছে।*`;

        return bot.sendMessage(chatId, errorMsg, {
          reply_to_message_id: messageId,
          parse_mode: "Markdown"
        });
      }
    } else {
      return bot.sendMessage(chatId, "⚠️ ভুল কমান্ড ফরম্যাট! সাহায্য পেতে শুধু `/cmd` লিখুন।", { reply_to_message_id: messageId });
    }
  },

  onCallbackQuery: async ({ bot, query }) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    let botUsername = global.config?.botUsername || "SiyamSM_2026Bot";
    try {
      const me = await bot.getMe();
      botUsername = me.username;
    } catch (e) {}

    if (data === "cmd_loadall") {
      await bot.answerCallbackQuery(query.id, { text: "⏳ Reloading all commands..." }).catch(() => {});
      const files = fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith(".js") && file !== "cmd.js");
      let loadedCount = 0;
      for (const file of files) {
        try {
          const fileName = file.replace(".js", "");
          loadScripts("cmds", fileName, log, configCommands, bot, null, null, null, null, null, null, null, null, (k) => k);
          loadedCount++;
        } catch (e) {}
      }
      return bot.editMessageText(`✅ সফলভাবে মোট ${loadedCount} টি ফাইল রিলোড করা হয়েছে!`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 Back", callback_data: "cmd_main" }]]
        }
      });
    }

    if (data === "cmd_list") {
      await bot.answerCallbackQuery(query.id, { text: "📂 Loading Command List..." }).catch(() => {});
      const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith(".js"));
      const fileButtons = files.map(file => [
        { text: `⚙️ ${file.replace(".js", "")}`, callback_data: `cmd_manage_${file}` }
      ]);
      fileButtons.push([{ text: "🔙 Back", callback_data: "cmd_main" }]);

      return bot.editMessageText("📂 *আপনার বটের সকল কমান্ড ফাইল তালিকা:*", {
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
          { text: "🔄 Reload", callback_data: `cmd_reload_${fileName}` },
          { text: "❌ Unload", callback_data: `cmd_unload_${fileName}` }
        ],
        [
          { text: "🔙 Back to List", callback_data: "cmd_list" }
        ]
      ];
      return bot.editMessageText(`📁 *Selected File:* \`${fileName}\`\nনিচের অপশনগুলো থেকে নির্বাচন করুন:`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: manageButtons }
      });
    }

    if (data.startsWith("cmd_reload_")) {
      const fileName = data.replace("cmd_reload_", "").replace(".js", "");
      await bot.answerCallbackQuery(query.id, { text: `Reloading ${fileName}...` }).catch(() => {});
      try {
        loadScripts("cmds", fileName, log, configCommands, bot, null, null, null, null, null, null, null, null, (k) => k);
        return bot.editMessageText(`✅ \`${fileName}.js\` সফলভাবে রিলোড হয়েছে!`, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "🔙 Back to List", callback_data: "cmd_list" }]] }
        });
      } catch (err) {
        return bot.editMessageText(`❌ রিলোড করতে সমস্যা:\n\`\`\`javascript\n${err.message}\n\`\`\``, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "🔙 Back to List", callback_data: "cmd_list" }]] }
        });
      }
    }

    if (data.startsWith("cmd_unload_")) {
      const fileName = data.replace("cmd_unload_", "").replace(".js", "");
      await bot.answerCallbackQuery(query.id, { text: `Unloading ${fileName}...` }).catch(() => {});
      try {
        unloadScripts("cmds", fileName, configCommands, (k) => k);
        return bot.editMessageText(`✅ \`${fileName}.js\` সফলভাবে আনলোড হয়েছে!`, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: { inline_keyboard: [[{ text: "🔙 Back to List", callback_data: "cmd_list" }]] }
        });
      } catch (err) {
        return bot.editMessageText(`❌ আনলোড করতে সমস্যা: ${err.message}`, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: { inline_keyboard: [[{ text: "🔙 Back to List", callback_data: "cmd_list" }]] }
        });
      }
    }

    if (data === "cmd_main") {
      const mainText = 
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

      return bot.editMessageText(mainText, {
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
              { text: "👑 𝐎𝐖𝐍𝗘𝗥", url: `https://t.me/${global.config?.ownerUsername || "ri_siyam"}` }
            ]
          ]
        }
      });
    }
  }
};

const packageAlready = [];
const spinner = "\\|/-";
let count = 0;

function loadScripts(folder, fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode) {
  try {
    const regExpCheckPackage = /require(\s+|)\((\s+|)[`'"]([^`'"]+)[`'"](\s+|)\)/g;
    const GoatBot = global.GoatBot || { commands: new Map(), aliases: new Map(), onChat: [], onFirstChat: [], onEvent: [], onAnyEvent: [] };
    let setMap = "commands";

    let pathCommand = path.normalize(process.cwd() + `/scripts/${folder}/${fileName}.js`);

    if (fs.existsSync(pathCommand)) {
      const contentFile = fs.readFileSync(pathCommand, "utf8");
      let allPackage = contentFile.match(regExpCheckPackage);
      if (allPackage) {
        allPackage = allPackage
          .map(p => p.match(/[`'"]([^`'"]+)[`'"]/)[1])
          .filter(p => p.indexOf("/") !== 0 && p.indexOf("./") !== 0 && p.indexOf("../") !== 0);
        for (let packageName of allPackage) {
          if (packageName.startsWith('@')) packageName = packageName.split('/').slice(0, 2).join('/');
          else packageName = packageName.split('/')[0];

          if (!packageAlready.includes(packageName)) {
            packageAlready.push(packageName);
            if (!fs.existsSync(`${process.cwd()}/node_modules/${packageName}`)) {
              let wating;
              try {
                wating = setInterval(() => {
                  count++;
                  loading.info("PACKAGE", `Installing ${packageName} ${spinner[count % spinner.length]}`);
                }, 80);
                execSync(`npm install ${packageName} --save`, { stdio: "pipe" });
                clearInterval(wating);
              } catch (error) {
                clearInterval(wating);
                throw new Error(`Can't install package ${packageName}`);
              }
            }
          }
        }
      }
    }

    if (require.cache[require.resolve(pathCommand)]) {
      delete require.cache[require.resolve(pathCommand)];
    }

    const command = require(pathCommand);
    command.location = pathCommand;
    const configCommand = command.config;
    if (!configCommand || typeof configCommand != "object") throw new Error("config of command must be an object");

    const scriptName = configCommand.name;
    if (!scriptName) throw new Error('Name of command is missing!');

    if (configCommand.aliases) {
      let { aliases } = configCommand;
      if (typeof aliases == "string") aliases = [aliases];
      for (const alias of aliases) {
        GoatBot.aliases.set(alias, scriptName);
      }
    }

    if (command.onLoad) {
      command.onLoad({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData });
    }

    if (!command.onStart) throw new Error('Function onStart is missing!');

    GoatBot[setMap].set(scriptName, command);

    return {
      status: "success",
      name: fileName,
      command
    };
  } catch (err) {
    return {
      status: "failed",
      name: fileName,
      error: err
    };
  }
}

function unloadScripts(folder, fileName, configCommands, getLang) {
  const pathCommand = `${process.cwd()}/scripts/${folder}/${fileName}.js`;
  if (!fs.existsSync(pathCommand)) {
    throw new Error(`Command file "${fileName}.js" not found`);
  }
  const command = require(pathCommand);
  const commandName = command.config?.name || fileName;
  const GoatBot = global.GoatBot || { commands: new Map(), aliases: new Map() };
  
  if (command.config?.aliases) {
    let aliases = command.config.aliases;
    if (typeof aliases == "string") aliases = [aliases];
    for (const alias of aliases) GoatBot.aliases.delete(alias);
  }

  if (require.cache[require.resolve(pathCommand)]) {
    delete require.cache[require.resolve(pathCommand)];
  }
  
  GoatBot.commands.delete(commandName);
  return { status: "success", name: fileName };
}

global.utils.loadScripts = loadScripts;
global.utils.unloadScripts = unloadScripts;
