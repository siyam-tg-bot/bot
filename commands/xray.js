const fs = require("fs-extra");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

const XRAY_URL = "https://i.ibb.co.com/bRYqX9ms/Picsart-26-05-17-11-24-23-181.jpg";

module.exports = {
    name: "xray",
    version: "1.0.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    category: "fun",
    shortDescription: "𝚂𝙷𝙾𝚆 𝚂𝙾𝙼𝙴𝙾𝙽𝙴'𝚂 𝚇𝚁𝙰𝚈",
    longDescription: "𝙿𝚁𝙾𝚅𝙸𝙳𝙴𝚂 𝙰𝙽 𝚇𝚁𝙰𝚈 𝙴𝙵𝙵𝙴𝙲𝚃 𝙾𝙵 𝙰𝙽𝚈 𝙼𝙴𝙽𝚃𝙸𝙾𝙽𝙴𝙳 𝙾𝚁 𝚁𝙴𝙿𝙻𝙸𝙴𝙳 𝚄𝚂𝙴𝚁.",
    guide: "xray @mention or reply to a message",

    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        const repliedUser = msg.reply_to_message ? msg.reply_to_message.from.id : null;
        const mentionedUser = msg.entities && msg.entities.find(e => e.type === "text_mention") ? msg.entities.find(e => e.type === "text_mention").user.id : null;
        
        let targetUser = repliedUser || mentionedUser;

        if (!targetUser && args.length > 0) {
            targetUser = args[0].replace("@", "");
        }

        if (!targetUser) {
            return bot.sendMessage(chatId, `⚠️ 𝙳𝙾𝚈𝙰 𝙺𝙾𝚁𝙴 𝙺𝙾𝙽𝙾 𝚄𝚂𝙴𝚁𝙺𝙴 𝙼𝙴𝙽𝚃𝙸𝙾𝙽 𝙺𝙾𝚁𝚄𝙽 𝙾𝚃𝙷𝙾𝙱𝙰 𝚁𝙴𝙿𝙻𝚈 𝙳𝙸𝙽!`, {
                reply_to_message_id: messageId
            });
        }

        try {
            const ts = Date.now();
            const basePath = __dirname + "/cache/xray_base_" + ts + ".jpg";
            const outputPath = __dirname + "/cache/xray_out_" + ts + ".jpg";

            fs.ensureDirSync(__dirname + "/cache");

            let userProfilePhotos;
            try {
                userProfilePhotos = await bot.getUserProfilePhotos(targetUser, { limit: 1 });
            } catch (e) {
                return bot.sendMessage(chatId, `❌ 𝚄𝚂𝙴𝚁 𝙿𝚁𝙾𝙵𝙸𝙻𝙴 𝙿𝙷𝙾𝚃𝙾 𝙿𝙰𝚆𝙰 𝙺𝙾𝚈𝙽𝙸!`, {
                    reply_to_message_id: messageId
                });
            }

            if (!userProfilePhotos || userProfilePhotos.total_count === 0) {
                return bot.sendMessage(chatId, `❌ 𝚄𝚂𝙴𝚁𝙴𝚁 𝙺𝙾𝙽𝙾 𝙿𝚁𝙾𝙵𝙸𝙻𝙴 𝙿𝙷𝙾𝚃𝙾 𝙽𝙰𝙸!`, {
                    reply_to_message_id: messageId
                });
            }

            const fileId = userProfilePhotos.photos[0][userProfilePhotos.photos[0].length - 1].file_id;
            const fileLink = await bot.getFileLink(fileId);

            const [baseRes, avatarRes] = await Promise.all([
                axios.get(XRAY_URL, { responseType: "arraybuffer" }),
                axios.get(fileLink, { responseType: "arraybuffer" })
            ]);

            fs.writeFileSync(basePath, Buffer.from(baseRes.data));
            const avatarBuffer = Buffer.from(avatarRes.data);

            const baseImg = await loadImage(basePath);
            const avatarImg = await loadImage(avatarBuffer);

            const W = baseImg.width;
            const H = baseImg.height;
            const canvas = createCanvas(W, H);
            const ctx = canvas.getContext("2d");

            ctx.drawImage(baseImg, 0, 0, W, H);

            const frameX = 1000, frameY = 0, frameW = 1000, frameH = 2000;

            ctx.save();
            ctx.beginPath();
            ctx.rect(frameX, frameY, frameW, frameH);
            ctx.clip();
            ctx.drawImage(avatarImg, frameX, frameY, frameW, frameH);
            ctx.restore();

            fs.writeFileSync(outputPath, canvas.toBuffer("image/jpeg", { quality: 0.92 }));

            const inlineKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "👑 𝙾𝚆𝙽𝙴𝚁", url: "https://t.me/ri_siyam" },
                            { text: "🤖 𝙰𝙳𝙳 𝙱𝙾𝚃", url: "https://t.me/SiyamTgBot?startgroup=true" }
                        ]
                    ]
                }
            };

            await bot.sendPhoto(chatId, fs.createReadStream(outputPath), {
                reply_to_message_id: messageId,
                ...inlineKeyboard
            });

            [basePath, outputPath].forEach(p => { try { fs.unlinkSync(p); } catch (_) {} });

        } catch (err) {
            console.error("XRay Error:", err);
            return bot.sendMessage(chatId, `❌ 𝙺𝙰𝙹 𝙺𝙾𝚁𝚃𝙴 𝚂𝙾𝙼𝙾𝚂𝚂𝙰 𝙷𝙾𝚈𝙴𝙲𝙷𝙴!`, {
                reply_to_message_id: messageId
            });
        }
    }
};
