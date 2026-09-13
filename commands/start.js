const startTime = Date.now();

function getUptime() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;

  return `${days}𝐝 ${hours}𝐡 ${minutes}𝐦 ${seconds}𝐬`;
}

module.exports = {
  config: {
    name: "start",
    version: "4.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    shortDescription: "Premium start menu",
    category: "system",
    guide: "/start"
  },

  execute: async (bot, msg) => {
    try {
      const chatId = msg.chat.id;
      const user = msg.from || {};

      const userName = user.first_name || "𝐔𝐬𝐞𝐫";
      const userId = user.id || "𝐍𝐨𝐧𝐞";

      const username = user.username
        ? `@${user.username}`
        : "𝐍𝐨 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞";

      const now = new Date();

      const date = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dhaka"
      });

      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Dhaka"
      });

      const uptime = getUptime();

      const memory = Math.round(
        process.memoryUsage().rss / 1024 / 1024
      );

      const welcomeText = `
╭━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     💎 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎
┃       🤖 𝐍𝐈𝐉𝐇𝐔𝐌 𝐁𝐎𝐓
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

🌸 𝐇𝐞𝐥𝐥𝐨, ${userName}!
✨ 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐍𝐢𝐣𝐡𝐮𝐦 𝐁𝐨𝐭.

╭━━━〔 👤 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎 〕━━━╮
┃ 🆔 𝐔𝐬𝐞𝐫 𝐈𝐃 : ${userId}
┃ 👤 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 : ${username}
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🤖 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎 〕━━━╮
┃ ⚡ 𝐒𝐭𝐚𝐭𝐮𝐬 : 🟢 𝐎𝐧𝐥𝐢𝐧𝐞
┃ ⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞 : ${uptime}
┃ 🧠 𝐌𝐞𝐦𝐨𝐫𝐲 : ${memory} 𝐌𝐁
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 📅 𝐒𝐘𝐒𝐓𝐄𝐌 〕━━━╮
┃ 📆 𝐃𝐚𝐭𝐞 : ${date}
┃ ⏰ 𝐓𝐢𝐦𝐞 : ${time}
┃ 🌐 𝐙𝐨𝐧𝐞 : 𝐀𝐬𝐢𝐚/𝐃𝐡𝐚𝐤𝐚
╰━━━━━━━━━━━━━━━━━━━━━━╯

💫 𝐘𝐨𝐮𝐫 𝐏𝐞𝐫𝐬𝐨𝐧𝐚𝐥 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 𝐀𝐬𝐬𝐢𝐬𝐭𝐚𝐧𝐭.

📚 𝐂𝐡𝐨𝐨𝐬𝐞 𝐚𝐧 𝐨𝐩𝐭𝐢𝐨𝐧 𝐛𝐞𝐥𝐨𝐰 𝐭𝐨 𝐞𝐱𝐩𝐥𝐨𝐫𝐞 𝐍𝐢𝐣𝐡𝐮𝐦 𝐁𝐨𝐭.

╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 👑 𝐎𝐰𝐧𝐞𝐫 : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
┃ 💎 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 𝐁𝐨𝐭
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

      await bot.sendMessage(chatId, welcomeText, {
        reply_to_message_id: msg.message_id,

        reply_markup: {
          inline_keyboard: [

            // HELP / COMMANDS
            [
              {
                text: "📚 𝐇𝐄𝐋𝐏",
                url: "https://t.me/SiyamTgBot?start=help"
              },
              {
                text: "⚡ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒",
                url: "https://t.me/SiyamTgBot?start=commands"
              }
            ],

            // OWNER / ADD BOT
            [
              {
                text: "👑 𝐎𝐖𝐍𝐄𝐑",
                url: "https://t.me/ri_siyam"
              },
              {
                text: "➕ 𝐀𝐃𝐃 𝐁𝐎𝐓",
                url: "https://t.me/SiyamTgBot?startgroup=true"
              }
            ],

            // REFRESH / HELP COMMAND
            [
              {
                text: "🔄 𝐑𝐄𝐅𝐑𝐄𝐒𝐇",
                callback_data: "start"
              }
            ]
          ]
        }
      });

    } catch (error) {
      console.error("START COMMAND ERROR:", error);

      try {
        await bot.sendMessage(
          msg.chat.id,
          "❌ 𝐒𝐨𝐫𝐫𝐲! 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝."
        );
      } catch (e) {
        console.error("ERROR MESSAGE FAILED:", e);
      }
    }
  }
};
