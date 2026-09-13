const userCooldown = new Map();

module.exports = (bot) => {
  bot.on('message', async (msg) => {
    if (!msg || !msg.chat || !msg.from) return;
    if (msg.chat.type === 'private') return;

    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const currentTime = Date.now();

    if (!userCooldown.has(chatId)) {
      userCooldown.set(chatId, new Map());
    }

    const chatMap = userCooldown.get(chatId);
    const lastTime = chatMap.get(userId) || 0;

    if (currentTime - lastTime < 1500) { 
      try {
        await bot.deleteMessage(chatId, msg.message_id);
      } catch (e) {}
      return;
    }

    chatMap.set(userId, currentTime);
  });
};
