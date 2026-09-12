module.exports = {
  name: "uid",
  aliases: ["id", "userinfo"],
  version: "1.0.3",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "info",
  shortDescription: "Get user Telegram ID cleanly",
  longDescription: "Sends user ID and basic info in bold English font without markdown.",
  guide: "/uid",

  execute: async (bot, msg, args) => {
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

    return bot.sendMessage(chatId, text, {
      reply_to_message_id: messageId
    });
  }
};
