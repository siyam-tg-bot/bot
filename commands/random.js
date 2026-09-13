const axios = require("axios");
const fs = require("fs-extra");
const path = nodePath = require("path");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

const videoLinks = [
  "https://files.catbox.moe/wjdxmi.mp4", 
  "https://files.catbox.moe/50c5xk.mp4", 
  "https://files.catbox.moe/gnwsb0.mp4", 
  "https://files.catbox.moe/xvnddb.mp4", 
  "https://files.catbox.moe/ar6eq8.mp4", 
  "https://files.catbox.moe/nu2sa2.mp4", 
  "https://files.catbox.moe/ywr5qk.mp4", 
  "https://files.catbox.moe/m1urbb.mp4", 
  "https://files.catbox.moe/1dphq6.mp4", 
  "https://files.catbox.moe/davog1.mp4", 
  "https://files.catbox.moe/v5fd3j.mp4", 
  "https://files.catbox.moe/59s710.mp4", 
  "https://files.catbox.moe/uwyl06.mp4", 
  "https://files.catbox.moe/qivkp6.mp4", 
  "https://files.catbox.moe/9p5y43.mp4", 
  "https://files.catbox.moe/183i71.mp4", 
  "https://files.catbox.moe/yjryst.mp4", 
  "https://files.catbox.moe/2mteak.mp4", 
  "https://files.catbox.moe/c0iehe.mp4", 
  "https://files.catbox.moe/arrdxy.mp4", 
  "https://files.catbox.moe/yi59sk.mp4", 
  "https://files.catbox.moe/3ubxm3.mp4", 
  "https://files.catbox.moe/7f8wqk.mp4", 
  "https://files.catbox.moe/pvw8bb.mp4", 
  "https://files.catbox.moe/kobwni.mp4", 
  "https://files.catbox.moe/l3fr5m.mp4", 
  "https://files.catbox.moe/juu46e.mp4", 
  "https://files.catbox.moe/1z7rbm.mp4", 
  "https://files.catbox.moe/6k39ei.mp4", 
  "https://files.catbox.moe/3cxmpr.mp4", 
  "https://files.catbox.moe/1z7rbm.mp4", 
  "https://files.catbox.moe/9a4u5v.mp4", 
  "https://files.catbox.moe/31iuqn.mp4", 
  "https://files.catbox.moe/mbdsqx.mp4", 
  "https://files.catbox.moe/ejpekx.mp4", 
  "https://files.catbox.moe/823nau.mp4", 
  "https://files.catbox.moe/3g7cn7.mp4", 
  "https://files.catbox.moe/76mp19.mp4", 
  "https://files.catbox.moe/jj7hdr.mp4"
];

const validLinks = videoLinks.filter(link => link.trim() !== "");

module.exports = {
  config: {
    name: "random",
    version: "2.1.0",
    author: AUTHOR,
    countDown: 15,
    role: 0,
    shortDescription: "Sends a random video from the list",
    longDescription: "This command sends a random video from the configured link list with interactive buttons.",
    category: "media",
    usages: "random"
  },

  execute: async (bot, msg, args) => {
    await sendRandomVideo(bot, msg.chat.id, msg.message_id);
  },

  onStart: async function ({ bot, msg, args }) {
    await sendRandomVideo(bot, msg.chat.id, msg.message_id);
  },

  onCallbackQuery: async function (bot, query) {
    try {
      const data = query.data;
      if (data === "random_next") {
        const chatId = query.message.chat.id;

        await bot.answerCallbackQuery(query.id, { text: "⏳ পরবর্তী র‍্যান্ডম ভিডিও পাঠানো হচ্ছে..." });

        if (validLinks.length === 0) {
          return bot.sendMessage(chatId, "⚠️ 𝗡𝗼 𝘃𝗶𝗱𝗲𝗼 𝗹𝗶𝗻𝗸𝘀 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝘁𝗵𝗲 𝗹𝗶𝘀𝘁!");
        }

        const randomLink = validLinks[Math.floor(Math.random() * validLinks.length)];
        const randomFileName = `GOAT_V_${Math.floor(Math.random() * 9999)}.mp4`;
        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const tempPath = path.join(cacheDir, randomFileName);

        const response = await axios({
          method: 'get',
          url: randomLink,
          responseType: 'stream'
        });

        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
          const caption = `🎥 𝗛𝗲𝗿𝗲 𝗶𝘀 𝘆𝗼𝘂𝗿 𝗥𝗮𝗻𝗱𝗼𝗺 𝗩𝗶𝗱𝗲𝗼!\n\n🆔 𝗩𝗶𝗱𝗲𝗼 𝗡𝗮𝗺𝗲: ${randomFileName}\n👤 𝗢𝘄𝗻𝗲𝗿: 𝆠፝${AUTHOR}`;

          // আগের ভিডিও ডিলিট না করে নতুন ভিডিও নিচে পাঠানো হবে
          await bot.sendVideo(chatId, fs.createReadStream(tempPath), {
            caption: caption,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "⏭️ 𝐍𝐄𝐗𝐓", callback_data: "random_next" },
                  { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
                ],
                [
                  { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
                ]
              ]
            }
          });

          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        });

        writer.on('error', (err) => {
          console.error(err);
          bot.sendMessage(chatId, "❌ 𝗘𝗿𝗿𝗼𝗿: 𝗨𝗻𝗮𝗯𝗹𝗲 𝘁𝗼 𝘀𝗲𝗻𝗱 𝘃𝗶𝗱𝗲𝗼. 𝗧𝗵𝗲 𝗳𝗶𝗹𝗲 𝗺𝗶𝗴𝗵𝘁 𝗯𝗲 𝘁𝗼𝗼 𝗹𝗮𝗿𝗴𝗲!");
        });
      }
    } catch (err) {
      console.error("Random Callback Error:", err.message);
    }
  }
};

async function sendRandomVideo(bot, chatId, messageId) {
  try {
    if (validLinks.length === 0) {
      return bot.sendMessage(chatId, "⚠️ 𝗡𝗼 𝘃𝗶𝗱𝗲𝗼 𝗹𝗶𝗻𝗸𝘀 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝘁𝗵𝗲 𝗹𝗶𝘀𝘁!", { reply_to_message_id: messageId });
    }

    const loadingMsg = await bot.sendMessage(chatId, "⏳ 𝗩𝗶𝗱𝗲𝗼 𝗶𝘀 𝗹𝗼𝗮𝗱𝗶𝗻𝗴...\n𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝗮 𝗺𝗼𝗺𝗲𝗻𝘁.", {
      reply_to_message_id: messageId
    });

    const randomLink = validLinks[Math.floor(Math.random() * validLinks.length)];
    const randomFileName = `GOAT_V_${Math.floor(Math.random() * 9999)}.mp4`;
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const tempPath = path.join(cacheDir, randomFileName);

    const response = await axios({
      method: 'get',
      url: randomLink,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    writer.on('finish', async () => {
      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}

      const caption = `🎥 𝗛𝗲𝗿𝗲 𝗶𝘀 𝘆𝗼𝘂𝗿 𝗥𝗮𝗻𝗱𝗼𝗺 𝗩𝗶𝗱𝗲𝗼!\n\n🆔 𝗩𝗶𝗱𝗲𝗼 𝗡𝗮𝗺𝗲: ${randomFileName}\n👤 𝗢𝘄𝗻𝗲𝗿: 𝆠፝${AUTHOR}`;

      await bot.sendVideo(chatId, fs.createReadStream(tempPath), {
        caption: caption,
        reply_to_message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "⏭️ 𝐍𝐄𝐗𝐓", callback_data: "random_next" },
              { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
            ],
            [
              { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
            ]
          ]
        }
      });

      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    });

    writer.on('error', async (err) => {
      console.error(err);
      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}
      bot.sendMessage(chatId, "❌ 𝗘𝗿𝗿𝗼𝗿: 𝗨𝗻𝗮𝗯𝗹𝗲 𝘁𝗼 𝘀𝗲𝗻𝗱 𝘃𝗶𝗱𝗲𝗼. 𝗧𝗵𝗲 𝗳𝗶𝗹𝗲 𝗺𝗶𝗴𝗵𝘁 𝗯𝗲 𝘁𝗼𝗼 𝗹𝗮𝗿𝗴𝗲!", { reply_to_message_id: messageId });
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ 𝗘𝗿𝗿𝗼𝗿: 𝗨𝗻𝗮𝗯𝗹𝗲 𝘁𝗼 𝘀𝗲𝗻𝗱 𝘃𝗶𝗱𝗲𝗼.", { reply_to_message_id: messageId });
  }
}
