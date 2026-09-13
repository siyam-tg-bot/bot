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

module.exports = {
  name: "help",
  aliases: ["commands", "cmdlist"],
  version: "6.7",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Show all commands",
  longDescription: "Interactive command list UI with instant clickable trigger buttons",
  category: "system",
  guide: "{pn} [command name]",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const prefix = config.prefix || "/";
    const allCommands = bot.commands;

    const BOT_USERNAME = config.botUsername || "SiyamSM_2026Bot";
    const OWNER_USERNAME = config.ownerUsername || "ri_siyam";

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

    const categoryEmojis = {
      system: "⚙️",
      admin: "🛠️",
      utility: "🧰",
      fun: "🎮",
      others: "📁"
    };

    if (args && args.length > 0) {
      const cmdName = args[0].toLowerCase();
      const cmd =
        allCommands.get(cmdName) ||
        [...allCommands.values()].find(c => c.aliases?.includes(cmdName));

      if (!cmd) {
        return bot.sendMessage(
          chatId,
          `❌ Command '${cmdName}' not found!\nType ${prefix}help to get system commands list.`,
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
 📝 ${cmd.longDescription || cmd.shortDescription || "No detailed description available."}`;

      const singleReplyMarkup = {
        inline_keyboard: [
          [
            { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
            { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
          ]
        ]
      };

      return bot.sendMessage(chatId, infoMsg, {
        reply_to_message_id: messageId,
        reply_markup: singleReplyMarkup
      });
    }

    const categories = {};

    if (allCommands) {
      for (const [name, cmd] of allCommands) {
        const cat = cmd.category ? cmd.category.toLowerCase() : "others";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      }
    }

    let msgText =
`┏━━━━━━━━━━━━━┓
 📜 𝐂𝐌𝐃 𝐇𝐔𝐁
┗━━━━━━━━━━━━━┛
 ✍️ 𝐀𝐮𝐭𝐡𝐨𝐫   : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
 🏷️ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧  : v6.7
 🔧 𝐏𝐫𝐞𝐟𝐢𝐱    : ${prefix} | ${allCommands ? allCommands.size : 0} Total Commands
━━━━━━━━━━━━━━━
💡 *নিচের যেকোনো কমান্ডের বাটনে ক্লিক করলেই সেটি সাথে সাথে রান বা ট্রিগার হয়ে যাবে!*`;

    // ডাইনামিক ইনলাইন বাটন তৈরি (প্রতিটি কমান্ডের জন্য একটি করে ক্লিকযোগ্য বাটন যা ট্রিগার করবে)
    const inlineKeyboardRows = [];

    for (const cat of Object.keys(categories)) {
      const emoji = categoryEmojis[cat] || "📁";
      const catTitle = `${emoji} 『 ${categoryFont(cat.toUpperCase())} 』`;
      
      // ক্যাটাগরি হেডার টেক্সট হিসেবে যোগ করার জন্য
      msgText += `\n\n${catTitle}\n`;

      const sortedCmds = categories[cat].sort();
      let row = [];

      for (const c of sortedCmds) {
        // প্রতিটি কমান্ডের জন্য একটি বাটন তৈরি করা হচ্ছে যার ডাটা হলো `cmd_ট্রিগার_নাম`
        row.push({
          text: `${prefix}${c}`,
          callback_data: `run_cmd_${c}`
        });

        // প্রতি লাইনে ২টি বাটন করে সাজানোর জন্য
        if (row.length === 2) {
          inlineKeyboardRows.push(row);
          row = [];
        }
      }

      if (row.length > 0) {
        inlineKeyboardRows.push(row);
      }
    }

    // স্থায়ী বট ও ওনার লিংক বাটন নিচে যুক্ত করা হলো
    inlineKeyboardRows.push([
      { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
      { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
    ]);

    const finalReplyMarkup = {
      inline_keyboard: inlineKeyboardRows
    };

    const gifURLs = [
      "https://i.imgur.com/Xw6JTfn.gif",
      "https://i.imgur.com/mW0yjZb.gif"
    ];

    const randomGifURL = gifURLs[Math.floor(Math.random() * gifURLs.length)];
    const gifFolder = path.join(__dirname, "..", "cache");

    if (!fs.existsSync(gifFolder)) fs.mkdirSync(gifFolder, { recursive: true });

    const gifPath = path.join(gifFolder, path.basename(randomGifURL));

    try {
      if (!fs.existsSync(gifPath)) {
        await downloadGif(randomGifURL, gifPath);
      }
      return await bot.sendAnimation(chatId, gifPath, {
        caption: msgText,
        reply_to_message_id: messageId,
        reply_markup: finalReplyMarkup
      });
    } catch (err) {
      return await bot.sendMessage(chatId, msgText, {
        reply_to_message_id: messageId,
        reply_markup: finalReplyMarkup
      });
    }
  }
};
