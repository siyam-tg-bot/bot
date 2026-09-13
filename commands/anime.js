const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const EXPECTED_AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

module.exports = {
  config: {
    name: "anime",
    version: "2.0.0",
    author: EXPECTED_AUTHOR,
    countDown: 5,
    role: 0,
    shortDescription: "Sad video sender 😢",
    longDescription: "Sends random sad video with emotional captions 💔",
    category: "media",
    usages: "prefix anime"
  },

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (module.exports.config.author !== EXPECTED_AUTHOR) {
      throw new Error("❌ AUTHOR LOCKED FILE - Modification Detected!");
    }

    const captions = [
      "=「𝐏𝐑𝐄𝐅𝐈𝐗-𝐄𝐕𝐄𝐍𝐓」= \n--❖(✷‿𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓‿✷)❖-- \n✢━━━━━━━━━━━━━━━✢        \n🎌🏴‍☠️♡-𝐀𝐍𝐈𝐌𝐄-𝐕𝐈𝐃𝐄𝐎-♡🏴‍☠️🎌 \n✢━━━━━━━━━━━━━━━✢\n(✷‿𝐎𝐖𝐍𝐄𝐑:-‿𝐃𝐒-𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍✷)"
    ];

    const caption = captions[Math.floor(Math.random() * captions.length)];

    const links = [
      "https://drive.google.com/uc?id=18-qJqj0yJOe1DnqtKCtt2BA6aL4Lsu1V",
      "https://drive.google.com/uc?id=18_dfqfqJ7Izv_V39udjqHIhL9VNXJ9g8",
      "https://drive.google.com/uc?id=1AtMec3fO0qsocLBjbbAealc18pZeC8-3",
      "https://drive.google.com/uc?id=194QHUiobsj_4gWEnC1vJxQUMZjDz1J97",
      "https://drive.google.com/uc?id=18f4u2I-yIu6k1oZwurqJqfUlX9m13Yfi",
      "https://drive.google.com/uc?id=18phpGz_zhEGCOqouvqjrlvN7fOwxPO1S",
      "https://drive.google.com/uc?id=18SDweGtqRP07XHAZ78mLAJkTo1xg8xyO",
      "https://drive.google.com/uc?id=19RC6Qb5nfhTsQf3DRswH43jeJbNujk4w",
      "https://drive.google.com/uc?id=18Uj2jMSvnLcrt_CEt-6aAHcAchp9BZDr",
      "https://drive.google.com/uc?id=1A6ZnUeVgg_4Tcdk1zUiC7kPurAuCC1G8",
      "https://drive.google.com/uc?id=17Iz2LT8PksDU_J0oe_7vjxhSZ94rDCB-",
      "https://drive.google.com/uc?id=17GwnxijuRcwillJdh3j6V1zMwDQYW7sh",
      "https://drive.google.com/uc?id=18NTG35pSgG62HjcwYStMyqFKyLZZr44-",
      "https://drive.google.com/uc?id=17sXmHH3SuHjo3vK7WNlhDurfSUYhujpK",
      "https://drive.google.com/uc?id=18L_R_6WNGHUJecWPfIuTMPNxq-V1EAcQ",
      "https://drive.google.com/uc?id=18CMe0QbZQMHxVSuFpy6iAKtZ7ln5sBMh",
      "https://drive.google.com/uc?id=17kgktlBZxMlfY2tDOyhbWAXy9VT7v1hs",
      "https://drive.google.com/uc?id=17n7w5omJRNZz5Rt-D8Aa_1dy6jvZmObA",
      "https://drive.google.com/uc?id=17iLYInZF3fvnaPxIrghmZkesoFmTBMgP",
      "https://drive.google.com/uc?id=1B8eBVs6yEtwjtGqtROznYSR9P4kbVLYV",
      "https://drive.google.com/uc?id=1ADJiq0rVkJqI2b8CGaaiOW6EOC7gYl0d",
      "https://drive.google.com/uc?id=1ADjoiJt8uyfuGU9fSTP8CS5WNBRs7Yl3",
      "https://drive.google.com/uc?id=17VXDfR9FCQadHDaTgxCfZY__GtCGigDc",
      "https://drive.google.com/uc?id=19ZbhvqxQ9C9wi_ix9ghtrjggDNmbxda5",
      "https://drive.google.com/uc?id=1BLirFfDf1NOvVygV4Y9Vs5YjzsgubR4G",
      "https://drive.google.com/uc?id=1BBl0ZNDknIOldhXwnSoaYnSjJOFcbHfh",
      "https://drive.google.com/uc?id=1BGTYnjqwoLyFcbSgtYL3lHnUeg2Titg8",
      "https://drive.google.com/uc?id=188tNbHkrWHEV83Yi4oar4WmMFt6pr9xi",
      "https://drive.google.com/uc?id=17ciTd5xEe9LTg9qpmmv6XdFtuR-Zf0vA",
      "https://drive.google.com/uc?id=18pg1AphOv5hXdFBnQ7ZCcBzV6sFWDZ7N",
      "https://drive.google.com/uc?id=19WfOG5qDAeXwJq7Vhkhbix62VYTLXfzR",
      "https://drive.google.com/uc?id=17x_PrTSg12y-JFrG6ncERdQPjcWviFiM",
      "https://drive.google.com/uc?id=18NB5pdSAr4A5kL0hE5uJGZgZxxvLmCYm",
      "https://drive.google.com/uc?id=18iJTgtTuZsAtZ3dX7MYxTNM_HaFI4j0T",
      "https://drive.google.com/uc?id=1AIk2R8okqECAofSlFwhQXgGtWsqvv-TV",
      "https://drive.google.com/uc?id=195z7g6QzRELQmcmUE9ENT7E8-1DjvvXk",
      "https://drive.google.com/uc?id=1ATQuJ6Wkxy4UlbrmRY-0peyDqJ4pSgmX",
      "https://drive.google.com/uc?id=17KukJVRpSDTjVHdUgETAeM234BueSk4S",
      "https://drive.google.com/uc?id=1777G3gps_igQxFXVmJYFXs_DzCNB672s",
      "https://drive.google.com/uc?id=1ANjcA1xmzF8w6ilYYStgk4woCs4ntof6",
      "https://drive.google.com/uc?id=18-Np_hMb5qhmhgtzzKDD9Ntm_p8Gi2aD",
      "https://drive.google.com/uc?id=1Azc5n_6sRadjtwCgJcKgtOZxN2c77gdG",
      "https://drive.google.com/uc?id=1777G3gps_igQxFXVmJYFXs_DzCNB672s"
    ];

    const link = links[Math.floor(Math.random() * links.length)];
    const cachePath = path.join(__dirname, "cache", `sad_${Date.now()}.mp4`);

    try {
      const response = await axios({
        url: encodeURI(link),
        method: "GET",
        responseType: "stream"
      });

      await fs.ensureDir(path.join(__dirname, "cache"));
      const writer = fs.createWriteStream(cachePath);

      response.data.pipe(writer);

      writer.on("finish", async () => {
        await bot.sendVideo(chatId, fs.createReadStream(cachePath), {
          caption: `「 ${caption} 」`,
          reply_to_message_id: messageId
        });
        fs.unlinkSync(cachePath);
      });

      writer.on("error", (err) => {
        console.error(err);
        bot.sendMessage(chatId, "❌ ভিডিও পাঠাতে সমস্যা হয়েছে!", { reply_to_message_id: messageId });
      });

    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, "❌ কিছু একটা সমস্যা হয়েছে ভিডিও আনতে।", { reply_to_message_id: messageId });
    }
  }
};
