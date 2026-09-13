const fs = require("fs-extra");
const path = require("path");
const https = require("https");

const AUTHOR = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

module.exports = {
  config: {
    name: "cutereply",
    version: "3.3.0",
    author: AUTHOR,
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "Premium Auto Reply with exact match and user cooldown"
    },
    longDescription: {
      en: "Auto reply with stylish message & image. Exact trigger match with 3 minutes user cooldown."
    },
    category: "system"
  }
};

if (module.exports.config.author !== AUTHOR) {
  console.log("AUTHOR LOCK ACTIVATED");
  process.exit(1);
}

const USER_COOLDOWN = 3 * 60 * 1000;
const lastReplyUser = {};

const TRIGGERS = [
  {
    words: [
      "siyam",
      "সিয়াম",
      "@ri_siyam",
      "হৃদয়",
      "@t.me/ri_siyam"
    ],
    text: `𝗢𝗪𝗡𝗘𝗥 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
───────────────
» 🌷 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗗𝗘𝗔𝗥
» 🤲 আসসালামু আলাইকুম
» 👑 সিয়াম বস এখন 
» 🦉 ব্যস্ত আছেন
» 💌 আপনার মেসেজ 
» 🖥️ ইনবক্সে দিয়ে রাখুন
» ⚡ বস ফ্রি হলে উত্তর পাবেন
» 🤍 ধৈর্য ধরার জন্য ধন্যবাদ
───────────────
» 👤 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
 📞 +8801789138157
» ✈️ 𝐓𝐄𝐋𝐄𝐆𝐑𝗔𝐌: t.me/ri_siyam
» 🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: https://www.facebook.com/profile.php?id=61592677587804`,
    images: [
      "https://i.imgur.com/XDj7Lg3.jpeg",
      "https://i.imgur.com/vPTaRaf.jpeg",
      "https://i.imgur.com/maHcZQB.jpeg",
      "https://i.imgur.com/pWNb6lR.jpeg"
    ],
    buttons: [
      [
        { text: "👑 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" },
        { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
      ],
      [
        { text: "🔗 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐏𝐑𝐎𝐅𝐈𝐋𝐄", url: "https://www.facebook.com/profile.php?id=61592677587804" }
      ]
    ]
  },
  {
    words: [
      "নিঝুম",
      "@বট",
      "@নি্ঁঝু্ঁম্ঁ রা্ঁতে্ঁর্ঁ প্ঁরী্ঁ"
    ],
    text: `🔰💠𝗡𝗜𝗝𝗛𝗨𝗠 𝗕𝗢𝗧💠🔱
───────────────
» 🌷 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗗𝗘𝗔𝗥
» 😹 আমাকে মেনশন দিয়ে লাভ নাই
» 🤖 আমি একটি Telegram Bot
» 💌 শুধুমাত্র বিনোদনের জন্য তৈরি
» ⚡ চাইলে আপনিও নিজের গ্রুপে 
» 🤖 নিতে পারেন
» 🤍 ধন্যবাদ
───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍

» 📞 𝗖𝗢𝗡𝗧𝗔𝗖𝗧: +8801789138157
» ✈️ 𝐓𝐄𝐋𝐄𝐆𝐑𝗔𝐌: t.me/ri_siyam
» 🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: https://www.facebook.com/profile.php?id=61592677587804`,
    images: [
      "https://i.imgur.com/rkrXNso.jpeg",
      "https://i.imgur.com/wyNCOKV.jpeg"
    ],
    buttons: [
      [
        { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" },
        { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/SiyamTgBot?startgroup=true" }
      ],
      [
        { text: "🔗 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊", url: "https://www.facebook.com/profile.php?id=61592677587804" }
      ]
    ]
  }
];

module.exports.onStart = async function () {};

module.exports.onChat = async function ({ bot, msg }) {
  try {
    const chatId = msg.chat.id;
    const senderID = msg.from ? msg.from.id : null;
    const messageId = msg.message_id;
    const body = (msg.text || "").toLowerCase().trim();

    if (!body) return;

    if (senderID && bot.token && senderID.toString() === bot.token.split(":")[0]) return;

    const now = Date.now();
    if (lastReplyUser[senderID] && (now - lastReplyUser[senderID] < USER_COOLDOWN)) {
      return;
    }

    let matched = null;

    for (const item of TRIGGERS) {
      if (item.words.some(word => body === word.toLowerCase().trim())) {
        matched = item;
        break;
      }
    }

    if (!matched) return;

    lastReplyUser[senderID] = now;

    const imgUrl = matched.images[Math.floor(Math.random() * matched.images.length)];
    const imgName = path.basename(imgUrl.split("?")[0]);
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const imgPath = path.join(cacheDir, imgName);

    if (!fs.existsSync(imgPath)) {
      await downloadImage(imgUrl, imgPath);
    }

    await bot.sendPhoto(
      chatId,
      imgPath,
      {
        caption: matched.text,
        reply_to_message_id: messageId,
        reply_markup: {
          inline_keyboard: matched.buttons
        }
      }
    );

  } catch (err) {
    console.log(err);
  }
};

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject();
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", () => {
      fs.unlink(dest, () => {});
      reject();
    });
  });
}
