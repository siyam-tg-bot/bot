const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "mia",
    aliases: ["miakhalifa"],
    version: "2.0.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: "Mia meme maker",
    guide: "{pn} <text>"
  },

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const text = args.join(" ");
    if (!text) {
      const noTextMsg = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ✍️  𝗧𝗘𝗫𝗧 𝗟𝗘𝗞𝗛𝗢 𝗕𝗥𝗢!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
      return bot.sendMessage(chatId, noTextMsg, { reply_to_message_id: messageId });
    }

    const loadingText = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🖼️  𝗠𝗜𝗔 𝗠𝗘𝗠𝗘 𝗠𝗔𝗞𝗜𝗡𝗚...
» ⏳  𝗣𝗟𝗘𝗔𝗦𝗘 𝗪𝗔𝗜𝗧...
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

    const loadingMsg = await bot.sendMessage(chatId, loadingText, { reply_to_message_id: messageId });

    // বিকল্প ফাস্ট এপিআই বা ইমেজ জেনারেটর লিংক
    const apiUrl = `https://api.popcat.xyz/miakhalifa?text=${encodeURIComponent(text)}`;
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    const pathImg = path.join(cacheDir, `mia_${Date.now()}.png`);

    try {
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(pathImg, Buffer.from(res.data));

      if (loadingMsg && loadingMsg.message_id) {
        try { await bot.deleteMessage(chatId, loadingMsg.message_id); } catch(e){}
      }

      await bot.sendPhoto(chatId, fs.createReadStream(pathImg), {
        caption: `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ✅ 𝗠𝗜𝗔 𝗠𝗘𝗠𝗘 𝗥𝗘𝗔𝗗𝗬!\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`,
        reply_to_message_id: messageId
      });

      if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);

    } catch (err) {
      console.error("Mia Meme Error:", err);
      if (loadingMsg && loadingMsg.message_id) {
        try { await bot.deleteMessage(chatId, loadingMsg.message_id); } catch(e){}
      }
      if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);

      const errorMsg = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 💥  𝗦𝗢𝗠𝗢𝗦𝗬𝗔 𝗛𝗢𝗬𝗘𝗖𝗛𝗘!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
      return bot.sendMessage(chatId, errorMsg, { reply_to_message_id: messageId });
    }
  }
};
