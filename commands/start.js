module.exports = {
  config: {
    name: "start",
    version: "1.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    shortDescription: "Start the bot",
    category: "system",
    guide: "/start"
  },

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || "User";

    const welcomeText = `✨ হ্যালো ${userName}! 🌸\n\n` +
      `🤖 আমি নিঝুম বট (NIJHUM BOT)।\n` +
      `👑 আমার মালিক: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n\n` +
      `📌 আমার সকল কমান্ড দেখতে /help বা মেনু ব্যবহার করুন।`;

    await bot.sendMessage(chatId, welcomeText, {
      reply_to_message_id: msg.message_id
    });
  }
};
