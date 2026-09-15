const { execSync } = require('child_process');

function ensurePackage(packageName) {
    try {
        require.resolve(packageName);
    } catch (e) {
        console.log(`[Auto-Install] Installing missing package: ${packageName}...`);
        try {
            execSync(`npm install ${packageName}`, { stdio: 'inherit' });
            console.log(`[Auto-Install] Successfully installed ${packageName}`);
        } catch (err) {
            console.error(`[Auto-Install] Failed to install ${packageName}:`, err.message);
        }
    }
}

ensurePackage('canvas');
ensurePackage('axios');

const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
    config: {
        name: "namepic",
        version: "1.1",
        author: "SIYAM",
        role: 0,
        category: "utility",
        description: "Generate an image with user name automatically"
    },

    execute: async (bot, msg, args) => {
        try {
            const chatId = msg.chat.id;
            const messageId = msg.message_id;

            let targetName = args.join(" ");
            if (msg.reply_to_message && msg.reply_to_message.from) {
                targetName = msg.reply_to_message.from.first_name;
            }
            if (!targetName) {
                targetName = msg.from.first_name || "User";
            }

            const bgUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809";
            const response = await axios.get(bgUrl, { responseType: 'arraybuffer' });
            const background = await loadImage(response.data);

            const canvas = createCanvas(background.width, background.height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 70px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(targetName, canvas.width / 2, canvas.height / 2);

            const buffer = canvas.toBuffer("image/jpeg");

            await bot.sendPhoto(chatId, buffer, {
                caption: `✨ 𝗡𝗔𝗠𝗘: ${targetName}`,
                reply_to_message_id: messageId
            });

        } catch (err) {
            console.error("Namepic Error:", err.message);
            bot.sendMessage(msg.chat.id, "❌ সিয়াম ভাই, ছবি তৈরি করতে সমস্যা হয়েছে!", { reply_to_message_id: messageId });
        }
    }
};
