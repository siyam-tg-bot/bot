const axios = require("axios");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

const mahmud = [
  "baby",
  "bby",
  "babu",
  "bbu",
  "jan",
  "bot",
  "জান",
  "জানু",
  "বেবি",
  "hi",
  "বট",
  "নিঝুম"
];

const baseApiUrl = async () => {
  try {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json", { timeout: 10000 });
    return base.data.mahmud;
  } catch (e) {
    return "https://hinata-api.onrender.com";
  }
};

module.exports = {
  config: {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "1.7",
    author: AUTHOR,
    role: 0,
    shortDescription: "AI Baby Chatbot & SimSimi",
    longDescription: "Fast & smart AI SimSimi chat bot with teach and custom reply system",
    category: "chat",
    guide: "{pn} [text]\n{pn} teach [Message] - [Reply1], [Reply2]...\n{pn} remove [Message] - [index]\n{pn} edit [Message] - [NewMessage]\n{pn} list"
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const uid = msg.from.id;

    if (this.config.author !== AUTHOR) {
      return bot.sendMessage(chatId, "⚠️ Author name changed! Command locked.", {
        reply_to_message_id: messageId
      });
    }

    const fullMsg = args.join(" ").toLowerCase();

    try {
      if (!args[0]) {
        const ran = ["Bolo baby", "I love you", "type ,bby hi"];
        const randomChoice = ran[Math.floor(Math.random() * ran.length)];
        return bot.sendMessage(chatId, randomChoice, {
          reply_to_message_id: messageId
        });
      }

      const subCommand = args[0].toLowerCase();

      if (subCommand === "teach") {
        const mahmudStr = fullMsg.replace("teach ", "");
        const [trigger, ...responsesArr] = mahmudStr.split(" - ");
        const responses = responsesArr.join(" - ");
        if (!trigger || !responses) {
          return bot.sendMessage(chatId, "❌ | Usage: ,baby teach [question] - [response1, response2,...]", {
            reply_to_message_id: messageId
          });
        }
        const baseUrl = await baseApiUrl();
        const response = await axios.post(`${baseUrl}/api/jan/teach`, { trigger, responses, userID: uid });
        const userName = msg.from.first_name || "Unknown User";
        return bot.sendMessage(
          chatId,
          `✅ Replies added: "${responses}" to "${trigger}"\n• 𝐓𝐞𝐚𝐜𝐡𝐞𝐫: ${userName}\n• 𝐓𝐨𝐭𝐚𝐥: ${response.data.count || 0}`,
          { reply_to_message_id: messageId }
        );
      }

      if (subCommand === "remove" || subCommand === "rm") {
        const mahmudStr = fullMsg.replace(/^remove\s+|^rm\s+/, "");
        const [trigger, index] = mahmudStr.split(" - ");
        if (!trigger || !index || isNaN(index)) {
          return bot.sendMessage(chatId, "❌ | Usage: ,baby remove [question] - [index]", {
            reply_to_message_id: messageId
          });
        }
        const baseUrl = await baseApiUrl();
        const response = await axios.delete(`${baseUrl}/api/jan/remove`, {
          data: { trigger, index: parseInt(index, 10) }
        });
        return bot.sendMessage(chatId, response.data.message || "Removed successfully!", {
          reply_to_message_id: messageId
        });
      }

      if (subCommand === "list") {
        const baseUrl = await baseApiUrl();
        const endpoint = args[1] === "all" ? "/list/all" : "/list";
        const response = await axios.get(`${baseUrl}/api/jan${endpoint}`);

        if (args[1] === "all" && response.data.data) {
          let listMsg = "👑 List of Baby teachers:\n\n";
          const data = Object.entries(response.data.data).sort((a, b) => b[1] - a[1]).slice(0, 100);
          for (let i = 0; i < data.length; i++) {
            const [userID, count] = data[i];
            listMsg += `${i + 1}. User ${userID}: ${count}\n`;
          }
          return bot.sendMessage(chatId, listMsg, { reply_to_message_id: messageId });
        }
        return bot.sendMessage(chatId, response.data.message || "No list data found.", {
          reply_to_message_id: messageId
        });
      }

      if (subCommand === "edit") {
        const mahmudStr = fullMsg.replace("edit ", "");
        const [oldTrigger, ...newArr] = mahmudStr.split(" - ");
        const newResponse = newArr.join(" - ");
        if (!oldTrigger || !newResponse) {
          return bot.sendMessage(chatId, "❌ | Format: ,baby edit [question] - [newResponse]", {
            reply_to_message_id: messageId
          });
        }
        const baseUrl = await baseApiUrl();
        await axios.put(`${baseUrl}/api/jan/edit`, { oldTrigger, newResponse });
        return bot.sendMessage(chatId, `✅ Edited "${oldTrigger}" to "${newResponse}"`, {
          reply_to_message_id: messageId
        });
      }

      if (subCommand === "msg") {
        const searchTrigger = args.slice(1).join(" ");
        if (!searchTrigger) {
          return bot.sendMessage(chatId, "Please provide a message to search.", {
            reply_to_message_id: messageId
          });
        }
        try {
          const baseUrl = await baseApiUrl();
          const response = await axios.get(`${baseUrl}/api/jan/msg`, {
            params: { userMessage: `msg ${searchTrigger}` }
          });
          return bot.sendMessage(chatId, response.data.message || "No message found.", {
            reply_to_message_id: messageId
          });
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.message || "error";
          return bot.sendMessage(chatId, errorMessage, { reply_to_message_id: messageId });
        }
      }

      const getBotResponse = async (text) => {
        try {
          const baseUrl = await baseApiUrl();
          const res = await axios.post(`${baseUrl}/api/hinata`, { text, style: 3 });
          return res.data.message || "error baby🥹";
        } catch {
          return "error baby🥹";
        }
      };

      const botResponse = await getBotResponse(fullMsg);
      return bot.sendMessage(chatId, botResponse, { reply_to_message_id: messageId });

    } catch (err) {
      console.error(err);
      return bot.sendMessage(chatId, `⚠️ Error: ${err.message}`, {
        reply_to_message_id: messageId
      });
    }
  }
};
