module.exports = {
  config: {
    name: "out",
    version: "2.0.1",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    countDown: 5,
    role: 2,
    shortDescription: "বটকে গ্রুপ থেকে বের করে দেওয়া",
    longDescription: "এই কমান্ডের মাধ্যমে বটকে বর্তমান বা নির্দিষ্ট গ্রুপ থেকে বের করে দেওয়া হয়।",
    category: "owner",
    guide: "{pn} [chatId (optional)]"
  },

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const targetChat = args[0] || chatId;

    // শুধুমাত্র ওনার বা নির্দিষ্ট রোলের জন্য চেক করতে পারেন (যদি আপনার রোল সিস্টেম থাকে)
    // Telegram এ group chat ছাড়ার জন্য bot.leaveChat ব্যবহার করা হয়

    const now = new Date();
    const date = now.toLocaleDateString("en-GB", {
      timeZone: "Asia/Dhaka"
    });

    const time = now.toLocaleTimeString("en-GB", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    const byeMessage = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 📅 ${date}
» ⏰ ${time}
───────────────
আমি 🤖 𝆠፝𝐍𝐈𝐉𝐇𝗨𝐌-𝐂𝐇𝐀𝐓-𝐁𝐎𝐓 🤖👋 আমাকে ব্যবহার করার জন্য ধন্যবাদ 😘 আলবিদা সবাই! আমি এখন গ্রুপ থেকে বের হচ্ছি...😞
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

    try {
      // প্রথমে গ্রুপে মেসেজ পাঠিয়ে তারপর গ্রুপ ছেড়ে দিবে
      await bot.sendMessage(targetChat, byeMessage);
      await bot.leaveChat(targetChat);
    } catch (error) {
      console.error("Out Command Error:", error);
      
      const errorMsg = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ বের হতে পারলাম না!
» 🛠️ কোনো সমস্যা হয়েছে বা বট চ্যাটের অ্যাডমিন নয়।
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      return bot.sendMessage(chatId, errorMsg, { reply_to_message_id: messageId });
    }
  }
};
