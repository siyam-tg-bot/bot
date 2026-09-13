const fs = require('fs');
const path = require('path');

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

module.exports = {
  name: "help",
  aliases: ["commands", "menu", "start"],
  version: "3.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝗔𝗦𝗔𝗡",
  role: 0,
  category: "general",
  shortDescription: "Displays all available commands",
  guide: "help",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const commands = getSortedCommands();
    const totalCommands = commands.length;

    let text = `━━━━❪👤❫━━━━\n`;
    commands.forEach((cmd, index) => {
      const num = index + 1;
      text += `┣⊸ ${num} ✿ /${cmd}\n`;
    });
    text += `━━━━❪👤❫━━━━\n\n`;
    text += `🌿 ★ 𝗘𝗦𝗕-𝗕𝗢𝗧 ★\n`;
    text += `𝗧𝗢𝗧𝗔𝗟 𝗖𝗠𝗗: [ ${totalCommands} ]\n`;
    text += `𝗗𝗘𝗩: 𝗘𝗦𝗕-𝗧𝗘𝗔𝗠`;

    return bot.sendMessage(chatId, text, {
      reply_to_message_id: messageId
    });
  }
};
