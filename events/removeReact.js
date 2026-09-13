module.exports = (bot) => {
  bot.on('message_reaction', async (reaction) => {
    try {
      if (!reaction || !reaction.chat || !reaction.message_id) return;

      const chatId = reaction.chat.id;
      const messageId = reaction.message_id;
      
      const newReaction = reaction.new_reaction || [];

      const targetEmojis = ['❤️', '🔥', '👍'];

      const hasTargetEmoji = newReaction.some(r => 
        r.type === 'emoji' && targetEmojis.includes(r.emoji)
      );

      if (hasTargetEmoji) {
        await bot.deleteMessage(chatId, messageId);
      }
    } catch (err) {}
  });
};
