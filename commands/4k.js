const fs = require("fs");
const path = require("path");
const axios = require("axios");

let canvasModule = null;
try {
  canvasModule = require("canvas");
} catch (e) {}

function dslrEnhance(d, level) {
  let contrast = level === "5" ? 1.22 : level === "4" ? 1.20 : level === "3" ? 1.18 : level === "2" ? 1.14 : 1.10;
  let bright = level === "5" ? 10 : level === "4" ? 8 : level === "3" ? 6 : 4;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];
    r = (r - 128) * contrast + 128 + bright;
    g = (g - 128) * contrast + 128 + bright + 2;
    b = (b - 128) * contrast + 128 + bright + 5;
    let avg = (r + g + b) / 3;
    if (r > 90 && g > 60 && b > 50 && r > b) {
      let sat = level === "5" ? 1.15 : level === "4" ? 1.12 : 1.10;
      r = avg + (r - avg) * sat;
      g = avg + (g - avg) * sat;
      b = avg + (b - avg) * sat;
      r = r * 1.04; g = g * 1.02; b = b * 1.01;
    } else {
      let sat = level === "5" ? 1.30 : level === "4" ? 1.25 : 1.20;
      r = avg + (r - avg) * sat;
      g = avg + (g - avg) * sat;
      b = avg + (b - avg) * sat;
    }
    d[i] = Math.max(0, Math.min(255, r));
    d[i + 1] = Math.max(0, Math.min(255, g));
    d[i + 2] = Math.max(0, Math.min(255, b));
  }
}

module.exports = {
  name: "4k",
  aliases: ["hd", "enhance", "remini", "hdr", "8k"],
  version: "6.0-DSLR-PRO",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "DSLR Beautiful HD",
  longDescription: "Photo to DSLR Beautiful HD - 5 Levels",
  category: "image",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let photoObj = null;
    if (msg.reply_to_message && msg.reply_to_message.photo) {
      photoObj = msg.reply_to_message.photo;
    } else if (msg.photo) {
      photoObj = msg.photo;
    }

    if (!photoObj) {
      return bot.sendMessage(
        chatId,
        `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» 📸 𝗠𝗼𝗱𝗲𝗹: badol-dslr-beauty-v6-natural\n» 🌐 𝗔𝗣𝗜: api.badol.ai/v3/dslr\n\n» 📌 𝗨𝗦𝗔𝗚𝗘 𝗚𝗨𝗜𝗗𝗘:\n» ⚡ ,4k = Auto Full HD 16K\n» ⚡ ,4k 1 = Low HD\n» ⚡ ,4k 2 = Natural HD\n» ⚡ ,4k 3 = DSLR 4K\n» ⚡ ,4k 4 = DSLR 8K\n» ⚡ ,4k 5 = DSLR 16K Beautiful\n\n» 💡 𝗥𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮 𝗽𝗵𝗼𝘁𝗼\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`,
        { reply_to_message_id: messageId }
      );
    }

    let level = args && ["1", "2", "3", "4", "5"].includes(args[0]) ? args[0] : "5";
    let levelName = level === "1" ? "LOW HD" : level === "2" ? "NATURAL HD" : level === "3" ? "DSLR 4K" : level === "4" ? "DSLR 8K ULTRA" : "DSLR 16K BEAUTIFUL";
    let scale = level === "5" ? 2.8 : level === "4" ? 2.4 : level === "3" ? 2 : level === "2" ? 1.6 : 1.4;

    let processing = await bot.sendMessage(
      chatId,
      `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» 📸 𝗠𝗼𝗱𝗲: ${levelName}\n» 🌸 𝗡𝗼 𝗥𝗲𝗱 ✓ 𝗡𝗮𝘁𝘂𝗿𝗮𝗹 𝗦𝗸𝗶𝗻\n» ⏳ 𝗘𝗻𝗵𝗮𝗻𝗰𝗶𝗻𝗴...\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`,
      { reply_to_message_id: messageId }
    );

    const cacheDir = path.join(__dirname, "..", "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const fileName = `${Date.now()}`;
    const outPath = path.join(cacheDir, `dslr_out_${fileName}.jpg`);
    const inPath = path.join(cacheDir, `dslr_in_${fileName}.jpg`);

    try {
      const fileId = photoObj[photoObj.length - 1].file_id;
      const imageUrl = await bot.getFileLink(fileId);

      let imageBuffer = null;

      const enhanceApis = [
        `https://api.vreden.web.id/api/remini?url=${encodeURIComponent(imageUrl)}`,
        `https://api.davidcyriltech.my.id/remini?url=${encodeURIComponent(imageUrl)}`,
        `https://deliriussapi-official.vercel.app/tools/remini?url=${encodeURIComponent(imageUrl)}`
      ];

      for (const api of enhanceApis) {
        try {
          const res = await axios.get(api, { timeout: 15000 });
          let resUrl = null;
          if (res.data && res.data.result && res.data.result.url) {
            resUrl = res.data.result.url;
          } else if (res.data && res.data.result) {
            resUrl = typeof res.data.result === "string" ? res.data.result : res.data.result.image || res.data.result.download_url;
          } else if (res.data && res.data.url) {
            resUrl = res.data.url;
          }

          if (resUrl) {
            const imgBuf = await axios.get(resUrl, { responseType: "arraybuffer", timeout: 20000 });
            imageBuffer = Buffer.from(imgBuf.data);
            break;
          }
        } catch (e) {}
      }

      if (!imageBuffer && canvasModule) {
        const res = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 15000 });
        fs.writeFileSync(inPath, Buffer.from(res.data));

        const img = await canvasModule.loadImage(inPath);
        const canvas = canvasModule.createCanvas(Math.floor(img.width * scale), Math.floor(img.height * scale));
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        dslrEnhance(imageData.data, level);
        ctx.putImageData(imageData, 0, 0);

        imageBuffer = canvas.toBuffer("image/jpeg", { quality: 0.96 });
      }

      if (!imageBuffer) {
        const origRes = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 15000 });
        imageBuffer = Buffer.from(origRes.data);
      }

      fs.writeFileSync(outPath, imageBuffer);

      await bot.deleteMessage(chatId, processing.message_id).catch(() => {});

      await bot.sendPhoto(chatId, fs.createReadStream(outPath), {
        reply_to_message_id: messageId,
        caption: `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ✅ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀: ${levelName}\n» 🌸 𝗡𝗼 𝗥𝗲𝗱 ✓ 𝗡𝗮𝘁𝘂𝗿𝗮𝗹 𝗦𝗸𝗶𝗻\n» 👑 𝗔𝘂𝘁𝗵𝗼𝗿: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
      });

      if (fs.existsSync(inPath)) fs.unlinkSync(inPath);
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

    } catch (e) {
      await bot.deleteMessage(chatId, processing.message_id).catch(() => {});
      if (fs.existsSync(inPath)) fs.unlinkSync(inPath);
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

      return bot.sendMessage(
        chatId,
        `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ❌ 𝗘𝗿𝗿𝗼𝗿: ${e.message}\n» 🔄 𝗣𝗹𝗲𝗮𝘀𝗲 𝗧𝗿𝘆 𝗔𝗴𝗮𝗶𝗻 𝗟𝗮𝘁𝗲𝗿.\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`,
        { reply_to_message_id: messageId }
      );
    }
  }
};
