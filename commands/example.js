module.exports = {
  name: "example",
  aliases: ["ex"],
  version: "1.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Example command",
  category: "utility",
  guide: "{pn}",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "Hello World!");
  }
};
