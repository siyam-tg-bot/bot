const fs = require("fs");
const path = require("path");

const cacheDir = path.join(__dirname, "..", "cache");
const groupsFilePath = path.join(cacheDir, "groups.json");

function getStoredGroups() {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  if (!fs.existsSync(groupsFilePath)) {
    fs.writeFileSync(groupsFilePath, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(groupsFilePath, "utf8"));
  } catch (e) {
    return {};
  }
}

function saveGroups(data) {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(groupsFilePath, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "allbox",
    aliases: ["boxlist"],
    author: "kshitiz",
    version: "2.0",
    role: 0,
    shortDescription: "List all group chats the bot is in.",
    longDescription: "Use this command to list all group chats the bot is currently in.",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ bot, msg }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    try {
      const storedGroups = getStoredGroups();

      if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
        storedGroups[msg.chat.id] = msg.chat.title || "Unnamed Group";
        saveGroups(storedGroups);
      }

      const groupEntries = Object.entries(storedGroups);

      if (groupEntries.length === 0) {
        return bot.sendMessage(chatId, "No group chats found.", {
          reply_to_message_id: messageId
        });
      }

      const formattedList = groupEntries.map(([id, title], index) => 
        `│🍂${index + 1}. ${title}\n│➥𝐓𝐈𝐃: ${id}`
      );

      const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n${formattedList.join("\n")}\n╰───────────ꔪ`;

      return bot.sendMessage(chatId, message, {
        reply_to_message_id: messageId
      });
    } catch (error) {
      console.error("Error listing group chats", error);
    }
  }
};
