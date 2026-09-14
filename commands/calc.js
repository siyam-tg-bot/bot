module.exports = {
    name: "calc",
    version: "1.0.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    category: "utility",
    shortDescription: "Calculate mathematical expressions",
    longDescription: "Evaluates basic mathematical calculations safely.",
    guide: "calc <expression>",

    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const expression = args.join("");
        const startTime = Date.now();

        if (!expression) {
            return bot.sendMessage(chatId, `⚠️ দয়া করে কোনো গাণিতিক টার্ম লিখুন! উদাহরণ: /calc 5+5*2`, {
                reply_to_message_id: messageId
            });
        }

        try {
            if (!/^[\d+\-*/().\s]+$/.test(expression)) {
                return bot.sendMessage(chatId, `❌ শুধুমাত্র সংখ্যা এবং গাণিতিক (+, -, *, /) চিহ্ন ব্যবহার করুন!`, {
                    reply_to_message_id: messageId
                });
            }

            const result = eval(expression);
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            return bot.sendMessage(chatId, `🔢 𝐂𝐀𝐋𝐂𝐔𝐋𝐀𝐓𝐈𝐎𝐍 𝐑𝐄𝐒𝐔𝐋𝐓: ${expression} = ${result}\n⏱️ 𝐓𝐈𝐌𝐄 𝐓𝐀𝐊𝐄𝐍: ${duration} 𝐒𝐄𝐂𝐎𝐍𝐃𝐒`, {
                reply_to_message_id: messageId
            });

        } catch (err) {
            return bot.sendMessage(chatId, `❌ হিসাব করতে সমস্যা হয়েছে! সঠিক ফরম্যাট ব্যবহার করুন।`, {
                reply_to_message_id: messageId
            });
        }
    }
};
