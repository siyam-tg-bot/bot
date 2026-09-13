module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.0.1",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Fun inbox message command"
    },
    longDescription: {
      en: "Sends a fun message in group and tries to send a private message to the user."
    },
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const messageId = msg.message_id;

    try {
      // গ্রুপে বা চ্যাটে রিপ্লাই মেসেজ পাঠানো
      await bot.sendMessage(
        chatId, 
        "✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐌𝐒𝐆\n\n🙃জানু তোমার ইনবক্স চেক করো , দেখো প্রপোজ করেছি,🐸🫣", 
        { reply_to_message_id: messageId }
      );

      // ইউজারের ইনবক্সে (Private Chat) মেসেজ পাঠানোর চেষ্টা
      try {
        await bot.sendMessage(
          userId, 
          "✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐀𝐋𝗟𝐎𝐖\n😁 জানু ইনবক্স এ আসতে বললে কেনো ,কি বলবে বলো 🙂"
        );
      } catch (err) {
        // যদি ইউজার বটকে আগে স্টার্ট না করে থাকে, তবে ইনবক্সে পাঠাতে পারবে না
        console.log("Could not send private message to user: Telegram restriction.");
      }

    } catch (error) {
      console.error("Error bro: " + error);
    }
  }
};
