module.exports = {
  config: {
    name: "all",
    version: "1.2.1",
    author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    countDown: 5,
    role: 1,
    description: {
      en: "Mention all members in your group chat"
    },
    category: "box chat",
    guide: "{pn} [content | empty]"
  },

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const text = args.join(" ") || "Attention Everyone! 📢";

    try {
      // টেলিগ্রাম গ্রুপে সাধারণত এডমিন ছাড়া সবাইকার চ্যাট মেম্বার লিস্ট সরাসরি বটকে API থেকে দেয় না প্রাইভেসি পলিসির কারণে।
      // তাই টেলিগ্রামে @all কমান্ড সাধারণত একটি নোটিশ বা গ্রুপ মেম্বারদের উদ্দেশ্য করে পাঠানো হয়।
      await bot.sendMessage(chatId, `📢 **GROUP ANNOUNCEMENT**\n\n${text}\n\n👑 *By:* 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId
      });
    } catch (error) {
      console.error("All command error:", error);
      bot.sendMessage(chatId, "❌ সবাইকে মেনশন করতে সমস্যা হচ্ছে!", { reply_to_message_id: messageId });
    }
  }
};
