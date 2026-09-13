const config = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "help",
  aliases: ["h", "cmds"],
  version: "2.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "system",
  shortDescription: "Shows list of all commands with buttons",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const totalCmds = bot.commands ? bot.commands.size : 0;
    const currentPrefix = config.prefix || "/";

    let categories = {};
    bot.commands.forEach((cmd, name) => {
      const cat = cmd.category || "general";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    });

    let text = `📜 𝗧𝗢𝗧𝗔𝗟 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦: ${totalCmds}\n⚙️ 𝗣𝗥𝗘𝗙𝗜𝗫: ${currentPrefix}\n\nনিচের ক্যাটাগরি বা বাটনগুলো ব্যবহার করুন:`;

    let inlineKeyboard = [];
    let row = [];

    Object.keys(categories).forEach((cat, index) => {
      row.push({ text: `📂 ${cat.toUpperCase()}`, callback_data: `help_cat_${cat}` });
      if (row.length === 2) {
        inlineKeyboard.push(row);
        row = [];
      }
    });
    if (row.length > 0) inlineKeyboard.push(row);

    inlineKeyboard.push([{ text: "🔄 RELOAD ALL", callback_data: "cmd_loadall" }]);

    return bot.sendMessage(chatId, text, {
      reply_to_message_id: messageId,
      reply_markup: { inline_keyboard: inlineKeyboard }
    });
  },

  onCallbackQuery: async function (bot, callbackQuery) {
    const data = callbackQuery.data;
    const qMsg = callbackQuery.message;
    if (!qMsg) return;

    if (data.startsWith("help_cat_")) {
      const catName = data.replace("help_cat_", "");
      let cmdList = [];

      bot.commands.forEach((cmd, name) => {
        if ((cmd.category || "general") === catName) {
          cmdList.push(`\`${config.prefix || "/"}${name}\``);
        }
      });

      await bot.answerCallbackQuery(callbackQuery.id, { text: `Loading ${catName} commands...` });
      return await bot.editMessageText(`📂 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗬: *${catName.toUpperCase()}*\n\n${cmdList.join(", ")}`, {
        chat_id: qMsg.chat.id,
        message_id: qMsg.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 BACK TO MENU", callback_data: "help_back" }]]
        }
      });
    }

    if (data === "help_back") {
      const totalCmds = bot.commands ? bot.commands.size : 0;
      let categories = {};
      bot.commands.forEach((cmd, name) => {
        const cat = cmd.category || "general";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      });

      let inlineKeyboard = [];
      let row = [];
      Object.keys(categories).forEach((cat) => {
        row.push({ text: `📂 ${cat.toUpperCase()}`, callback_data: `help_cat_${cat}` });
        if (row.length === 2) {
          inlineKeyboard.push(row);
          row = [];
        }
      });
      if (row.length > 0) inlineKeyboard.push(row);

      await bot.answerCallbackQuery(callbackQuery.id);
      return await bot.editMessageText(`📜 𝗧𝗢𝗧𝗔𝗟 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦: ${totalCmds}\n\nনিচের ক্যাটাগরিগুলো থেকে বেছে নিন:`, {
        chat_id: qMsg.chat.id,
        message_id: qMsg.message_id,
        reply_markup: { inline_keyboard: inlineKeyboard }
      });
    }
  }
};
