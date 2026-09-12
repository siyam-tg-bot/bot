module.exports = {
  config: {
    name: "example2",
    aliases: ["ex2"],
    role: 0,
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍"
  },
  onStart: async ({ bot, msg, args, role, prefix, commandName }) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "Hello World from onStart!");
  }
};
