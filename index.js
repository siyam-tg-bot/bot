const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');

global.activeReplies = new Map();
global.telegramPendingChats = [];

process.on('uncaughtException', (err) => {
    console.error('Crash Prevented:', err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('Crash Prevented:', reason);
});

const token = config.botToken;

const bot = new TelegramBot(token, { 
    polling: {
        interval: 300,
        autoStart: true,
        params: { timeout: 10 }
    }
});

bot.on('polling_error', (error) => {
    console.log(`[Polling Error]: ${error.message}`);
});

const commands = new Map();
const aliases = new Map();
bot.commands = commands;
bot.aliases = aliases;

const commandsDir = path.join(__dirname, 'commands');
const eventsDir = path.join(__dirname, 'events');
const privateDir = path.join(__dirname, 'private');

[commandsDir, eventsDir, privateDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function registerCommand(command) {
    if (!command) return;
    
    const cmdName = command.name || (command.config && command.config.name);
    const hasExecution = typeof command.execute === 'function' || typeof command.onStart === 'function';

    if (cmdName && hasExecution) {
        const lowerName = cmdName.toLowerCase();
        commands.set(lowerName, command);

        const aliasList = command.aliases || (command.config && command.config.aliases);
        if (aliasList) {
            const list = Array.isArray(aliasList) ? aliasList : [aliasList];
            list.forEach(alias => {
                if (alias) aliases.set(alias.toLowerCase(), lowerName);
            });
        }
    }
}

function loadAllModules() {
    commands.clear();
    aliases.clear();

    const loadFromDirectory = (dirPath, label) => {
        if (!fs.existsSync(dirPath)) return;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            if (file.endsWith('.js')) {
                const filePath = path.join(dirPath, file);
                delete require.cache[require.resolve(filePath)];
                try {
                    const moduleExport = require(filePath);
                    if (label === 'events') {
                        if (typeof moduleExport === 'function') moduleExport(bot);
                    } else {
                        registerCommand(moduleExport);
                    }
                } catch (error) {
                    console.error(`Error loading ${file}:`, error.message);
                }
            }
        }
    };

    loadFromDirectory(commandsDir, 'commands');
    loadFromDirectory(privateDir, 'private');
    loadFromDirectory(eventsDir, 'events');
}

loadAllModules();

function getUserRole(userId) {
    const idStr = String(userId);
    if (idStr === String(config.ownerID) || (config.adminIDs && config.adminIDs.map(String).includes(idStr))) return 2;
    if (config.modIDs && config.modIDs.map(String).includes(idStr)) return 1;
    return 0;
}

bot.on('message', async (msg) => {
    try {
        if (!msg || !msg.chat) return;
        const text = msg.text ? msg.text.trim() : (msg.caption ? msg.caption.trim() : '');
        const chatId = msg.chat.id;
        const userId = msg.from ? String(msg.from.id) : "0";
        const userRole = getUserRole(userId);
        const currentPrefix = config.prefix !== undefined ? config.prefix : '/';

        for (const command of commands.values()) {
            if (typeof command.onChat === 'function') {
                try {
                    await command.onChat({ bot, msg });
                } catch (err) {
                    console.error("onChat Error:", err.message);
                }
            }
        }

        if (config.whitelistMode && config.whitelistMode.enable) {
            if (userRole < 2) {
                const whiteListIds = config.whitelistMode.whiteListIds || [];
                if (!whiteListIds.includes(userId)) {
                    return;
                }
            }
        }

        if (!text) return;

        if (text === currentPrefix) {
            const helpCommand = currentPrefix + "help";
            return bot.sendMessage(chatId, `📜 𝗧𝗛𝗘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗬𝗢𝗨 𝗔𝗥𝗘 𝗨𝗦𝗜𝗡𝗚 𝗗𝗢𝗘𝗦 𝗡𝗢𝗧 𝗘𝗫𝗜𝗦𝗧, 𝗧𝗬𝗣𝗘 \`${helpCommand}\` 𝗧𝗢 𝗦𝗘𝗘 𝗔𝗟𝗟 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦`, { parse_mode: "Markdown", reply_to_message_id: msg.message_id });
        }

        let args = [];
        let commandName = '';
        let hasPrefix = false;

        if (text.startsWith(currentPrefix)) {
            hasPrefix = true;
            const withoutPrefix = text.slice(currentPrefix.length).trim();
            args = withoutPrefix.split(/ +/);
            let rawCmd = args.shift().toLowerCase();
            commandName = rawCmd.includes('@') ? rawCmd.split('@')[0] : rawCmd;
        } else {
            if (userRole > 0) {
                const tempArgs = text.split(/ +/);
                const firstWord = tempArgs[0].toLowerCase();
                let cleanFirstWord = firstWord.includes('@') ? firstWord.split('@')[0] : firstWord;
                if (commands.has(cleanFirstWord) || aliases.has(cleanFirstWord)) {
                    args = tempArgs;
                    let rawCmd = args.shift().toLowerCase();
                    commandName = rawCmd.includes('@') ? rawCmd.split('@')[0] : rawCmd;
                    hasPrefix = true;
                }
            }
        }

        if (!hasPrefix) return;

        if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
            if (userRole < 2) {
                const isPending = global.telegramPendingChats && global.telegramPendingChats.some(c => c.id === chatId);
                if (isPending) {
                    const groupTitle = msg.chat.title || "Unknown Group";
                    const notApprovedText = 
`╭━❮ 𝐒𝐍𝐂-𝐁𝐎𝐓 ❯━╮
├═━═━═━═━═━═━══━═
├‣ ❌ 𝗡𝗢𝗧 𝗔𝗣𝗥𝗢𝗩𝗘𝗗
├‣ 📛 𝗚𝗿𝗼𝘂𝗽: ${groupTitle}
├‣ 🆔 𝗜𝗗: ${chatId}
├═━═━═━═━═━═━═━═
├‣ ⚠️ Approval Needed!
╰━═━═━═━═━═━═━═━╯`;

                    return bot.sendMessage(chatId, notApprovedText, {
                        reply_to_message_id: msg.message_id,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "👑 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }]
                            ]
                        }
                    });
                }
            }
        }

        const actualCommandName = commands.has(commandName) ? commandName : aliases.get(commandName);

        if (!actualCommandName || !commands.has(actualCommandName)) {
            const helpCommand = currentPrefix + "help";
            return bot.sendMessage(chatId, `🔎 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 "${commandName}" 𝗗𝗢𝗘𝗦 𝗡𝗢𝗧 𝗘𝗫𝗜𝗦𝗧, 𝗧𝗬𝗣𝗘 \`${helpCommand}\` 𝗧𝗢 𝗦𝗘𝗘 𝗔𝗟𝗟 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦`, { parse_mode: "Markdown", reply_to_message_id: msg.message_id });
        }

        const command = commands.get(actualCommandName);
        const cmdRole = command.role !== undefined ? command.role : (command.config && command.config.role !== undefined ? command.config.role : 0);

        if (userRole < cmdRole) {
            return bot.sendMessage(chatId, "𝐌𝐘 𝐁𝐎𝐒𝐒 𝐒𝐈𝐘𝐀𝐌 𝐎𝐍𝐋𝐘", { reply_to_message_id: msg.message_id });
        }

        try {
            if (typeof command.execute === 'function') {
                return await command.execute(bot, msg, args);
            } else if (typeof command.onStart === 'function') {
                return await command.onStart({ bot, msg, args });
            }
        } catch (error) {
            console.error(`Error executing ${actualCommandName}:`, error.message);
            return bot.sendMessage(chatId, `❌ সিয়াম ভাই, কমান্ড রান করতে সমস্যা হইছে!`, { reply_to_message_id: msg.message_id });
        }

    } catch (err) {
        console.error("Global Error:", err.message);
    }
});

bot.on('callback_query', async (query) => {
    try {
        if (bot.commands.has('cmd')) {
            const cmdModule = bot.commands.get('cmd');
            if (typeof cmdModule.handleCallback === 'function') {
                await cmdModule.handleCallback(bot, query);
            }
        }

        for (const command of commands.values()) {
            if (typeof command.onCallbackQuery === 'function') {
                await command.onCallbackQuery(bot, query);
            }
        }
    } catch (err) {
        console.error("Callback Query Error:", err.message);
    }
});

console.log('Telegram Bot Engine Active and Ready!');
