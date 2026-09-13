module.exports = (bot) => {
  bot.on('my_chat_member', (update) => {
    try {
      const chat = update.chat;
      const newStatus = update.new_chat_member.status;
      if (['member', 'administrator'].includes(newStatus)) {
        if (!global.telegramPendingChats) global.telegramPendingChats = [];
        const exists = global.telegramPendingChats.some(c => c.id === chat.id);
        if (!exists) {
          global.telegramPendingChats.push({
            id: chat.id,
            title: chat.title || chat.username || 'PRIVATE GROUP'
          });
        }
      }
    } catch (err) {}
  });
};
