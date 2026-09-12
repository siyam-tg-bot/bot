const fs = require("fs-extra");

const LOCKED_AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

module.exports = {
  config: {
    name: "spy",
    version: "1.5.1",
    author: LOCKED_AUTHOR,
    role: 0,
    countDown: 5,
    shortDescription: "Deep dive into user stats",
    longDescription: "Fetch complete profile details including UID, balance, level, rank.",
    category: "utility",
    guide: "spy [@mention or reply]"
  },

  onStart: async function ({ bot, msg, args, usersData }) {
    if (module.exports.config.author !== LOCKED_AUTHOR) {
      module.exports.config.author = LOCKED_AUTHOR;
      try {
        fs.writeFileSync(__filename, fs.readFileSync(__filename, "utf8"));
      } catch (e) {}
    }

    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const requesterID = msg.from.id;

    let targetID = requesterID;
    let targetUser = msg.from;

    if (msg.reply_to_message) {
      targetID = msg.reply_to_message.from.id;
      targetUser = msg.reply_to_message.from;
    } else if (msg.entities) {
      const mentionEntity = msg.entities.find(e => e.type === "text_mention" || e.type === "mention");
      if (mentionEntity && mentionEntity.user) {
        targetID = mentionEntity.user.id;
        targetUser = mentionEntity.user;
      }
    }

    if (args[0]) {
      const numeric = /^\d+$/.test(args[0]) ? args[0] : null;
      if (numeric) {
        targetID = numeric;
        try {
          const chatMember = await bot.getChatMember(chatId, targetID);
          if (chatMember && chatMember.user) {
            targetUser = chatMember.user;
          }
        } catch (e) {}
      }
    }

    try {
      let userRecord = {};
      try {
        if (usersData && typeof usersData.get === "function") {
          userRecord = await usersData.get(targetID) || {};
        }
      } catch (e) {}

      let requesterRecord = {};
      try {
        if (usersData && typeof usersData.get === "function") {
          requesterRecord = await usersData.get(requesterID) || {};
        }
      } catch (e) {}

      const requesterName = requesterRecord.name || msg.from.first_name || "Friend";
      const fullName = `${targetUser.first_name || ""} ${targetUser.last_name || ""}`.trim() || "N/A";
      const username = targetUser.username ? `@${targetUser.username}` : "None";

      const balance = userRecord.money || 0;
      const xp = userRecord.exp || 0;
      const lvl = Math.floor(Math.sqrt(xp) * 0.1);
      const rank = "—";

      let avatarUrl = null;
      try {
        const photos = await bot.getUserProfilePhotos(targetID, { limit: 1 });
        if (photos && photos.total_count > 0) {
          const fileId = photos.photos[0][0].file_id;
          const file = await bot.getFile(fileId);
          avatarUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        }
      } catch (e) {}

      const cardMessage = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
🚀 𝐔𝐒𝐄𝐑 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐈𝐍𝐒𝐈𝐆𝐇𝐓

» 👤 𝐍𝐚𝐦𝐞 : ${fullName}
» 🌐 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 : ${username}
» 🆔 𝐔𝐈𝐃 : ${targetID}

» 💸 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 : $${balance}
» ⚡ 𝐗𝐏 : ${xp}
» 🎚️ 𝐋𝐞𝐯𝐞𝐥 : ${lvl}
» 🏅 𝐑𝐚𝐧𝐤 : ${rank}

» 🎁 𝐑𝐞 𝐛𝐲 : ${requesterName}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      if (avatarUrl) {
        await bot.sendPhoto(chatId, avatarUrl, {
          caption: cardMessage,
          reply_to_message_id: messageId
        });
      } else {
        await bot.sendMessage(chatId, cardMessage, {
          reply_to_message_id: messageId
        });
      }

    } catch (err) {
      bot.sendMessage(
        chatId,
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑!
» ⚠️ প্রফাইল ইনফরমেশন 
» ✅ লোড করতে ব্যর্থ হয়েছে।
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`,
        { reply_to_message_id: messageId }
      );
    }
  }
};
