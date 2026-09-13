module.exports = {
  name: "welcome",

  execute: async (bot, msg) => {
    try {
      // নতুন member না হলে কিছু করবে না
      if (!msg.new_chat_members || !msg.new_chat_members.length) return;

      const chat = msg.chat;

      // Bot নিজে join করলে welcome করবে না
      for (const user of msg.new_chat_members) {
        if (user.is_bot) continue;

        const firstName = user.first_name || "Friend";
        const lastName = user.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim();

        const username = user.username
          ? `@${user.username}`
          : "Username নেই";

        let memberCount = "Unknown";

        try {
          memberCount = await bot.getChatMemberCount(chat.id);
        } catch (e) {
          memberCount = "Unknown";
        }

        const welcomeText = `
╭━━━━━━━━━━━━━━━━━━━━╮
      ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
╰━━━━━━━━━━━━━━━━━━━━╯

👋 𝐇𝐞𝐥𝐥𝐨, <b>${escapeHtml(fullName)}</b>!

🌸 <b>𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐓𝐨 𝐓𝐡𝐞 𝐆𝐫𝐨𝐮𝐩</b> 🌸

🏠 <b>𝐆𝐫𝐨𝐮𝐩:</b>
『 ${escapeHtml(chat.title || "Our Group")} 』

👤 <b>𝐍𝐚𝐦𝐞:</b> ${escapeHtml(fullName)}
🔗 <b>𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞:</b> ${escapeHtml(username)}
🆔 <b>𝐔𝐬𝐞𝐫 𝐈𝐃:</b> <code>${user.id}</code>

👥 <b>𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬:</b> ${memberCount}

━━━━━━━━━━━━━━━━━━━━

💎 <b>𝐖𝐞'𝐫𝐞 𝐕𝐞𝐫𝐲 𝐇𝐚𝐩𝐩𝐲 𝐓𝐨 𝐇𝐚𝐯𝐞 𝐘𝐨𝐮!</b>

📜 𝐏𝐥𝐞𝐚𝐬𝐞 𝐑𝐞𝐚𝐝 𝐓𝐡𝐞 𝐆𝐫𝐨𝐮𝐩 𝐑𝐮𝐥𝐞𝐬
🤝 𝐑𝐞𝐬𝐩𝐞𝐜𝐭 𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞
🚫 𝐍𝐨 𝐒𝐩𝐚𝐦
🔗 𝐍𝐨 𝐔𝐧𝐰𝐚𝐧𝐭𝐞𝐝 𝐋𝐢𝐧𝐤𝐬

━━━━━━━━━━━━━━━━━━━━

🤖 <b>𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲</b>
『 <b>𝐍𝐈𝐉𝐇𝐔𝐌 𝐁𝐎𝐓</b> 』

👑 <b>𝐎𝐰𝐧𝐞𝐫:</b> @ri_siyam

╰━━━━━━━━━━━━━━━━━━━━╯
        💫 𝐄𝐧𝐣𝐨𝐲 𝐘𝐨𝐮𝐫 𝐒𝐭𝐚𝐲! 💫
`;

        await bot.sendMessage(chat.id, welcomeText, {
          parse_mode: "HTML",
          reply_to_message_id: msg.message_id,

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
                  text: "🤖 𝐍𝐈𝐉𝐇𝐔𝐌 𝐁𝐎𝐓",
                  url: "https://t.me/SiyamTgBot"
                }
              ]
            ]
          }
        });
      }

    } catch (error) {
      console.error("❌ Welcome Event Error:", error);
    }
  }
};


// HTML নিরাপদ রাখার জন্য
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
                }
