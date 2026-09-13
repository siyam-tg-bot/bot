const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const AUTHOR = "💋𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍👑";

const sab2CacheDir = path.join(__dirname, "sab2_cache");
if (!fs.existsSync(sab2CacheDir)) {
  fs.mkdirSync(sab2CacheDir, { recursive: true });
}

const videoData = [
  { url: "https://files.catbox.moe/2ii8c7.mp4", text: "কিছু গল্প কখনো শেষ হয় না, শুধু চরিত্রগুলো বদলে যায়..!! 🥀" },
  { url: "https://files.catbox.moe/ah0s9r.mp4", text: "সবচেয়ে কঠিন হলো কারো অবহেলা পাওয়ার পরও তাকেই ভালোবেসে যাওয়া..!! 💔" },
  { url: "https://files.catbox.moe/ydwkrm.mp4", text: "একাকীত্ব কখনো মানুষকে মারে না, শুধু ভেতর থেকে পুড়িয়ে ছাই করে দেয়..!! 🖤" },
  { url: "https://files.catbox.moe/111n24.mp4", text: "যার জন্য পুরো পৃথিবীর সাথে লড়েছিলাম, আজ সে-ই আমার অপবাদের কারণ..!! 🥺" },
  { url: "https://files.catbox.moe/ebyeyi.mp4", text: "স্মৃতিগুলো বড্ড অদ্ভুত, হাসির দিনে কাঁদায় আর কান্নার দিনে হাসায়..!! ⏳" },
  { url: "https://files.catbox.moe/olpzpk.mp4", text: "অভিযোগ করে কী হবে? যার কপালে অবহেলা লেখা, সে তো অবহেলাই পাবে..!! 🥀" },
  { url: "https://files.catbox.moe/3y330y.mp4", text: "ভালো থাকার অভিনয় করতে করতে আজ আমি ক্লান্ত, কেউ বুঝলো না আমায়..!! 🖤" },
  { url: "https://files.catbox.moe/j4fhyp.mp4", text: "তুমি তো ভালোই আছো আমাকে ছাড়া, কষ্টটা তো শুধু আমার একার..!! 💔" },
  { url: "https://files.catbox.moe/gc2ard.mp4", text: "ভরসা তাকেই করো যে তোমার হাসির পেছনে লুকিয়ে থাকা কষ্টটা বোঝে..!! ✨" },
  { url: "https://files.catbox.moe/44oya3.mp4", text: "যে চলে যায় সে কোনো অজুহাতে থাকে না, আর যে থাকার সে এমনিতেই থাকে..!! 🥀" },
  { url: "https://files.catbox.moe/ffvnm1.mp4", text: "হারিয়ে ফেলা মানুষকে হয়তো খোঁজা যায়, কিন্তু বদলে যাওয়া মানুষকে কখনো নয়..!! 💔" },
  { url: "https://files.catbox.moe/c5ja93.mp4", text: "মাঝে মাঝে মনে হয়, ভালো না বেসে ভালো থাকলেই বোধহয় বেশি ভালো হতো..!! 🖤" },
  { url: "https://files.catbox.moe/56bgjp.mp4", text: "পরিস্থিতি আজ এমন এক জায়গায় এনে দাঁড় করিয়েছে, যেখানে নিজের বলতে কেউ নেই..!! 🥺" },
  { url: "https://files.catbox.moe/2l5loh.mp4", text: "নীরবে কেঁদে যাওয়ার নামই হয়তো জীবন, এখানে বোঝার মতো কেউ নেই..!! 🥀" },
  { url: "https://files.catbox.moe/0j8bwh.mp4", text: "কিছু ক্ষত কখনো শুকায় না, শুধু সহ্য করার ক্ষমতাটুকু বেড়ে যায়..!! 💔" },
  { url: "https://files.catbox.moe/4hjg4f.mp4", text: "তুমি তো শুধু শুধু আমার গল্পে আছো, বাস্তবে তুমি তো অন্য কারো আকাশ..!! 🖤" },
  { url: "https://files.catbox.moe/l5bfws.mp4", text: "যার হারানোর ভয় সবচেয়ে বেশি ছিল, আজ সে নিজেই আমাকে হারিয়ে দিলো..!! 🥺" },
  { url: "https://files.catbox.moe/7nvnsi.mp4", text: "কিছু পাওয়ার চেয়ে হারিয়ে ফেলার বেদনা বড্ড বেশি তীব্র হয়..!! 🥀" },
  { url: "https://files.catbox.moe/j7gndp.mp4", text: "আজকের এই চোখের জল হয়তো একদিন শুকিয়ে যাবে, কিন্তু ক্ষতের দাগ থেকে যাবে..!! 💔" },
  { url: "https://files.catbox.moe/9tfka4.mp4", text: "স্বপ্ন দেখা সহজ, কিন্তু একটা ভাঙা স্বপ্ন নিয়ে বেঁচে থাকা বড্ড কঠিন..!! 🖤" },
  { url: "https://files.catbox.moe/6dyzum.mp4", text: "আমরা দুজন দুজনাকে ঠিকই পেয়েছিলাম, শুধু ভাগ্যটাই আমাদের পাশে ছিল না..!! 🥀" },
  { url: "https://files.catbox.moe/hgf9vq.mp4", text: "কাউকে জোর করে ধরে রাখা যায় না, যে যাওয়ার সে হাত ছেড়ে চলে যাবেই..!! 💔" },
  { url: "https://files.catbox.moe/3e5pct.mp4", text: "ভালো থেকো অন্যের শহরের রাজকুমারী হয়ে, আমি আমার একাকীত্ব নিয়েই সুখে আছি..!! 🖤" },
  { url: "https://files.catbox.moe/uak967.mp4", text: "কিছু মানুষ ভালো না বেসেও অভিনয়টা এমনভাবে করে, যেন তারা নিষ্পাপ..!! 🥺" },
  { url: "https://files.catbox.moe/4lul8c.mp4", text: "মন ভাঙার শব্দ কখনো হয় না, হলে আজ পুরো পৃথিবী স্তব্ধ হয়ে যেত..!! 🥀" },
  { url: "https://files.catbox.moe/ovcvmm.mp4", text: "ভালোবাসা জিনিসটা শুধু উপহার দিতে জানে না, কেড়ে নিতেও ওস্তাদ..!! 💔" },
  { url: "https://files.catbox.moe/1dcqi3.mp4", text: "কাউকে এতটা আপন ভেবো না, যাতে সে চলে গেলে নিজের অস্তিত্বই হারিয়ে যায়..!! 🖤" },
  { url: "https://files.catbox.moe/u5eqv4.mp4", text: "আজকের অবহেলাটাই হয়তো আগামীকালের সব স্মৃতি মুছে ফেলার শক্তি জোগাবে..!! 🥀" },
  { url: "https://files.catbox.moe/ym8tn3.mp4", text: "একটু সুখের আশায় এসেছিলাম, কিন্তু দুঃখের নদীটাই বেশি গভীর ছিল..!! 💔" },
  { url: "https://files.catbox.moe/jqusfc.mp4", text: "সময়ের সাথে সাথে সবাই বদলে যায়, শুধু কিছু বোকা স্মৃতি রয়ে যায় অবিকল..!! 🖤" },
  { url: "https://files.catbox.moe/nacfgz.mp4", text: "মন থেকে যাকে চাওয়া যায়, তাকে হয়তো কখনো নিজের ভাগ্যে পাওয়া যায় না..!! 🥺" },
  { url: "https://files.catbox.moe/rbp7hg.mp4", text: "আমরা সবাই ভালো থাকার অভিনয় করি, কিন্তু ভেতরের খবর কেউ রাখে না..!! 🥀" },
  { url: "https://files.catbox.moe/yiigq2.mp4", text: "কিছু মানুষের নীরবতা মানে অহংকার নয়, তাদের সহ্য ক্ষমতার শেষ সীমানা..!! 💔" },
  { url: "https://files.catbox.moe/51d6w6.mp4", text: "আজ আমি অন্যের চোখের বালি, অথচ একদিন কারো চোখের মণি ছিলাম..!! 🖤" },
  { url: "https://files.catbox.moe/zw6atp.mp4", text: "আশা করি তুমি তোমার নতুন জীবনে অনেক সুখী হবে, আমার গল্প এখানেই সমাপ্ত..!! 🥀💔" },
  { url: "https://files.catbox.moe/s6yws3.mp4", text: "অনুভূতির কাছে হেরে যাওয়া মানুষগুলোই শেষমেশ নিস্তব্ধ হতে শেখে..!! 🖤" },
  { url: "https://files.catbox.moe/s0buu3.mp4", text: "কিছু না বলা কথা বুকে চেপে রাখাই হয়তো আমাদের একমাত্র নিয়তি..!! 🥀" },
  { url: "https://files.catbox.moe/2q4cuv.mp4", text: "যে হৃদয়ে একসময় তুমি লুকিয়ে ছিলে, আজ সে হৃদয়ে শুধু শূন্যতা..!! 💔" },
  { url: "https://files.catbox.moe/at0bri.mp4", text: "ইচ্ছে করেই দূরত্ব বাড়িয়ে দিয়েছি, কারণ অবহেলা নেওয়ার ক্ষমতা আর নেই..!! 🥺" },
  { url: "https://files.catbox.moe/l81qh6.mp4", text: "কাউকে এতটা ভেবো না যে, সে চলে গেলে নিজের ছায়াকেও অচেনা মনে হয়..!! 🖤" },
  { url: "https://files.catbox.moe/hmzyvj.mp4", text: "অভিমানের শহর বড়ই নিঃসঙ্গ, সেখানে শুধুই বিষাদের বাস..!! 🥀" },
  { url: "https://files.catbox.moe/l07czp.mp4", text: "তুমি চলে গেছো ঠিকই, কিন্তু আমার অন্ধকারের সঙ্গী হয়ে রয়ে গেছো..!! 💔" },
  { url: "https://files.catbox.moe/f40jx9.mp4", text: "কিছু বিচ্ছেদ কখনো বলে আসে না, নীরবে সব ধ্বংস করে দিয়ে যায়..!! 🥺" },
  { url: "https://files.catbox.moe/bdjq2l.mp4", text: "স্মৃতিগুলো যে এত কষ্ট দেবে, জানলে হয়তো কখোনো স্মৃতির পাতাগুলো খুলতাম না..!! 🖤" },
  { url: "https://files.catbox.moe/lixz5d.mp4", text: "আমরা দুজন এখন অচেনা দুটি পথ, যার মাঝখানে শুধুই নীরবতা..!! 🥀" },
  { url: "https://files.catbox.moe/5mgnha.mp4", text: "অপেক্ষার প্রহর এত দীর্ঘ হবে, কখনো ভাবতেও পারিনি..!! 💔" },
  { url: "https://files.catbox.moe/c26k6y.mp4", text: "যার হাতে হাসতে শিখেছিলাম, আজ তার কারণেই চোখের জল ফেলা অভ্যাস..!! 🥺" },
  { url: "https://files.catbox.moe/yxd6xp.mp4", text: "কথা কাটাকাটির চেয়ে নীরব বিচ্ছেদ অনেক বেশি ব্যথাদায়ক..!! 🖤" },
  { url: "https://files.catbox.moe/irrwss.mp4", text: "একটু ভালোবাসার বিনিময়ে এত অপমান পাবো তা ভাবিনি কখনো..!! 🥀" },
  { url: "https://files.catbox.moe/prbrd5.mp4", text: "যাকে জীবনের শেষ আশ্রয় ভেবেছিলাম, সে-ই মোড় ঘুরিয়ে দিলো..!! 💔" },
  { url: "https://files.catbox.moe/raiwss.mp4", text: "নীরব কান্নার আওয়াজ হয়তো কেউ শোনে না, কিন্তু হৃদয় চুরমার করে দেয়..!! 🥺" },
  { url: "https://files.catbox.moe/hc7adh.mp4", text: "তোমার স্মৃতির মেলায় আজ আমি এক নিঃস্ব পথিক..!! 🖤" },
  { url: "https://files.catbox.moe/0gkumw.mp4", text: "কিছু স্বপ্নের সমাধি মনের ভেতর গোপনে গড়ে ওঠে..!! 🥀" },
  { url: "https://files.catbox.moe/4msm5c.mp4", text: "তুমি তো ভুলে গেলে সহজেই, কিন্তু আমার যে পুরো পৃথিবীটাই থমকে গেলো..!! 💔" },
  { url: "https://files.catbox.moe/oqmkc3.mp4", text: "মিথ্যা বিশ্বাসের চেয়ে সত্যি দূরত্ব অনেক বেশি শান্তির..!! 🥺" },
  { url: "https://files.catbox.moe/ydz3xz.mp4", text: "আমার নীরবতাই এখন আমার শেষ আশ্রয়স্থল..!! 🖤" },
  { url: "https://files.catbox.moe/mwyctm.mp4", text: "কিছু গল্প অসম্পূর্ণ রেখেই বিধাতা শেষ করে দেন..!! 🥀" },
  { url: "https://files.catbox.moe/fejaj9.mp4", text: "একলা থাকার মধ্যে কোনো ছলনা নেই, অন্তত মন ভাঙার ভয় নেই..!! 💔" },
  { url: "https://files.catbox.moe/da9cfm.mp4", text: "চোখের পানি মুছে ফেলার মতো একজন মানুষও পাশে নেই..!! 🥺" },
  { url: "https://files.catbox.moe/78whqz.mp4", text: "ভাঙা মন নিয়ে চলার চেয়ে থমকে থাকা অনেক ভালো..!! 🖤" },
  { url: "https://files.catbox.moe/jzcpie.mp4", text: "সময়ের সাথে ক্ষতের দাগ হয়তো মেলায়, কিন্তু ব্যথা থেকে যায়..!! 🥀" },
  { url: "https://files.catbox.moe/j7nhga.mp4", text: "আজকের বিষাদময় রাত হয়তো শেষ হবে, কিন্তু মানসিক ক্লান্তি দূর হবে না..!! 💔" },
  { url: "https://files.catbox.moe/n2lzzl.mp4", text: "তুমি সুখী হও অন্য কারো হয়ে, আমি নিঃসঙ্গতাই আঁকড়ে রাখি..!! 🥺" },
  { url: "https://files.catbox.moe/h4aikd.mp4", text: "ভালোবাসার পরিণাম এত কঠিন তা জানা ছিল না..!! 🖤" },
  { url: "https://files.catbox.moe/5bqna4.mp4", text: "যার উপস্থিতি সবচেয়ে মধুর ছিল, তার অনুপস্থিতি সবচেয়ে বিষাক্ত..!! 🥀" },
  { url: "https://files.catbox.moe/thakez.mp4", text: "শেষ বিকেলের আলো ছড়িয়ে যেমন আঁধার নামে, তেমনি আমার জীবনও আঁধারে ঢাকা..!! 💔" }
];

if (!global.sad2PlayedHistory) {
  global.sad2PlayedHistory = [];
}

module.exports = {
  config: {
    name: "sad",
    version: "2.0.0",
    role: 0,
    author: AUTHOR,
    description: "🎬 প্রতিবার কমান্ডে আলাদা ভিডিও এবং স্যাড ক্যাপশন পাঠাবে",
    category: "Fun",
    countDown: 5
  },

  execute: async function (bot, msg, args) {
    await sendSadVideo(bot, msg.chat.id, msg.message_id);
  },

  onStart: async function ({ bot, msg, args }) {
    await sendSadVideo(bot, msg.chat.id, msg.message_id);
  },

  onCallbackQuery: async function (bot, query) {
    try {
      const data = query.data;
      if (data === "sad_next") {
        const chatId = query.message.chat.id;

        await bot.answerCallbackQuery(query.id, { text: "⏳ পরবর্তী স্যাড ভিডিও পাঠানো হচ্ছে..." });

        if (global.sad2PlayedHistory.length >= videoData.length) {
          global.sad2PlayedHistory = [];
        }

        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * videoData.length);
        } while (global.sad2PlayedHistory.includes(randomIndex));

        global.sad2PlayedHistory.push(randomIndex);
        const currentVideo = videoData[randomIndex];
        const videoName = `sad2_video_${randomIndex}.mp4`;
        const videoPath = path.join(sab2CacheDir, videoName);

        try {
          if (!fs.existsSync(videoPath) || fs.statSync(videoPath).size === 0) {
            const response = await axios.get(currentVideo.url, { responseType: "arraybuffer" });
            fs.writeFileSync(videoPath, Buffer.from(response.data));
          }

          const caption = `
╭───────────────⭓
  ${currentVideo.text}
───────────────⭓
👑  𝗢𝗪𝗡𝗘𝗥 ➜
    𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑  
╰───────────────⭓`;

          // আগের ভিডিও ডিলিট না করে নতুন ভিডিও নিচে পাঠানো হবে
          await bot.sendVideo(chatId, fs.createReadStream(videoPath), {
            caption: caption,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "⏭️ 𝐍𝐄𝐗𝐓", callback_data: "sad_next" },
                  { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
                ],
                [
                  { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
                ]
              ]
            }
          });

        } catch (downloadError) {
          console.error("❌ Sad2 Next Download Error:", downloadError);
          bot.sendMessage(chatId, "❌ ভিডিওটি পাঠাতে সমস্যা হচ্ছে! আবার চেষ্টা করুন।");
        }
      }
    } catch (err) {
      console.error("Sad Callback Error:", err.message);
    }
  }
};

async function sendSadVideo(bot, chatId, messageId) {
  try {
    if (global.sad2PlayedHistory.length >= videoData.length) {
      global.sad2PlayedHistory = [];
    }

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * videoData.length);
    } while (global.sad2PlayedHistory.includes(randomIndex));

    global.sad2PlayedHistory.push(randomIndex);
    const currentVideo = videoData[randomIndex];
    const videoName = `sad2_video_${randomIndex}.mp4`;
    const videoPath = path.join(sab2CacheDir, videoName);

    const info = await bot.sendMessage(chatId, "⏳ 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 · 𝗣𝗟𝗘𝗔𝗦𝗘 𝗪𝗔𝗜𝗧...", { reply_to_message_id: messageId });

    try {
      if (!fs.existsSync(videoPath) || fs.statSync(videoPath).size === 0) {
        const response = await axios.get(currentVideo.url, { responseType: "arraybuffer" });
        fs.writeFileSync(videoPath, Buffer.from(response.data));
      }

      if (info && info.message_id) {
        try { await bot.deleteMessage(chatId, info.message_id); } catch(e){}
      }

      const caption = `
╭───────────────⭓
  ${currentVideo.text}
───────────────⭓
👑  𝗢𝗪𝗡𝗘𝗥 ➜
    𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑  
╰───────────────⭓`;

      await bot.sendVideo(chatId, fs.createReadStream(videoPath), {
        caption: caption,
        reply_to_message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "⏭️ 𝐍𝐄𝐗𝐓", callback_data: "sad_next" },
              { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
            ],
            [
              { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
            ]
          ]
        }
      });

    } catch (downloadError) {
      console.error("❌ Sad2 Download Error:", downloadError);
      if (info && info.message_id) {
        try { await bot.deleteMessage(chatId, info.message_id); } catch(e){}
      }
      bot.sendMessage(chatId, "❌ ভিডিওটি পাঠাতে সমস্যা হচ্ছে! আবার চেষ্টা করুন।", { reply_to_message_id: messageId });
    }
  } catch (error) {
    console.error("❌ Sad2 Execution Error:", error);
    bot.sendMessage(chatId, "❌ কমান্ডটি রান করতে কোনো সমস্যা হয়েছে!", { reply_to_message_id: messageId });
  }
}
