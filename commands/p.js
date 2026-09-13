module.exports = {
  name: "p",
  version: "3.4",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝗔𝗦𝐀𝗡",
  role: 2,
  category: "Admin",
  shortDescription: "Approve or cancel pending group chats",
  guide: "p",

  langs: { 
    en: { 
      invalidNumber: "『 𝐄𝐑𝐑𝐎𝐑 』\n\n✦ %1 IS NOT A VALID NUMBER\n\n➤ OWNER: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪",
      cancelSuccess: "『 𝐂𝐀𝐍𝐂𝐄𝐋𝐋𝐄𝐃 』\n\n✦ REFUSED %1 CHAT(S)\n\n➤ OWNER: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪",
      approveSuccess: "『 𝐀𝐏𝐏𝐑𝐎𝐕𝐄𝐃 』\n\n✦ APPROVED %1 CHAT(S)\n\n➤ OWNER: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪",
      cantGetPendingList: "『 𝐄𝐑𝐑𝐎𝐑 』\n\n✦ UNABLE TO RETRIEVE PENDING LIST\n\n➤ OWNER: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪",
      returnListClean: "『 𝐏𝐄𝐍𝐃𝐈𝐍𝐆 』\n\n✦ NO PENDING CHATS FOUND\n\n➤ OWNER: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪",
      approveAllSuccess: "『 𝐀𝐏𝐏𝐑𝐎𝐕𝐄𝐃 𝐀𝐋𝐋 』\n\n✦ APPROVED ALL %1 CHATS\n\n➤ OWNER: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪"
    } 
  },

  onReply: async function ({ bot, msg, Reply, getLang }) {
    if (String(msg.from.id) !== String(Reply.author)) return;

    const chatId = msg.chat.id;
    const body = msg.text ? msg.text.toLowerCase() : "";
    const isAll = body === "-all";
    const isCancel = body.startsWith("c");
    const rawList = isAll ? Reply.pending.map((_, i) => i + 1) : body.replace(/^c\s*/, "").split(/\s+/);

    let count = 0;
    const approvedChats = [];

    for (const i of rawList) {
      const num = parseInt(i);
      if (!isAll && (isNaN(num) || num < 1 || num > Reply.pending.length)) {
        try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}
        return bot.sendMessage(chatId, getLang("invalidNumber", i));
      }

      const chatItem = Reply.pending[num - 1];
      if (chatItem) {
        approvedChats.push(chatItem.id);
        if (isCancel) {
          try {
            await bot.leaveChat(chatItem.id);
          } catch (e) {}
        } else {
          try {
            await bot.sendMessage(chatItem.id, "『 👑 𝐒𝐍𝐂-𝐁𝐎𝐓 』\n\n✦ Bot activated and approved successfully!\n\n➤ Owner: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪");
          } catch (e) {}
        }
        count++;
      }
    }

    if (global.telegramPendingChats) {
      global.telegramPendingChats = global.telegramPendingChats.filter(c => !approvedChats.includes(c.id));
    }

    try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}
    if (msg.reply_to_message) {
      try { await bot.deleteMessage(chatId, msg.reply_to_message.message_id); } catch (e) {}
    }

    const responseText = isAll ? getLang("approveAllSuccess", count)
      : isCancel ? getLang("cancelSuccess", count)
      : getLang("approveSuccess", count);

    return bot.sendMessage(chatId, responseText);
  },

  execute: async function (bot, msg, args) {
    const chatId = msg.chat.id;
    const commandName = "p";
    const getLang = (key, ...params) => {
      let str = this.langs.en[key] || key;
      params.forEach((val, idx) => {
        str = str.replace(new RegExp(`%${idx + 1}`, 'g'), val);
      });
      return str;
    };

    try {
      if (!global.telegramPendingChats) {
        global.telegramPendingChats = [];
      }

      const list = global.telegramPendingChats;

      if (!list.length)
        return bot.sendMessage(chatId, getLang("returnListClean"));

      let msgText = "『 𝐏𝐄𝐍𝐃𝐈𝐍𝐆 𝐋𝐈𝐒𝐓 』\n\n";
      list.forEach((g, i) => {
        msgText += `✦ ${i + 1}. ${g.title || g.id}\n`;
      });

      msgText += "\n› REPLY: 1 2 - APPROVE\n› REPLY: C 1 2 - CANCEL\n› REPLY: -ALL - APPROVE ALL\n\n➤ OWNER: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪";

      try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}

      return bot.sendMessage(chatId, msgText).then((info) => {
        if (!global.activeReplies) global.activeReplies = new Map();
        global.activeReplies.set(info.message_id, {
          commandName,
          author: String(msg.from.id),
          pending: list
        });
      });
    } catch {
      return bot.sendMessage(chatId, getLang("cantGetPendingList"));
    }
  }
};
