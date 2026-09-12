const { writeFileSync } = require("fs-extra");
const moment = require("moment-timezone");
const path = require("path");
const config = require("../config"); 

module.exports = {
	name: "wl",
	version: "2.0",
	author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
	role: 2, 
	category: "owner",

	langs: {
		en: {
			added: "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ✅ 𝐀𝐝𝐝𝐞𝐝:\n%1\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧",
			removed: "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ✅ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝:\n%1\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧",
			listAdmin: "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» 👑 𝐖𝐡𝐢𝐭𝐞𝐋𝐢𝐬𝐭 𝐔𝐬𝐞𝐫𝐬:\n%1\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧",
			missingIdAdd: "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ⚠️ 𝐆𝐢𝐯𝐞 𝐈𝐃 𝐨𝐫 𝐭𝐚𝐠!\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧",
			missingIdRemove: "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ⚠️ 𝐆𝐢𝐯𝐞 𝐈𝐃 𝐨𝐫 𝐭𝐚𝐠!\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧"
		}
	},

	onStart: async function ({ bot, msg, args, getLang }) {
		const chatId = msg.chat.id;
		const configPath = path.join(__dirname, "../config.json"); 

		switch (args[0]) {
			case "add":
			case "-a": {
				if (!args[1] && !msg.reply_to_message) return bot.sendMessage(chatId, getLang("missingIdAdd"));

				let uids = [];
				if (msg.reply_to_message && msg.reply_to_message.from) {
					uids.push(String(msg.reply_to_message.from.id));
				} else {
					uids = args.slice(1).filter(arg => !isNaN(arg));
				}

				if (!config.whitelistMode) config.whitelistMode = { enable: false, whiteListIds: [] };
				if (!config.whitelistMode.whiteListIds) config.whitelistMode.whiteListIds = [];

				const added = [];

				for (const uid of uids) {
					if (!config.whitelistMode.whiteListIds.includes(uid)) {
						config.whitelistMode.whiteListIds.push(uid);
						added.push(uid);
					}
				}

				try { writeFileSync(configPath, JSON.stringify(config, null, 2)); } catch(e) { console.log("Config save error", e) }

				const names = added.map(uid => `• [User](tg://user?id=${uid}) (${uid})`);
				return bot.sendMessage(chatId, getLang("added", names.join("\n")), { parse_mode: "Markdown" });
			}

			case "remove":
			case "-r": {
				if (!args[1] && !msg.reply_to_message) return bot.sendMessage(chatId, getLang("missingIdRemove"));

				let uids = [];
				if (msg.reply_to_message && msg.reply_to_message.from) {
					uids.push(String(msg.reply_to_message.from.id));
				} else {
					uids = args.slice(1).filter(arg => !isNaN(arg));
				}

				if (!config.whitelistMode) config.whitelistMode = { enable: false, whiteListIds: [] };
				if (!config.whitelistMode.whiteListIds) config.whitelistMode.whiteListIds = [];

				const removed = [];

				for (const uid of uids) {
					if (config.whitelistMode.whiteListIds.includes(uid)) {
						config.whitelistMode.whiteListIds.splice(config.whitelistMode.whiteListIds.indexOf(uid), 1);
						removed.push(uid);
					}
				}

				try { writeFileSync(configPath, JSON.stringify(config, null, 2)); } catch(e) { console.log("Config save error", e) }

				const names = removed.map(uid => `• [User](tg://user?id=${uid}) (${uid})`);
				return bot.sendMessage(chatId, getLang("removed", names.join("\n")), { parse_mode: "Markdown" });
			}

			case "list":
			case "-l": {
				if (!config.whitelistMode || !config.whitelistMode.whiteListIds || config.whitelistMode.whiteListIds.length === 0) {
					return bot.sendMessage(chatId, getLang("listAdmin", "No users found."));
				}

				const names = config.whitelistMode.whiteListIds.map(uid => `• [User](tg://user?id=${uid}) (${uid})`);
				return bot.sendMessage(chatId, getLang("listAdmin", names.join("\n")), { parse_mode: "Markdown" });
			}

			case "on": {
				if (!config.whitelistMode) config.whitelistMode = { enable: false, whiteListIds: [] };
				config.whitelistMode.enable = true;
				try { writeFileSync(configPath, JSON.stringify(config, null, 2)); } catch(e) { console.log("Config save error", e) }

				const time = moment().tz("Asia/Dhaka").format("hh:mm A");
				const date = moment().tz("Asia/Dhaka").format("DD MMMM YYYY");
				const textMsg = `👑  𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍  👑\n\n𝐖𝐇𝐈𝐓𝐄 𝐋𝐈𝐒𝐓 𝐌𝐎𝐃𝐄 𝐄𝐍𝐀𝐁𝐋𝐄𝐃\n\n🔐  𝐀𝐂𝐂𝐄𝐒𝐒 :\n   🐸এখন শুধু আমার বস সিয়াম🪬\n   বট ব্যবহার করতে পারবে 👑\n\n📅  𝐃𝐚𝐭𝐞 : ${date}\n⏰  𝐓𝐢𝐦𝐞 : ${time}\n\n👑  𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓 𝐁𝐎𝐓  👑`;
				return bot.sendMessage(chatId, textMsg);
			}

			case "off": {
				if (!config.whitelistMode) config.whitelistMode = { enable: false, whiteListIds: [] };
				config.whitelistMode.enable = false;
				try { writeFileSync(configPath, JSON.stringify(config, null, 2)); } catch(e) { console.log("Config save error", e) }

				const time = moment().tz("Asia/Dhaka").format("hh:mm A");
				const date = moment().tz("Asia/Dhaka").format("DD MMMM YYYY");
				const textMsg = `👑  𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍  👑\n\n𝐖𝐇𝐈𝐓𝐄 𝐋𝐈𝐒𝐓 𝐌𝐎𝐃𝐄 𝐃𝐈𝐒𝐀𝐁𝐋𝐄𝐃\n\n🌐  𝐀𝐂𝐂𝐄𝐒𝐒 :\n   এখন সবাই বট ব্যবহার🪬\n   করতে পারবে 🎉\n\n📅  𝐃𝐚𝐭𝐞 : ${date}\n⏰  𝐓𝐢𝐦𝐞 : ${time}\n\n👑  𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓 𝐁𝐎𝐓  👑`;
				return bot.sendMessage(chatId, textMsg);
			}

			default:
				return bot.sendMessage(chatId, "Invalid command usage! Use: wl add/remove/list/on/off");
		}
	}
};
