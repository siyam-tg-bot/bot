module.exports = {
  config: {
    name: "welcome",
    aliases: ["wel", "greet"],
    version: "1.0.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    category: "group",
    shortDescription: "Premium welcome message"
  },

  execute: async (bot, msg) => {
    try {
      if (!msg.new_chat_members || msg.new_chat_members.length === 0) return;

      const chat = msg.chat;
      const members = msg.new_chat_members;

      for (const user of members) {
        const name = user.first_name || "Friend";
        const username = user.username
          ? `@${user.username}`
          : "No Username";

        let memberCount = "Unknown";

        try {
          memberCount = await bot.getChatMemberCount(chat.id);
        } catch (e) {}

        const welcome = `
╭━━━━━━━━━━━━━━━━━╮
   ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
╰━━━━━━━━━━━━━━━━━╯

👋 𝐇𝐞𝐥𝐥𝐨, **${name}**!

💎 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐓𝐨
『 **${chat.title || "Our Group"}** 』

👤 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞: ${username}
🆔 𝐈𝐃: \`${user.id}\`
👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${memberCount}

🌸 𝐖𝐞'𝐫𝐞 𝐆𝐥𝐚𝐝 𝐓𝐨 𝐇𝐚𝐯𝐞 𝐘𝐨𝐮!
📜 𝐏𝐥𝐞𝐚𝐬𝐞 𝐅𝐨𝐥𝐥𝐨𝐰 𝐓𝐡𝐞 𝐆𝐫𝐨𝐮𝐩 𝐑𝐮𝐥𝐞𝐬.

🤖 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲
『 𝐍𝐈𝐉𝐇𝐔𝐌 𝐁𝐎𝐓 』
👑 𝐎𝐰𝐧𝐞𝐫: @ri_siyam

━━━━━━━━━━━━━━━━━━━━
💫 𝐇𝐚𝐯𝐞 𝐀 𝐆𝐫𝐞𝐚𝐭 𝐓𝐢𝐦𝐞! 💫
`;

        await bot.sendMessage(chat.id, welcome, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "📜 𝐑𝐔𝐋𝐄𝐒",
                  callback_data: "welcome_rules"
                },
                {
                  text: "👑 𝐎𝐖𝐍𝐄𝐑",
                  url: "https://t.me/ri_siyam"
                }
              ],
              [
                {
                  text: "🤖 𝐁𝐎𝐓",
                  url: "https://t.me/SiyamTgBot"
                }
              ]
            ]
          }
        });
      }
    } catch (error) {
      console.error("Welcome Error:", error);
    }
  }
};
