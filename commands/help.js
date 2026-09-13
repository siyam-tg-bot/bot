const fs = require('fs');
const path = require('path');
const config = require('../config');

const COMMANDS_PER_PAGE = 15;

function getSortedCommands() {
  const commandsDir = path.join(__dirname);
  const privateDir = path.join(__dirname, '..', 'private');
  
  let cmdSet = new Set();
  
  [commandsDir, privateDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach(file => {
        if (file.endsWith('.js')) {
          try {
            const filePath = path.join(dir, file);
            const cmd = require(filePath);
            const name = cmd.name || (cmd.config && cmd.config.name);
            if (name) {
              cmdSet.add(name.toLowerCase());
            }
          } catch (e) {}
        }
      });
    }
  });

  return Array.from(cmdSet).sort();
}

function generateHelpPage(page, botUsername) {
  const commands = getSortedCommands();
  const totalCommands = commands.length;
  const totalPages = Math.ceil(totalCommands / COMMANDS_PER_PAGE) || 1;
  
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * COMMANDS_PER_PAGE;
  const currentCmds = commands.slice(startIndex, startIndex + COMMANDS_PER_PAGE);

  let text = `━━━━❪👤❫━━━━\n`;
  currentCmds.forEach((cmd, index) => {
    const num = startIndex + index + 1;
    text += `┣⊸ ${num} ✿ /${cmd}\n`;
  });
  text += `━━━━❪👤❫━━━━\n\n`;
  text += `🌿 ★ ESB-BOT ★\n`;
  text += `Page: ${currentPage}/${totalPages} | Total Cmd: [ ${totalCommands} ]\n`;
  text += `Dev: ESB-TEAM`;

  const keyboard = [];
  
  // পেজিনেশন রো
  const navRow = [];
  if (currentPage > 1) {
    navRow.text = "◀️ Prev";
    navRow.callback_data = `help_page_${currentPage - 1}`;
  } else {
    navRow.text = "⏹️";
    navRow.callback_data = "help_noop";
  }

  const pageInfoButton = { text: `${currentPage}/${totalPages}`, callback_data: "help_noop" };

  const nextButton = {};
  if (currentPage < totalPages) {
    nextButton.text = "Next ▶️";
    nextButton.callback_data = `help_page_${currentPage + 1}`;
  } else {
    nextButton.text = "⏹️";
    nextButton.callback_data = "help_noop";
  }

  keyboard.push([navRow, pageInfoButton, nextButton]);

  
  let cmdRow = [];
  currentCmds.forEach((cmd, idx) => {
    cmdRow.push({
      text: `/${cmd}`,
      
      switch_inline_query_current_chat: `/${cmd}`
    });
    if (cmdRow.length === 2 || idx === currentCmds.length - 1) {
      keyboard.push(cmdRow);
      cmdRow = [];
    }
  });
  
  keyboard.push([
    { text: "❌ Close", callback_data: "help_close" }
  ]);

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

module.exports = {
  name: "help",
  aliases: ["commands", "menu", "start"],
  version: "2.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝗔𝗦𝗔𝗡",
  role: 0,
  category: "general",
  shortDescription: "Interactive command help menu",
  guide: "help",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let botUsername = "SiyamSM_2026Bot";
    try {
      const me = await bot.getMe();
      botUsername = me.username;
    } catch (e) {}

    const { text, reply_markup } = generateHelpPage(1, botUsername);

    return bot.sendMessage(chatId, text, {
      reply_to_message_id: messageId,
      reply_markup: reply_markup
    });
  },

  handleCallback: async (bot, query) => {
    const data = query.data;
    if (!data.startsWith("help_")) return;

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    let botUsername = "SiyamSM_2026Bot";
    try {
      const me = await bot.getMe();
      botUsername = me.username;
    } catch (e) {}

    if (data === "help_close") {
      try {
        await bot.deleteMessage(chatId, messageId);
      } catch (e) {}
      return bot.answerCallbackQuery(query.id, { text: "Menu closed." });
    }

    if (data === "help_noop") {
      return bot.answerCallbackQuery(query.id);
    }

    if (data.startsWith("help_page_")) {
      const page = parseInt(data.replace("help_page_", "")) || 1;
      const { text, reply_markup } = generateHelpPage(page, botUsername);

      try {
        await bot.editMessageText(text, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: reply_markup
        });
      } catch (e) {}

      return bot.answerCallbackQuery(query.id);
    }
  }
};
