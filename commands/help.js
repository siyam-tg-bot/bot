module.exports = {
  config: {
    name: "help",
    aliases: ["h", "cmds", "commands"],
    version: "1.0",
    author: "SIYAM",
    role: 0,
    countDown: 3,
    description: "Shows the list of all available commands"
  },

  onStart: async function ({ bot, msg, args, prefix }) {
    const chatId = msg.chat.id;
    const commands = bot.commands;

    if (!commands || commands.size === 0) {
      return bot.sendMessage(chatId, "⚠️ কোনো কমান্ড পাওয়া যায়নি!");
    }

    let commandList = [];
    let index = 1;

    // Duplicate command name skip করার জন্য Set ব্যবহার করা
    const uniqueCommands = new Set();

    commands.forEach((cmd, name) => {
      const cmdName = cmd.name || cmd.config?.name || name;
      if (!uniqueCommands.has(cmdName)) {
        uniqueCommands.add(cmdName);
        const description = cmd.description || cmd.config?.description || "No description available";
        commandList.push(`✨ **${index++}.** \`${prefix}${cmdName}\`\n   └ 📝 *${description}*`);
      }
    });

    const helpMessage = `
👑 **BOT COMMANDS LIST** 👑
───────────────
${commandList.join('\n\n')}
───────────────
💡 মোট কমান্ড সংখ্যা: **${uniqueCommands.size}** টি
📌 ব্যবহার করতে সামনে \`${prefix}\` ব্যবহার করুন।
`.trim();

    return bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
  }
};
