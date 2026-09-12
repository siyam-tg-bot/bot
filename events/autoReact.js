const emojiList = [
    "👍",
    "❤️",
    "🔥",
    "🥰",
    "👏",
    "🎉",
    "🤩",
    "⚡",
    "😎",
    "💯",
    "😍",
    "🗿"
];

module.exports = (bot) => {

    // ==============================
    // Auto React Function
    // ==============================
    async function autoReact(chatId, messageId) {
        const randomEmoji =
            emojiList[Math.floor(Math.random() * emojiList.length)];

        try {
            // node-telegram-bot-api
            if (typeof bot.setMessageReaction === "function") {

                await bot.setMessageReaction(
                    chatId,
                    messageId,
                    {
                        reaction: [
                            {
                                type: "emoji",
                                emoji: randomEmoji
                            }
                        ],
                        is_big: false
                    }
                );

                return {
                    success: true,
                    emoji: randomEmoji
                };
            }

            // Fallback: direct Telegram API request
            if (typeof bot._request === "function") {

                await bot._request("setMessageReaction", {
                    chat_id: chatId,
                    message_id: messageId,
                    reaction: JSON.stringify([
                        {
                            type: "emoji",
                            emoji: randomEmoji
                        }
                    ]),
                    is_big: false
                });

                return {
                    success: true,
                    emoji: randomEmoji
                };
            }

            throw new Error(
                "setMessageReaction এবং _request কোনোটাই পাওয়া যায়নি"
            );

        } catch (error) {

            return {
                success: false,
                emoji: randomEmoji,
                error: error.message
            };
        }
    }


    // ==============================
    // Incoming Message Auto React
    // ==============================
    bot.on("message", async (msg) => {

        try {

            if (!msg || !msg.chat || !msg.message_id) {
                return;
            }

            const result = await autoReact(
                msg.chat.id,
                msg.message_id
            );

            if (result.success) {

                console.log(
                    `✅ Auto React SUCCESS | Chat: ${msg.chat.id} | Message: ${msg.message_id} | Reaction: ${result.emoji}`
                );

            } else {

                console.error(
                    `❌ Auto React ERROR | Chat: ${msg.chat.id} | Message: ${msg.message_id} | ${result.error}`
                );
            }

        } catch (error) {

            console.error(
                `❌ Auto React System Error: ${error.message}`
            );
        }
    });


    // ==============================
    // Bot Startup Test
    // ==============================
    async function startupTest() {

        try {

            const me = await bot.getMe();

            console.log(
                `🤖 Bot Started: @${me.username || me.first_name}`
            );

            /*
             * এখানে test করার জন্য একটা chat ID লাগবে।
             *
             * process.env.TEST_CHAT_ID
             * অথবা আপনার নিজের config থেকে ID দিতে পারেন।
             */

            const testChatId = process.env.TEST_CHAT_ID;

            if (!testChatId) {

                console.log(
                    "⚠️ Auto React Startup Test skipped: TEST_CHAT_ID সেট করা নেই।"
                );

                return;
            }

            // প্রথমে test message পাঠাবে
            const testMessage = await bot.sendMessage(
                testChatId,
                "🧪 Auto React System Testing..."
            );

            // তারপর ওই message-এ reaction দেওয়ার চেষ্টা
            const result = await autoReact(
                testChatId,
                testMessage.message_id
            );

            if (result.success) {

                // Success message
                await bot.sendMessage(
                    testChatId,
                    `✅ Auto React System: SUCCESS\n\nReaction: ${result.emoji}\nStatus: Working properly.`
                );

                console.log(
                    `✅ AUTO REACT TEST SUCCESS | Reaction: ${result.emoji}`
                );

            } else {

                // Error message
                await bot.sendMessage(
                    testChatId,
                    `❌ Auto React System: ERROR\n\nReason: ${result.error}\n\n⚠️ Bot reaction permission/API configuration check করুন।`
                );

                console.error(
                    `❌ AUTO REACT TEST FAILED: ${result.error}`
                );
            }

        } catch (error) {

            console.error(
                `❌ Startup Auto React Test Error: ${error.message}`
            );
        }
    }


    // ==============================
    // Start Test
    // ==============================
    startupTest();
};
