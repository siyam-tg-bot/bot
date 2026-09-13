module.exports = (bot) => {
  bot.on('message', async (msg) => {
    try {
      if (!msg || !msg.reply_to_message || !global.activeReplies) return;
      const replyId = msg.reply_to_message.message_id;
      if (global.activeReplies.has(replyId)) {
        const session = global.activeReplies.get(replyId);
        const cmdModule = bot.commands.get(session.commandName) || bot.commands.get(bot.aliases.get(session.commandName));
        if (cmdModule && typeof cmdModule.onReply === 'function') {
          const getLang = (key, ...args) => {
            if (cmdModule.langs && cmdModule.langs.en && cmdModule.langs.en[key]) {
              let str = cmdModule.langs.en[key];
              args.forEach((val, idx) => {
                str = str.replace(new RegExp(`%${idx + 1}`, 'g'), val);
              });
              return str;
            }
            return key;
          };
          await cmdModule.onReply({ bot, msg, Reply: session, getLang, commandName: session.commandName });
        }
      }
    } catch (err) {}
  });
};
