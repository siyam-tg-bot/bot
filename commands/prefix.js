const config = require("../config");

module.exports = {
  name: "prefix",
  aliases: ["pfx"],
  version: "1.0.6",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "system",
  usePrefix: false,
  shortDescription: "Shows current bot prefix and system info",
  longDescription: "Displays the active prefix, total loaded commands, and status with interactive buttons.",
  guide: "prefix",

  execute: async (bot, msg, args, { prefix: currentPrefix }) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let botUsername = "SiyamTgBot";
    try {
      const me = await bot.getMe();
      if (me && me.username) {
        botUsername = me.username;
      }
    } catch (e) {
      botUsername = config.botUsername || "SiyamTgBot";
    }

    const ownerUsername = config.ownerUsername || "ri_siyam";
    const supportGroup = config.supportGroup || "SiyamSupport";

    let totalCommands = 0;
    if (bot.commands) {
      totalCommands = bot.commands.size || bot.commands.length || Object.keys(bot.commands).length || 0;
    }

    const convertToBold = (text) => {
      const charMap = {
        'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉','K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓','U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
        'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣','k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭','u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳',
        '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗'
      };
      return String(text).split('').map(c => charMap[c] || c).join('');
    };

    const activePrefix = currentPrefix || "/";
    const boldPrefix = convertToBold(activePrefix);
    const boldTotalCmds = convertToBold(totalCommands);

    const responseText = `👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
🆔 𝐏𝐑𝐄𝐅𝐈𝐗 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
───────────────
💬 𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐏𝐑𝐄𝐅𝐈𝐗: [ ${boldPrefix} ]
📊 𝐓𝐎𝐓𝐀𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒: ${boldTotalCmds}
⚡ 𝐒𝐓𝐀𝐓𝐔𝐒: 𝐎𝐍𝐋𝐈𝐍𝐄
───────────────
⚡ 𝐁𝐘: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

    return bot.sendMessage(chatId, responseText, {
      reply_to_message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
            { text: "📜 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓", callback_data: "cmd_list" }
          ],
          [
            { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${ownerUsername}` },
            { text: "🤝 𝐒𝐔𝐏𝐏𝐎𝐑𝐓", url: `https://t.me/${supportGroup}` }
          ]
        ]
      }
    });
  }
};
