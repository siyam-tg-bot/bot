const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
    name: "xnx",
    version: "1.0.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    category: "media",
    shortDescription: "𝚂𝙴𝙰𝚁𝙲𝙷 𝙰𝙽𝙳 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝚅𝙸𝙳𝙴𝙾𝚂",
    longDescription: "𝚂𝙴𝙰𝚁𝙲𝙷𝙴𝚂 𝚅𝙸𝙳𝙴𝙾𝚂 𝙰𝙽𝙳 𝚂𝙷𝙾𝚆𝚂 𝚃𝙷𝙴𝙼 𝙾𝙽𝙴 𝙱𝚈 𝙾𝙽𝙴 𝚆𝙸𝚃𝙷 𝙸𝙽𝙻𝙸𝙽𝙴 𝙱𝚄𝚃𝚃𝙾𝙽𝚂.",
    guide: "xnx <keyword>",

    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const query = args.join(" ");

        if (!query) {
            return bot.sendMessage(chatId, `⚠️ 𝙳𝙾𝚈𝙰 𝙺𝙾𝚁𝙴 𝙺𝙾𝙽𝙾 𝙺𝙴𝚈𝚆𝙾𝚁𝙳 𝙻𝙸𝙺𝙷𝚄𝙽!`, {
                reply_to_message_id: messageId
            });
        }

        try {
            const configRes = await axios.get(nix);
            const base = configRes.data?.api;
            if (!base) throw new Error();

            const res = await axios.get(`${base}/xnx?q=${encodeURIComponent(query)}`);
            const results = res.data.result;

            if (!results || results.length === 0) {
                return bot.sendMessage(chatId, `❌ 𝙺𝙾𝙽𝙾 𝚁𝙴𝚂𝚄𝙻𝚃 𝙿𝙰𝚆𝙰 𝙶𝙴𝙻𝙾 𝙽𝙰!`, {
                    reply_to_message_id: messageId
                });
            }

            const index = 0;
            const v = results[index];

            const replyText = 
`🔍 𝚂𝙴𝙰𝚁𝙲𝙷 𝚀𝚄𝙴𝚁𝚈: ${query}
━━━━━━━━━━━━━━━━━━
🎬 𝚃𝙸𝚃𝙻𝙴: ${v.title}
⏱️ 𝙳𝚄𝚁𝙰𝚃𝙸𝙾𝙽: ${v.duration || 'N/A'}
👀 𝚅𝙸𝙴𝚆𝚂: ${v.views || 'N/A'}
📄 𝙿𝙰𝙶𝙴: ${index + 1}/${results.length}
━━━━━━━━━━━━━━━━━━
🖌️ 𝙲𝚁𝙴𝙰𝚃𝙴𝙳 𝙱𝚈: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

            const inlineKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "📥 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳", callback_data: `xnx_dl_${index}_${encodeURIComponent(v.link)}` },
                            { text: "⏭️ 𝙽𝙴𝚇𝚃", callback_data: `xnx_next_${index + 1}` }
                        ],
                        [
                            { text: "𝙾𝚆𝙽𝙴𝚁", url: "https://t.me/ri_siyam" },
                            { text: "𝙰𝙳𝙳 𝙱𝙾𝚃", url: "https://t.me/SiyamTgBot?startgroup=true" }
                        ]
                    ]
                }
            };

            global.xnxSession = global.xnxSession || {};
            global.xnxSession[chatId] = { results, query, base };

            if (v.thumbnail) {
                try {
                    return await bot.sendPhoto(chatId, v.thumbnail, {
                        caption: replyText,
                        reply_to_message_id: messageId,
                        ...inlineKeyboard
                    });
                } catch (e) {}
            }

            return await bot.sendMessage(chatId, replyText, {
                reply_to_message_id: messageId,
                ...inlineKeyboard
            });

        } catch (err) {
            return bot.sendMessage(chatId, `❌ 𝚃𝙾𝚃𝙷𝚈 𝙰𝙽𝚃𝙴 𝚂𝙾𝙼𝙾𝚂𝚂𝙰 𝙷𝙾𝚈𝙴𝙲𝙷𝙴!`, {
                reply_to_message_id: messageId
            });
        }
    }
};

module.exports.handleCallbackQuery = async (bot, query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (!data.startsWith("xnx_")) return;

    const session = global.xnxSession && global.xnxSession[chatId];
    if (!session) {
        return bot.answerCallbackQuery(query.id, { text: "𝚂𝙴𝚂𝚂𝙸𝙾𝙽 𝙴𝚇𝙿𝙸𝚁𝙴𝙳!", show_alert: true });
    }

    const { results, base } = session;

    if (data.startsWith("xnx_next_")) {
        let nextIndex = parseInt(data.split("_")[2]);
        if (nextIndex >= results.length) {
            nextIndex = 0; 
        }

        const v = results[nextIndex];

        const replyText = 
`🔍 𝚂𝙴𝙰𝚁𝙲𝙷 𝚀𝚄𝙴𝚁𝚈: ${session.query}
━━━━━━━━━━━━━━━━━━
🎬 𝚃𝙸𝚃𝙻𝙴: ${v.title}
⏱️ 𝙳𝚄𝚁𝙰𝚃𝙸𝙾𝙽: ${v.duration || 'N/A'}
👀 𝚅𝙸𝙴𝚆𝚂: ${v.views || 'N/A'}
📄 𝙿𝙰𝙶𝙴: ${nextIndex + 1}/${results.length}
━━━━━━━━━━━━━━━━━━
🖌️ 𝙲𝚁𝙴𝙰𝚃𝙴𝙳 𝙱𝚈: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

        const inlineKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "📥 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳", callback_data: `xnx_dl_${nextIndex}_${encodeURIComponent(v.link)}` },
                        { text: "⏭️ 𝙽𝙴𝚇𝚃", callback_data: `xnx_next_${nextIndex + 1}` }
                    ],
                    [
                        { text: "𝙾𝚆𝙽𝙴𝚁", url: "https://t.me/ri_siyam" },
                        { text: "𝙰𝙳𝙳 𝙱𝙾𝚃", url: "https://t.me/SiyamTgBot?startgroup=true" }
                    ]
                ]
            }
        };

        try {
            if (v.thumbnail) {
                await bot.editMessageMedia({
                    type: 'photo',
                    media: v.thumbnail,
                    caption: replyText
                }, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: inlineKeyboard.reply_markup
                });
            } else {
                await bot.editMessageText(replyText, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: inlineKeyboard.reply_markup
                });
            }
        } catch (e) {}

        await bot.answerCallbackQuery(query.id);
    }

    if (data.startsWith("xnx_dl_")) {
        const parts = data.split("_");
        const link = decodeURIComponent(parts.slice(3).join("_"));

        await bot.answerCallbackQuery(query.id, { text: "📥 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 𝚅𝙸𝙳𝙴𝙾... 𝙿𝙻𝙴𝙰𝚂𝙴 𝚆𝙰𝙸𝚃." });

        try {
            const dlRes = await axios.get(`${base}/xnxdl?url=${encodeURIComponent(link)}`);
            const resData = dlRes.data.result;
            const videoUrl = resData.files.high || resData.files.low;

            const cachePath = path.join(process.cwd(), 'cache');
            if (!fs.existsSync(cachePath)) fs.ensureDirSync(cachePath);
            const filePath = path.join(cachePath, `vid_siyam_${Date.now()}.mp4`);

            const vidData = await axios.get(videoUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(filePath, Buffer.from(vidData.data));

            const caption = 
`━━━━━━━━━━━━━━━━━━
🎬 𝚃𝙸𝚃𝙻𝙴: ${resData.title}
⏱️ 𝙳𝚄𝚁𝙰𝚃𝙸𝙾𝙽: ${resData.duration || 'N/A'}
👀 𝙸𝙽𝙵𝙾: ${resData.info || 'N/A'}
━━━━━━━━━━━━━━━━━━
✅ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝚂𝚄𝙲𝙲𝙴𝚂𝚂!
🖌️ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

            const inlineKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "𝙾𝚆𝙽𝙴𝚁", url: "https://t.me/ri_siyam" },
                            { text: "𝙰𝙳𝙳 𝙱𝙾𝚃", url: "https://t.me/SiyamTgBot?startgroup=true" }
                        ]
                    ]
                }
            };

            await bot.sendVideo(chatId, fs.createReadStream(filePath), {
                caption: caption,
                ...inlineKeyboard
            });

            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        } catch (e) {
            await bot.sendMessage(chatId, `❌ 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝙺𝙾𝚁𝚃𝙴 𝚂𝙾𝙼𝙾𝚂𝚂𝙰 𝙷𝙾𝚈𝙴𝙲𝙷𝙴!`);
        }
    }
};
