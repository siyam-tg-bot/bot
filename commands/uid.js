const { createCanvas, loadImage } = require('canvas');

module.exports = {
  name: "uid",
  aliases: ["id", "userinfo"],
  version: "1.0.3",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "info",
  shortDescription: "Get user Telegram ID cleanly with a Card",
  longDescription: "Sends user ID and basic info in bold English font with a beautiful canvas card.",
  guide: "/uid2",

  execute: async (bot, msg, args) => {
    try {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        let targetUser = msg.from;
        
        if (msg.reply_to_message && msg.reply_to_message.from) {
          targetUser = msg.reply_to_message.from;
        }

        const userId = targetUser.id;
        const firstName = targetUser.first_name || "𝐔𝐒𝐄𝐑";
        const lastName = targetUser.last_name ? " " + targetUser.last_name : "";
        const fullName = firstName + lastName;
        const username = targetUser.username ? "@" + targetUser.username : "𝐍𝐎𝐍𝐄";

        const convertToBold = (text) => {
          const charMap = {
            'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉','K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓','U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
            'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣','k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭','u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳',
            '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗'
          };
          return text.split('').map(c => charMap[c] || c).join('');
        };

        const boldName = convertToBold(fullName);
        const boldUsername = convertToBold(username);
        const boldUserId = convertToBold(String(userId));

        const text = `👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
🆔 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
───────────────
👤 𝐍𝐀𝐌𝐄: ${boldName}
🏷️ 𝐔𝐒𝐄𝐑𝐍𝐀𝐌𝐄: ${boldUsername}
🆔 𝐔𝐒𝐄𝐑 𝐈𝐃: ${boldUserId}
───────────────
⚡ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

        // Canvas Card Generate করা হচ্ছে
        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext('2d');

        // ১. ডার্ক ব্যাকগ্রাউন্ড
        ctx.fillStyle = '#0b0b1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ২. চার রঙের লাইটিং বর্ডার (গোলাপি, বেগুনি, সায়ান, হলুদ)
        ctx.lineWidth = 15;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff007a'); 
        gradient.addColorStop(0.33, '#7000ff'); 
        gradient.addColorStop(0.66, '#00e5ff'); 
        gradient.addColorStop(1, '#ffea00'); 

        ctx.strokeStyle = gradient;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        ctx.shadowBlur = 0; 

        // ৩. ইউজারের প্রোফাইল পিকচার নিয়ে আসা
        let pfpUrl = "https://i.ibb.co/3WfK9R2/default-pfp.png"; 
        try {
            const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });
            if (photos.total_count > 0) {
                const fileId = photos.photos[0][0].file_id;
                pfpUrl = await bot.getFileLink(fileId);
            }
        } catch (e) {
            console.error("Profile picture fetch failed");
        }

        // ৪. ছবি গোল করা (Circular PFP)
        const pfpSize = 250;
        const pfpX = canvas.width / 2;
        const pfpY = 200;

        ctx.save();
        ctx.beginPath();
        ctx.arc(pfpX, pfpY, pfpSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const pfpImg = await loadImage(pfpUrl);
        ctx.drawImage(pfpImg, pfpX - pfpSize / 2, pfpY - pfpSize / 2, pfpSize, pfpSize);
        ctx.restore();

        // ৫. ছবির চারপাশে গোলাকার লাইটিং রিং
        ctx.beginPath();
        ctx.arc(pfpX, pfpY, pfpSize / 2, 0, Math.PI * 2);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // ৬. কার্ডের ভেতর রঙিন ও বড় ফন্টে নাম বসানো
        ctx.font = 'bold 55px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffea00';
        ctx.shadowColor = '#ffea00';
        ctx.shadowBlur = 10;
        ctx.fillText(fullName.substring(0, 25), canvas.width / 2, 420); 

        // ৭. কার্ডের ভেতর রঙিন আইডি বসানো
        ctx.font = 'bold 45px sans-serif';
        ctx.fillStyle = '#ff007a';
        ctx.shadowColor = '#ff007a';
        ctx.shadowBlur = 10;
        ctx.fillText(`ID: ${userId}`, canvas.width / 2, 500);

        const buffer = canvas.toBuffer("image/jpeg");

        // মেসেজ ও ছবি একসাথে পাঠানো
        return bot.sendPhoto(chatId, buffer, {
            caption: text,
            reply_to_message_id: messageId
        });

    } catch (err) {
        console.error("UID2 Error:", err.message);
        return bot.sendMessage(msg.chat.id, "❌ সিয়াম ভাই, কার্ড তৈরি করতে সমস্যা হয়েছে!", { reply_to_message_id: msg.message_id });
    }
  }
};
