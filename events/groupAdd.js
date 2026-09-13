const config = require('../config');

module.exports = (bot) => {
  bot.on('my_chat_member', async (update) => {
    try {
      const chat = update.chat;
      const newStatus = update.new_chat_member.status;
      const addedBy = update.from ? (update.from.first_name || "Unknown") : "Unknown";
      const username = update.from && update.from.username ? `@${update.from.username}` : "No username";

      if (['member', 'administrator'].includes(newStatus)) {
        if (!global.telegramPendingChats) global.telegramPendingChats = [];
        const exists = global.telegramPendingChats.some(c => c.id === chat.id);
        
        if (!exists) {
          global.telegramPendingChats.push({
            id: chat.id,
            title: chat.title || chat.username || 'PRIVATE GROUP'
          });
        }

        const welcomeText = 
`╭─❖〔 𝐒𝐍𝐂-𝐁𝐎𝐓 〕❖─╮
│ 🤖 𝐇𝐄𝐋𝐎 ${chat.title || 'GROUP'}...!
├─────────────────┤
│ ✅ 𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐟𝐨𝐫 𝐚𝐝𝐝𝐢𝐧𝐠 𝐦𝐞!
│
│ 👤 𝐀𝐝𝐝𝐞𝐝 𝐛𝐲: ${addedBy}
│ 📝 ${username}
│ 👑 𝐎𝐰𝐧𝐞𝐫: 𝐒𝐢𝐚𝐦 𝐇𝐚𝐬𝐚𝐧
│ ⚙️ 𝐏𝐫𝐞𝐟𝐢𝐱: ${config.prefix || '/'}
│ 💡 /help for all cmds
├────────────────┤
╰─❖〔 𝐒𝐍𝐂-𝐁𝐎𝐓 〕❖─╯`;

        await bot.sendMessage(chat.id, welcomeText);
      }
    } catch (err) {}
  });
};
