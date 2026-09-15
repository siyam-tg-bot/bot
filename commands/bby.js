const axios = require('axios');

const baseApiUrl = "https://noobs-api.top/dipto/baby";

module.exports = {
  name: "bby",
  aliases: ["baby", "bbe", "babe", "sam"],
  version: "6.9.0",
  author: "dipto",
  role: 0,
  category: "chat",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const uid = msg.from ? msg.from.id : chatId;
    const input = args.join(" ").toLowerCase();

    try {
      if (!args[0]) {
        const ran = ["Bolo baby", "নিঝুম", "type help baby", "type /bby hi"];
        const randomText = ran[Math.floor(Math.random() * ran.length)];
        return bot.sendMessage(chatId, randomText, { reply_to_message_id: messageId });
      }

      if (args[0] === 'remove') {
        const fina = input.replace("remove ", "");
        const res = await axios.get(`${baseApiUrl}?remove=${encodeURIComponent(fina)}&senderID=${uid}`);
        return bot.sendMessage(chatId, res.data.message || "Removed!", { reply_to_message_id: messageId });
      }

      if (args[0] === 'rm' && input.includes('-')) {
        const [fi, f] = input.replace("rm ", "").split(/\s*-\s*/);
        const res = await axios.get(`${baseApiUrl}?remove=${encodeURIComponent(fi)}&index=${f}`);
        return bot.sendMessage(chatId, res.data.message || "Removed!", { reply_to_message_id: messageId });
      }

      if (args[0] === 'list') {
        const res = await axios.get(`${baseApiUrl}?list=all`);
        return bot.sendMessage(chatId, `❇️ Total Teach = ${res.data.length || 0}`, { reply_to_message_id: messageId });
      }

      if (args[0] === 'teach') {
        if (args[1] === 'react') {
          const content = input.replace("teach react ", "");
          const [text1, text2] = content.split(/\s*-\s*/);
          if (!text1 || !text2) {
            return bot.sendMessage(chatId, '❌ Format: /bby teach react [Message] - [react1], [react2]', { reply_to_message_id: messageId });
          }
          const res = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(text1)}&react=${encodeURIComponent(text2)}&senderID=${uid}`);
          return bot.sendMessage(chatId, res.data.message || "Taught successfully!", { reply_to_message_id: messageId });
        } else {
          const content = input.replace("teach ", "");
          const [text1, text2] = content.split(/\s*-\s*/);
          if (!text1 || !text2) {
            return bot.sendMessage(chatId, '❌ Format: /bby teach [Message] - [Reply1], [Reply2]', { reply_to_message_id: messageId });
          }
          const res = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(text1)}&reply=${encodeURIComponent(text2)}&senderID=${uid}`);
          return bot.sendMessage(chatId, res.data.message || "Taught successfully!", { reply_to_message_id: messageId });
        }
      }

      const res = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(input)}&senderID=${uid}`);
      const replyText = res.data.reply || res.data.message || "আমি বুঝতে পারিনি সিয়াম ভাই!";
      return bot.sendMessage(chatId, replyText, { reply_to_message_id: messageId });

    } catch (err) {
      console.error("BBY Error:", err.message);
      return bot.sendMessage(chatId, "❌ সিয়াম ভাই, এপিআই সাড়া দিচ্ছে না!", { reply_to_message_id: messageId });
    }
  }
};
