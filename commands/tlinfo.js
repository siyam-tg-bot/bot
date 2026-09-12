const AUTHOR = "UDAY HASAN SIYAM";

module.exports = {
  config: {
    name: "fbinfo",
    aliases: ["tl"],
    version: "1.2",
    author: AUTHOR + " (DO NOT CHANGE)",
    role: 0,
    shortDescription: "Telegram user info",
    longDescription: "Get Telegram user info safely",
    category: "info",
    guide: "{pn} reply | @username | user_id"
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (!this.config.author.includes(AUTHOR)) {
      return bot.sendMessage(chatId, "❌ Author name changed! Command locked.", {
        reply_to_message_id: messageId
      });
    }

    try {
      let targetUser = msg.from;

      if (msg.reply_to_message && msg.reply_to_message.from) {
        targetUser = msg.reply_to_message.from;
      } else if (args && args[0]) {
        const query = args[0].replace("@", "");
        try {
          const fetchedChat = await bot.getChat(query.match(/^\d+$/) ? parseInt(query) : `@${query}`);
          targetUser = {
            id: fetchedChat.id,
            first_name: fetchedChat.first_name || "Unknown",
            last_name: fetchedChat.last_name || "",
            username: fetchedChat.username || null
          };
        } catch (e) {}
      }

      if (!targetUser) {
        return bot.sendMessage(chatId, "❌ User info not found", {
          reply_to_message_id: messageId
        });
      }

      const fullName = `${targetUser.first_name || ""} ${targetUser.last_name || ""}`.trim() || "Unknown";
      const usernameStr = targetUser.username ? `@${targetUser.username}` : "Not set";
      const profileLink = targetUser.username 
        ? `https://t.me/${targetUser.username}` 
        : `tg://user?id=${targetUser.id}`;

      const responseText = 
`📘 𝗜𝗡𝗙𝗢

╭───────────────⭓
│ 👤 𝗡𝗮𝗺𝗲
│ ${fullName}
│ 🆔 𝗨𝗜𝗗
│ ${targetUser.id}
│ 🌐 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲
│ ${usernameStr}
│ 🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲
│ ${profileLink}

╰───────────────⭓
╭─❖
│ 👑𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
│ 🫶 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗩𝗶𝗯𝗲☠️
╰──────────────⭓`;

      return bot.sendMessage(chatId, responseText, {
        reply_to_message_id: messageId
      });

    } catch (err) {
      console.log(err);
      return bot.sendMessage(chatId, "⚠️ Error: fbinfo command failed", {
        reply_to_message_id: messageId
      });
    }
  }
};
