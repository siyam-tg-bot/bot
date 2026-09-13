const config = require('../config');

function isOwnerOrAdmin(userId) {
  const idStr = String(userId);
  if (idStr === String(config.ownerID) || (config.adminIDs && config.adminIDs.map(String).includes(idStr))) return true;
  return false;
}

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

  bot.on('message', async (msg) => {
    try {
      if (!msg || !msg.chat || !msg.reply_to_message || !msg.from) return;

      const userId = msg.from.id;
      if (!isOwnerOrAdmin(userId)) return;

      const text = msg.text ? msg.text.trim().toLowerCase() : '';
      const allowedTriggers = ['ক', 'a', 'r', 's', 'ডিলিট করো', 'rj'];

      const shouldDelete = allowedTriggers.some(trigger => text.includes(trigger));

      if (shouldDelete) {
        const chatId = msg.chat.id;
        const replyMessageId = msg.reply_to_message.message_id;

        await bot.deleteMessage(chatId, replyMessageId);
        await bot.deleteMessage(chatId, msg.message_id);
      }
    } catch (err) {}
  });
};
