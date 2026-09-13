const fs = require("fs-extra");

const LOCKED_AUTHOR = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

module.exports = {
  config: {
    name: "boxinfo",
    aliases: ["🎁", "বক্সইনফো", "gc2"],
    version: "6.0.1",
    author: LOCKED_AUTHOR,
    countDown: 2,
    role: 0,
    shortDescription: "Get official text-only group info with real date & time",
    longDescription: "Fetch official group details including member count, admin count, real date & time in fast text format without images",
    category: "utility",
    guide: "{p}boxinfo"
  },

  execute: async (bot, msg, args) => {
    // Author Security Lock
    if (module.exports.config.author !== LOCKED_AUTHOR) {
      module.exports.config.author = LOCKED_AUTHOR;
      try {
        fs.writeFileSync(__filename, fs.readFileSync(__filename, "utf8"));
      } catch (e) {}
    }

    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    // গ্রুপ ছাড়া শুধু পার্সোনাল চ্যাটে (Private Chat) কমান্ড দিলে যেন এরর না দেয়
    if (msg.chat.type === "private") {
      return bot.sendMessage(chatId, "⚠️ এই কমান্ডটি শুধুমাত্র টেলিগ্রাম গ্রুপ চ্যাটে ব্যবহার করা যাবে!", {
        reply_to_message_id: messageId
      });
    }

    try {
      // টেলিগ্রাম থেকে গ্রুপের তথ্য ও অ্যাডমিন লিস্ট ফেচ করা
      const chatInfo = await bot.getChat(chatId);
      const memberCount = await bot.getChatMemberCount(chatId);
      const admins = await bot.getChatAdministrators(chatId);
      
      const groupName = chatInfo.title || "নাম নাই ☹️";
      const adminCount = admins ? admins.length : 0;
      const description = chatInfo.description || "কোনো বিবরণ নেই";

      // Real Time & Date Calculation (Bangladesh Time Zone)
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
      const dateStr = now.toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric" });

      return bot.sendMessage(chatId, 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
📊 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
» 🏷️ 𝐆𝐫𝐨𝐮𝐩 𝐍𝐚𝐦𝐞 : ${groupName}
» 🆔 𝐂𝐡𝐚𝐭 𝐈𝐃 : 
» 🆔 ${chatId}
» 👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 : ${memberCount} জন
» 👑 𝐀𝐝𝐦𝐢𝐧𝐬 : ${adminCount} জন
» 📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧 : ${description}
» ⏰ 𝐓𝐢𝐦𝐞 : ${timeStr}
» 📅 𝐃𝐚𝐭𝐞 : ${dateStr}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`, {
        reply_to_message_id: messageId
      });

    } catch (err) {
      console.error("Boxinfo Error:", err);
      return bot.sendMessage(chatId, 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑!
» ⚠️ গ্রুপ ইনফরমেশন 
» 🫢 লোড করতে ব্যর্থ হয়েছে।
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`, {
        reply_to_message_id: messageId
      });
    }
  }
};
