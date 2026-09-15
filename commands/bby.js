const axios = require('axios');

const baseApiUrl = "https://noobs-api.top/dipto/baby";

async function handleCommand(bot, msg, args) {
  if (!bot || !msg) return;
  const chatId = msg.chat ? msg.chat.id : (msg.threadID || (msg.from ? msg.from.id : null));
  const messageId = msg.message_id || msg.messageID;
  const uid = msg.from ? msg.from.id : chatId;
  const input = (args && args.length > 0) ? args.join(" ").toLowerCase() : "";

  try {
    if (!input) {
      const ran = ["Bolo baby", "নিঝুম", "type help baby", "type /bby hi"];
      const randomText = ran[Math.floor(Math.random() * ran.length)];
      return bot.sendMessage(chatId, randomText, { reply_to_message_id: messageId });
    }

    if (input.startsWith("remove")) {
      const fina = input.replace("remove", "").trim();
      const res = await axios.get(`${baseApiUrl}?remove=${encodeURIComponent(fina)}&senderID=${uid}`);
      return bot.sendMessage(chatId, res.data.message || "Removed!", { reply_to_message_id: messageId });
    }

    if (input.startsWith("rm") && input.includes('-')) {
      const [fi, f] = input.replace("rm", "").trim().split(/\s*-\s*/);
      const res = await axios.get(`${baseApiUrl}?remove=${encodeURIComponent(fi)}&index=${f}`);
      return bot.sendMessage(chatId, res.data.message || "Removed!", { reply_to_message_id: messageId });
    }

    if (input.startsWith("list")) {
      const res = await axios.get(`${baseApiUrl}?list=all`);
      return bot.sendMessage(chatId, `❇️ Total Teach = ${res.data.length || 0}`, { reply_to_message_id: messageId });
    }

    if (input.startsWith("teach")) {
      if (input.startsWith("teach react")) {
        const content = input.replace("teach react", "").trim();
        const [text1, text2] = content.split(/\s*-\s*/);
        if (!text1 || !text2) {
          return bot.sendMessage(chatId, '❌ Format: /bby teach react [Message] - [react1], [react2]', { reply_to_message_id: messageId });
        }
        const res = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(text1)}&react=${encodeURIComponent(text2)}&senderID=${uid}`);
        return bot.sendMessage(chatId, res.data.message || "Taught successfully!", { reply_to_message_id: messageId });
      } else {
        const content = input.replace("teach", "").trim();
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

function parseParams(a, b, c) {
  let bot, msg, args;
  if (a && (a.bot || a.api)) {
    bot = a.bot || a.api;
    msg = a.msg || a.message || a.event;
    args = a.args || [];
  } else {
    bot = a;
    msg = b;
    args = c || [];
  }
  return { bot, msg, args };
}

module.exports = {
  config: {
    name: "bby",
    aliases: ["baby", "bbe", "babe", "sam"],
    version: "6.9.0",
    author: "dipto",
    role: 0,
    category: "chat",
    description: "better then all sim simi"
  },
  name: "bby",
  aliases: ["baby", "bbe", "babe", "sam"],

  execute: async function (a, b, c) {
    const { bot, msg, args } = parseParams(a, b, c);
    return handleCommand(bot, msg, args);
  },

  onStart: async function (a, b, c) {
    const { bot, msg, args } = parseParams(a, b, c);
    return handleCommand(bot, msg, args);
  },

  run: async function (a, b, c) {
    const { bot, msg, args } = parseParams(a, b, c);
    return handleCommand(bot, msg, args);
  }
};
