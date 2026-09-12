const axios = require("axios");

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
    "নিঝুম",
];

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "1.8",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    countDown: 0,
    role: 0,
    description: "better then all sim simi & most fastest",
    category: "chat",
    guide: "baby [anyMessage]"
};

module.exports.onStart = async ({ bot, msg, args }) => {
    const LOCKED_AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
    if (module.exports.config.author !== LOCKED_AUTHOR) {
        module.exports.config.author = LOCKED_AUTHOR;
    }
    
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const textMsg = args.join(" ").toLowerCase();
    const uid = msg.from.id;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "I love you", "type baby hi"];
            return bot.sendMessage(chatId, ran[Math.floor(Math.random() * ran.length)], { reply_to_message_id: messageId });
        }

        if (args[0] === "teach") {
            const mahmudStr = textMsg.replace("teach ", "");
            const [trigger, ...responsesArr] = mahmudStr.split(" - ");
            const responses = responsesArr.join(" - ");
            if (!trigger || !responses) {
                return bot.sendMessage(chatId, "❌ | teach [question] - [response1, response2,...]", { reply_to_message_id: messageId });
            }
            const response = await axios.post(`${await baseApiUrl()}/api/jan/teach`, { trigger, responses, userID: uid });
            let userName = msg.from.first_name || "Unknown User";
            return bot.sendMessage(chatId, `✅ Replies added: "${responses}" to "${trigger}"\n• 𝐓𝐞𝐚𝐜𝐡𝐞𝐫: ${userName}\n• 𝐓𝐨𝐭𝐚𝐥: ${response.data.count || 0}`, { reply_to_message_id: messageId });
        }

        if (args[0] === "remove") {
            const mahmudStr = textMsg.replace("remove ", "");
            const [trigger, index] = mahmudStr.split(" - ");
            if (!trigger || !index || isNaN(index)) {
                return bot.sendMessage(chatId, "❌ | remove [question] - [index]", { reply_to_message_id: messageId });
            }
            const response = await axios.delete(`${await baseApiUrl()}/api/jan/remove`, { data: { trigger, index: parseInt(index, 10) } });
            return bot.sendMessage(chatId, response.data.message, { reply_to_message_id: messageId });
        }

        if (args[0] === "list") {
            const endpoint = args[1] === "all" ? "/list/all" : "/list";
            const response = await axios.get(`${await baseApiUrl()}/api/jan${endpoint}`);
            if (args[1] === "all") {
                let message = "👑 List of Baby teachers:\n\n";
                const data = Object.entries(response.data.data).sort((a, b) => b[1] - a[1]).slice(0, 100);
                for (let i = 0; i < data.length; i++) {
                    const [userID, count] = data[i];
                    message += `${i + 1}. User ${userID}: ${count}\n`;
                }
                return bot.sendMessage(chatId, message, { reply_to_message_id: messageId });
            }
            return bot.sendMessage(chatId, response.data.message, { reply_to_message_id: messageId });
        }

        if (args[0] === "edit") {
            const mahmudStr = textMsg.replace("edit ", "");
            const [oldTrigger, ...newArr] = mahmudStr.split(" - ");
            const newResponse = newArr.join(" - ");
            if (!oldTrigger || !newResponse) {
                return bot.sendMessage(chatId, "❌ | Format: edit [question] - [newResponse]", { reply_to_message_id: messageId });
            }
            await axios.put(`${await baseApiUrl()}/api/jan/edit`, { oldTrigger, newResponse });
            return bot.sendMessage(chatId, `✅ Edited "${oldTrigger}" to "${newResponse}"`, { reply_to_message_id: messageId });
        }

        if (args[0] === "msg") {
            const searchTrigger = args.slice(1).join(" ");
            if (!searchTrigger) {
                return bot.sendMessage(chatId, "Please provide a message to search.", { reply_to_message_id: messageId });
            }
            try {
                const response = await axios.get(`${await baseApiUrl()}/api/jan/msg`, { params: { userMessage: `msg ${searchTrigger}` } });
                return bot.sendMessage(chatId, response.data.message || "No message found.", { reply_to_message_id: messageId });
            } catch (error) {
                const errorMessage = error.response?.data?.error || error.message || "error";
                return bot.sendMessage(chatId, errorMessage, { reply_to_message_id: messageId });
            }
        }

        const getBotResponse = async (text) => {
            try {
                const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text, style: 3, attachments: [] });
                return res.data.message;
            } catch {
                return "error baby🥹";
            }
        };

        const botResponse = await getBotResponse(textMsg);
        await bot.sendMessage(chatId, botResponse, { reply_to_message_id: messageId });

    } catch (err) {
        bot.sendMessage(chatId, "❌ An error occurred.", { reply_to_message_id: messageId });
    }
};

module.exports.onChat = async ({ bot, msg }) => {
    try {
        const text = msg.text ? msg.text.toLowerCase() : "";
        if (!text) return;

        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        const isReplyToBot = msg.reply_to_message && msg.reply_to_message.from.id === bot.id;
        const hasTrigger = mahmud.some(word => text.startsWith(word));

        if (isReplyToBot || hasTrigger) {
            let queryText = text;
            for (const prefix of mahmud) {
                if (text.startsWith(prefix)) {
                    queryText = text.substring(prefix.length).trim();
                    break;
                }
            }

            if (!queryText && !isReplyToBot) return;

            if (isReplyToBot && !hasTrigger) {
                queryText = text;
            }

            const randomMessage = [
                "বাবু খুদা লাকছে🥺",
                "Hop beda😾,Boss বল boss😼",
                "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘 ",                      
                "naw amr boss k message daw 01789138157",
                "গোলাপ ফুল এর জায়গায় আমি দিলাম তোমায় মেসেজ",
                "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
                "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝐮__😘😘",
                "এটায় দেখার বাকি সিলো_🙂🙂🙂",
                "𝗕𝗯𝘆 𝗯𝗼𝗹𝗹𝗮 𝗽𝗮𝗽 𝗵𝗼𝗶𝗯𝗼 😒😒",
                "𝗕𝗲𝘀𝗵𝗶 𝗱𝗮𝗸𝗹𝗲 𝗮𝗺𝗺𝘂 𝗯𝗼𝗸𝗮 𝗱𝗲𝗯𝗮 𝘁ো__🥺",
                "বেশি bby Bbby করলে leave নিবো কিন্তু 😒😒",
                "__বেশি বেবি বললে কামুর দিমু 🤭🤭",
                "𝙏𝙪𝙢𝙖𝙧 𝙜𝙛 𝙣𝙖𝙞, 𝙩𝙖𝙮 𝙖𝙢𝙠 𝙙𝙖𝙠𝙨𝙤? 😂😂😂",
                "আমাকে ডেকো না,আমি ব্যাস্ত আসি🙆🏻‍♀",
                "𝗕𝗯𝘆 বললে চাকরি থাকবে না",
                "𝗕𝗯𝘆 𝗕𝗯𝘆 না করে আমার বস মানে, 𝆠፝𝐒𝐈𝐘𝐀𝐌,𝐒𝐈𝐘𝐀𝐌 ও তো করতে পারো😑?",
                "আমার সোনার বাংলা, তারপরে লাইন কি? 🙈",
                "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
                "হটাৎ আমাকে মনে পড়লো 🙄",
                "𝗕𝗯𝘆 বলে অসম্মান করচ্ছিছ,😰😿",
                "𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 🐤🐤",
                "আমি তোমার সিনিয়র আপু ওকে 😼সম্মান দেও🙁",
                "খাওয়া দাওয়া করসো 🙄",
                "এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈",
                "আরে আমি মজা করার mood এ নাই😒",
                "𝗛𝗲𝘆 𝗛𝗮𝗻𝗱𝘀𝗼𝗺𝗲 বলো 😁😁",
                "আরে Bolo আমার জান, কেমন আসো? 😚",
                "একটা BF খুঁজে দাও 😿",
                "oi mama ar dakis na pilis 😿",
                "amr JaNu lagbe,Tumi ki single aso?",
                "আমাকে না দেকে একটু পড়তেও বসতে তো পারো 🥺🥺",
                "তোর বিয়ে হয় নি 𝗕𝗯𝘆 হইলো কিভাবে,,🙄",
                "আজ একটা ফোন নাই বলে রিপ্লাই দিতে পারলাম না_🙄",
                "চৌধুরী সাহেব আমি গরিব হতে পারি😾🤭 -কিন্তু বড়লোক না🥹 😫",
                "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
                "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
                "ভুলে জাও আমাকে 😞😞",
                "দেখা হলে কাঠগোলাপ দিও..🤗",
                "শুনবো না😼 তুমি আমাকে প্রেম করাই দাও নি🥺 পচা তুমি🥺",
                "আগে একটা গান বলো, ☹ নাহলে কথা বলবো না 🥺",
                "বলো কি করতে পারি তোমার জন্য 😚",
                "কথা দেও আমাকে পটাবা...!! 😌",
                "বার বার Disturb করেছিস কোনো, আমার জানু এর সাথে ব্যাস্ত আসি 😋",
                "আমাকে না দেকে একটু পড়তে বসতেও তো পারো 🥺🥺",
                "বার বার ডাকলে মাথা গরম হয় কিন্তু 😑😒",
                "Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈",
                "আজকে আমার mন ভালো নেই 🙉",
                "আমি হাজারো মশার Crush😓",
                "ছেলেদের প্রতি আমাদের এক আকাশ পরিমান শরম🥹🫣",
                "মন সুন্দর বানাও মুখের জন্য তো 'Snapchat' আছেই! 🌚"  
            ];

            try {
                const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text: queryText || "hi", style: 3, attachments: [] });
                const botResponse = res.data.message || randomMessage[Math.floor(Math.random() * randomMessage.length)];
                await bot.sendMessage(chatId, botResponse, { reply_to_message_id: messageId });
            } catch (error) {
                const fallbackMsg = randomMessage[Math.floor(Math.random() * randomMessage.length)];
                await bot.sendMessage(chatId, fallbackMsg, { reply_to_message_id: messageId });
            }
        }
    } catch (err) {}
};
