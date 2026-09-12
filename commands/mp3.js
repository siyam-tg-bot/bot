const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "mp3",
    aliases: ["convertmp3"],
    version: "1.0.2",
    role: 0,
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    shortDescription: "Convert video to MP3 🎧",
    longDescription: "Download video from URL and convert to MP3.",
    category: "media",
    guide: "{pn} <video_url> or reply to a video"
  },

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const replyToMsg = msg.reply_to_message;
    const filePath = path.join(__dirname, `/cache/audio_${Date.now()}.mp3`);

    try {
      let url = args.join(" ");
      if (!url && replyToMsg) {
        if (replyToMsg.video) {
          const fileId = replyToMsg.video.file_id;
          const file = await bot.getFile(fileId);
          url = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        } else if (replyToMsg.audio) {
          const fileId = replyToMsg.audio.file_id;
          const file = await bot.getFile(fileId);
          url = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        }
      }

      if (!url) {
        const noUrlMsg = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ⚠️ 𝗣𝗟𝗘𝗔𝗦𝗘 𝗣𝗥𝗢𝗩𝗜𝗗𝗘 𝗔
» 🤦 𝗩𝗜𝗗𝗘𝗢 𝗨𝗥𝗟 𝗢𝗥 𝗥𝗘𝗣𝗟𝗬!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
        return bot.sendMessage(chatId, noUrlMsg, { reply_to_message_id: messageId });
      }

      const loadingText = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🎧  𝗠𝗣𝟯 𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚...
» 🧭  𝗟𝗢𝗔𝗗𝗜𝗡𝗚... ⏳
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      const loadingMsg = await bot.sendMessage(chatId, loadingText, { reply_to_message_id: messageId });

      const response = await axios.get(url, { responseType: "arraybuffer" });
      await fs.outputFile(filePath, Buffer.from(response.data));

      const successMsg = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🔊  𝗠𝗣𝟯 𝗜𝗦 𝗥𝗘𝗔𝗗𝗬 ✅
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      await bot.sendAudio(chatId, fs.createReadStream(filePath), {
        caption: successMsg,
        reply_to_message_id: messageId
      });

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (loadingMsg?.message_id) {
        try { await bot.deleteMessage(chatId, loadingMsg.message_id); } catch(e){}
      }

    } catch (err) {
      console.error(err);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      const errorMsg = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌  𝗙𝗔𝗜𝗟𝗘𝗗 𝗧𝗢
» 🧭 𝗖𝗢𝗡𝗩𝗘𝗥𝗧 𝗩𝗜𝗗𝗘𝗢!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
      
      bot.sendMessage(chatId, errorMsg, { reply_to_message_id: messageId });
    }
  }
};
