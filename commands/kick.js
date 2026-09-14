module.exports = {
    name: "kick",
    aliases: ["ban"],
    version: "1.8",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 1,
    category: "Group Management",
    guide: "/kick (রিপ্লাই দিয়ে, ইউজার আইডি দিয়ে অথবা মেনশন করে)",

    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        if (msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
            return bot.sendMessage(chatId, "এই কমান্ডটি শুধুমাত্র গ্রুপে ব্যবহার করা যাবে!", {
                reply_to_message_id: messageId
            });
        }

        try {
            const botInfo = await bot.getMe();
            const chatAdmins = await bot.getChatAdministrators(chatId);
            const isBotAdmin = chatAdmins.some(admin => admin.user.id === botInfo.id);

            if (!isBotAdmin) {
                return bot.sendMessage(chatId, "বোটকে আগে গ্রুপের এডমিন বানান, নাহলে আমি কাউকে বের করতে পারবো না!", {
                    reply_to_message_id: messageId
                });
            }

            let targetId = null;

            if (msg.reply_to_message && msg.reply_to_message.from) {
                targetId = msg.reply_to_message.from.id;
            } else if (msg.entities && msg.entities.length > 0) {
                const mentionEntity = msg.entities.find(e => e.type === "text_mention" || e.type === "mention");
                if (mentionEntity) {
                    if (mentionEntity.type === "text_mention") {
                        targetId = mentionEntity.user.id;
                    } else if (mentionEntity.type === "mention") {
                        const username = msg.text.substring(mentionEntity.offset, mentionEntity.offset + mentionEntity.length);
                        try {
                            const userChat = await bot.getChat(username);
                            targetId = userChat.id;
                        } catch (err) {}
                    }
                }
            } else if (args.length > 0) {
                let targetArg = args[0];
                if (!isNaN(targetArg)) {
                    targetId = parseInt(targetArg);
                } else if (targetArg.startsWith("@")) {
                    try {
                        const userChat = await bot.getChat(targetArg);
                        targetId = userChat.id;
                    } catch (err) {}
                }
            }

            if (!targetId) {
                return bot.sendMessage(chatId, "যাকে বের করবেন তার মেসেজে রিপ্লাই দিন, ইউজার আইডি দিন অথবা মেনশন করুন।", {
                    reply_to_message_id: messageId
                });
            }

            const isTargetAdmin = chatAdmins.some(admin => admin.user.id === targetId);
            if (isTargetAdmin) {
                return bot.sendMessage(chatId, "🛡️সিয়াম বস📂, 💁গ্রুপ এডমিন 🤔তোমার 🥵ধ*ন চু*সা 🦵কামলা হিসাবে রাইখা দাও😂! ❌", {
                    reply_to_message_id: messageId
                });
            }

            await bot.banChatMember(chatId, targetId);
            await bot.unbanChatMember(chatId, targetId, {
                only_if_banned: true
            });

            return bot.sendMessage(chatId, "সফলভাবে ইউজারকে গ্রুপ থেকে বের করে দেওয়া হয়েছে! ✅", {
                reply_to_message_id: messageId
            });

        } catch (err) {
            return bot.sendMessage(chatId, "🫶সিয়াম বস🛡️ বের করতে সমস্যা হচ্ছে😔। হয়তো আমার পারমিশন নেই🤧 বা ইউজারটি গ্রুপে নেই। ⚠️", {
                reply_to_message_id: messageId
            });
        }
    }
};
