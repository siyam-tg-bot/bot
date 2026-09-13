const fs = require("fs-extra");
const path = require("path");

// টেলিগ্রামে বটের যুক্ত থাকা গ্রুপগুলো ট্র্যাক করার জন্য লোকাল ফাইল বা মেমোরি
const activeGroupsFile = path.join(__dirname, "cache", "active_groups.json");

function getActiveGroups() {
  try {
    if (fs.existsSync(activeGroupsFile)) {
      return fs.readJsonSync(activeGroupsFile);
    }
  } catch (e) {}
  return {};
}

function saveActiveGroup(chatId, title) {
  try {
    const groups = getActiveGroups();
    groups[chatId] = { title, id: chatId };
    fs.ensureDirSync(path.dirname(activeGroupsFile));
    fs.writeJsonSync(activeGroupsFile, groups);
  } catch (e) {}
}

module.exports = {
  config: {
    name: "allgroup",
    aliases: ["allgc"],
    version: "2.0.1",
    role: 2,
    author: "亗 SIYAM HASAN 亗",
    description: "Premium All Group Panel for Telegram",
    category: "admin",
    countDown: 5,
    guide: "{pn}"
  },

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    // গ্রুপে বট মেসেজ পেলে অটো চ্যাট আইডি সেভ করে রাখবে প্যানেলের জন্য
    if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
      saveActiveGroup(chatId, msg.chat.title || "Unnamed Group");
    }

    try {
      const groupsObj = getActiveGroups();
      const groupKeys = Object.keys(groupsObj);

      if (groupKeys.length === 0) {
        // যদি ফাইলে সেভ না থাকে, অন্তত বর্তমান চ্যাটটি দেখাবে
        if (msg.chat.type !== "private") {
          saveActiveGroup(chatId, msg.chat.title || "Current Group");
        }
      }

      const updatedGroups = getActiveGroups();
      const groupList = Object.values(updatedGroups);

      if (!groupList.length) {
        return bot.sendMessage(chatId, "❌ Bot is not tracked in any group yet.", { reply_to_message_id: messageId });
      }

      let textMsg = 
`╔𝐑𝐎𝐘𝐀𝐋 𝐆𝐑𝐎𝐔𝐏 𝐏𝐀𝐍𝐄𝐋╗
┃
┃ 🌟 𝐀𝐋𝐋 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓 🌟
┃         👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 👑
┃
┃      👑 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
┃
╠═══════════════╣\n`;

      const saveGroupIDs = [];

      for (let i = 0; i < groupList.length; i++) {
        const g = groupList[i];
        textMsg += 
`┃ 💎 ${i + 1} ➤ ${g.title}
┃ 🆔 𝐆𝐂 𝐈𝐃 ➤ ${g.id}
┃
`;
        saveGroupIDs.push(g.id);
      }

      textMsg += 
`╠══════════════╣
┃  𝐑𝐄𝐏𝐋𝐘 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 𝐏𝐀𝐍𝐄𝐋 
┃
┃ 🚪 out [number]
┃ ➤ Leave Selected Group
┃
┃  ═══════════════╣
┃ 🤖 𝐁𝐎𝐓   ➤  𝗡𝗜𝗝𝗛𝗨𝗠 𝗕𝗢𝗧 
┃ 👑 𝐎𝐖𝐍𝐄𝐑    
┃  ☠️  ➤  𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
┃ 💠 𝐏𝐑𝐄𝐅𝐈𝐗 ➤ 【/】
┃
╚  👑 𝗡𝗜𝗝𝗛𝗨𝗠 𝗕𝗢𝗧👑 ╝`;

      const sentMsg = await bot.sendMessage(chatId, textMsg, { reply_to_message_id: messageId });

      // টেলিগ্রামের জন্য গ্লোবাল রেপ্লাই সেশন হ্যান্ডলার স্টোর করা
      if (!global.telegramReplySessions) {
        global.telegramReplySessions = new Map();
      }

      global.telegramReplySessions.set(sentMsg.message_id, {
        author: msg.from.id,
        groupData: saveGroupIDs
      });

    } catch (err) {
      console.error(err);
      return bot.sendMessage(chatId, "❌ System Error:\n" + err.message, { reply_to_message_id: messageId });
    }
  },

  // টেলিগ্রামের সাধারণ মেসেজ লিসেনারে এটি অনরিপ্লাই হিসেবে কাজ করবে
  handleReply: async function (bot, msg, sessionData) {
    try {
      if (msg.from.id !== sessionData.author) return;

      const args = msg.text.trim().split(/\s+/);
      const cmd = args[0]?.toLowerCase();
      const num = parseInt(args[1]);

      if (!cmd || isNaN(num)) {
        return bot.sendMessage(msg.chat.id, "❌ Invalid reply format. Use: out 1", { reply_to_message_id: msg.message_id });
      }

      const targetChatID = sessionData.groupData[num - 1];

      if (!targetChatID) {
        return bot.sendMessage(msg.chat.id, "❌ Group not found in list.", { reply_to_message_id: msg.message_id });
      }

      if (cmd === "out") {
        try {
          await bot.sendMessage(targetChatID, "⚠️ Owner requested bot to leave this group.");
          await bot.leaveChat(targetChatID);
          return bot.sendMessage(msg.chat.id, 
`╔══════════════╗
┃ ✅ LEFT SUCCESS
┃ 🆔 ${targetChatID}
╚══════════════╝`, { reply_to_message_id: msg.message_id });
        } catch (e) {
          return bot.sendMessage(msg.chat.id, "❌ Failed to leave group.", { reply_to_message_id: msg.message_id });
        }
      }

    } catch (err) {
      console.error(err);
      bot.sendMessage(msg.chat.id, "❌ Reply Error:\n" + err.message, { reply_to_message_id: msg.message_id });
    }
  }
};
