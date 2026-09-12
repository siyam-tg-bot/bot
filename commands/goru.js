const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "goru",
    version: "2.4",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Expose someone as a Goru!",
    longDescription: "Puts the tagged/replied user's face on a cow's body (fun meme)",
    category: "fun",
    guide: "goru (reply to someone or tag)"
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    let targetID = msg.from.id;
    let targetName = msg.from.first_name || "Someone";

    if (msg.reply_to_message && msg.reply_to_message.from) {
      targetID = msg.reply_to_message.from.id;
      targetName = msg.reply_to_message.from.first_name || "Someone";
    }

    try {
      const waitMsg = await bot.sendMessage(chatId, "⌛️ Wait kor...", { reply_to_message_id: messageId });

      const fetchAvatar = async (uid) => {
        try {
          const userPhotos = await bot.getUserProfilePhotos(uid, { limit: 1 });
          if (userPhotos && userPhotos.total_count > 0) {
            const fileId = userPhotos.photos[0][0].file_id;
            const fileLink = await bot.getFileLink(fileId);
            if (fileLink) {
              const response = await axios.get(fileLink, {
                responseType: "arraybuffer",
                timeout: 15000
              });
              return Buffer.from(response.data);
            }
          }
          throw new Error("No profile photo");
        } catch (error) {
          const fallbackRes = await axios.get("https://i.imgur.com/74d53Qy.png", {
            responseType: "arraybuffer"
          });
          return Buffer.from(fallbackRes.data);
        }
      };

      const cacheDir = path.join(__dirname, "goru_cache");
      await fs.ensureDir(cacheDir);
      const bgPath = path.join(cacheDir, "cow_bg.jpg");

      let bgImage;
      if (fs.existsSync(bgPath)) {
        const bgBuffer = await fs.readFile(bgPath);
        bgImage = await loadImage(bgBuffer);
      } else {
        const cowImgUrl = "https://files.catbox.moe/ecebko.jpg";
        const bgResponse = await axios.get(cowImgUrl, {
          responseType: "arraybuffer",
          timeout: 20000
        });
        await fs.writeFile(bgPath, Buffer.from(bgResponse.data));
        bgImage = await loadImage(Buffer.from(bgResponse.data));
      }

      const avatarBuffer = await fetchAvatar(targetID);
      const avatarImage = await loadImage(avatarBuffer);

      const canvas = createCanvas(bgImage.width, bgImage.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bgImage, 0, 0);

      const avatarSize = 135;
      const headCenterX = 80 + avatarSize / 2;
      const headCenterY = 60 + avatarSize / 2;

      const avatarX = headCenterX - avatarSize / 2;
      const avatarY = headCenterY - avatarSize / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY, avatarSize / 2 + 1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "left";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 5;
      ctx.fillText("Kire chdna", 40, 50);

      const outputPath = path.join(
        cacheDir,
        `goru_${targetID}_${Date.now()}.png`
      );
      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(outputPath, buffer);

      await bot.sendPhoto(chatId, outputPath, {
        caption: `🤣😹\n${targetName} একদম আসল গরু হয়েছে বিদেশী গরু! 🐮✨ আরো কর বস সিয়াম এর সাথে বিয়াদবি😴`,
        reply_to_message_id: messageId
      });

      if (waitMsg && waitMsg.message_id) {
        try {
          await bot.deleteMessage(chatId, waitMsg.message_id);
        } catch {}
      }

      setTimeout(() => fs.unlink(outputPath).catch(() => {}), 5000);
    } catch (err) {
      console.error("❌ Goru Command Error:", err);
      return bot.sendMessage(chatId, "⚠️ something wrong, trying again 🙂", { reply_to_message_id: messageId });
    }
  }
};
