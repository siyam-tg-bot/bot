const axios = require("axios");

module.exports = (bot) => {
    bot.on('message', async (msg) => {
        try {
            if (!msg.left_chat_member) return;

            const chatId = msg.chat.id;
            const leftUser = msg.left_chat_member;
            const userName = leftUser.first_name || "User";

            const boldMap = {
                A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝",
                K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧",
                U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
                a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷",
                k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁",
                u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇"
            };

            const boldName = userName.split("").map(c => boldMap[c] || c).join("");

            const isKicked = msg.from && msg.from.id !== leftUser.id;

            if (isKicked) {
                const kickText = 
`» ⚠️ 𝗔𝗧𝗧𝗘𝗡𝗧𝗜𝗢𝗡 𝗣𝗟𝗘𝗔𝗦𝗘 ⚠️
───────────────
» ❌ এই ${boldName} 
» 🚷 তুই আবাল এই গ্রুপে 
» 🥲 থাকার যোগ্য না! 😹
» 🚫 তাই তোকে বের করে 
» 🙂 দেওয়া হয়েছে। 🥾
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

                await bot.sendMessage(chatId, kickText);
            } else {
                const failVideos = [
                    "https://files.catbox.moe/uxku65.mp4",
                    "https://files.catbox.moe/ol92rr.mp4"
                ];

                const randomFailUrl = failVideos[Math.floor(Math.random() * failVideos.length)];
                const leaveText = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 😹 দুঃখিত সিয়াম ভাই...
» 🚫 এই ইউজারটাকে 
» 📡 এড করতে পারলাম না
» 💀 মনে হয় উনি মারা গেছেন!
» 🍽️ চলো চলিশা খেয়ে আসি
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

                await bot.sendVideo(chatId, randomFailUrl, { caption: leaveText });
            }

        } catch (err) {
            console.error("Autoinvite Event Error:", err.message);
        }
    });
};
