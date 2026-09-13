const config = require("../config");

module.exports = {
  name: "eval",
  version: "1.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 2,
  category: "admin",
  shortDescription: "Evaluate javascript code",
  longDescription: "Run JS code directly from telegram",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const code = args.join(" ");

    if (!code) {
      return bot.sendMessage(chatId, "⚠️ কোড প্রদান করুন!", { reply_to_message_id: messageId });
    }

    try {
      let evaled = eval(code);
      if (typeof evaled !== "string") {
        evaled = require("util").inspect(evaled);
      }
      return bot.sendMessage(chatId, `📥 Input:\n\`\`\`js\n${code}\n\`\`\`\n📤 Output:\n\`\`\`js\n${evaled}\n\`\`\``, {
        reply_to_message_id: messageId,
        parse_mode: "Markdown"
      });
    } catch (err) {
      return bot.sendMessage(chatId, `❌ Error:\n\`\`\`js\n${err.message}\n\`\`\``, {
        reply_to_message_id: messageId,
        parse_mode: "Markdown"
      });
    }
  }
};
