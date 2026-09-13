const database = require('../database');

module.exports = {
  name: "broadcast",
  aliases: ["bc", "announce"],
  version: "1.0.1",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝗔𝗦𝗔𝗡",
  role: 2,
  category: "admin",
  shortDescription: "Broadcasts a message to all saved chats or users in database",
  guide: "broadcast <message>",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const broadcastText = args.join(" ");

    await bot.sendMessage(chatId, "⚙️ 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 𝗠𝗢𝗗𝗨𝗟𝗘 𝗜𝗦 𝗔𝗖𝗧𝗜𝗩𝗘 𝗔𝗡𝗗 𝗥𝗨𝗡𝗡𝗜𝗡𝗚...", { reply_to_message_id: messageId });

    if (!broadcastText) {
      return bot.sendMessage(chatId, "⚠️ 𝗣𝗟𝗘𝗔𝗦𝗘 𝗣𝗥𝗢𝗩𝗜𝗗𝗘 𝗔 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 𝗧𝗢 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧.", { reply_to_message_id: messageId });
    }

    const db = database.getData();
    const users = db.users || {};
    const userIds = Object.keys(users);

    if (userIds.length === 0) {
      return bot.sendMessage(chatId, "⚠️ 𝗡𝗢 𝗨𝗦𝗘𝗥 𝗥𝗘𝗖𝗢𝗥𝗗𝗦 𝗙𝗢𝗨𝗡𝗗 𝗜𝗡 𝗧𝗛𝗘 𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘!", { reply_to_message_id: messageId });
    }

    let successCount = 0;
    let failCount = 0;

    const statusMsg = await bot.sendMessage(chatId, `📢 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 𝗦𝗧𝗔𝗥𝗧𝗘𝗗... 𝗧𝗢𝗧𝗔𝗟 𝗧𝗔𝗥𝗚𝗘𝗧𝗦: ${userIds.length} 𝗨𝗦𝗘𝗥𝗦.`, { reply_to_message_id: messageId });

    for (const userId of userIds) {
      try {
        await bot.sendMessage(userId, `📢 𝗔𝗗𝗠𝗜𝗡 𝗔𝗡𝗡𝗢𝗨𝗡𝗖𝗘𝗠𝗘𝗡𝗧\n───────────────\n${broadcastText}\n───────────────`);
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    return bot.editMessageText(`✅ 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬!\n───────────────\n» 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟: ${successCount}\n» 𝗙𝗔𝗜𝗟𝗘𝗗: ${failCount}`, {
      chat_id: chatId,
      message_id: statusMsg.message_id
    });
  }
};
