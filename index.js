const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');

global.activeReplies = new Map();
global.telegramPendingChats = [];

process.on('uncaughtException', (err) => {
    console.error('Crash Prevented - Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Crash Prevented - Unhandled Rejection:', reason);
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
    const cmdName = command.name || command.config?.name;
    const cmdExecute = command.execute || command.onStart;

    if (cmdName && typeof cmdExecute === 'function') {
        const lowerName = cmdName.toLowerCase();
        commands.set(lowerName, command);

        const aliasList = command.aliases || command.config?.aliases;
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
                    console.error(`Error loading ${file} from ${label}:`, error.message);
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

const userRequestCounts = new Map();

bot.on('message', async (msg) => {
    try {
        if (!msg || !msg.chat) return;
        const text = msg.text ? msg.text.trim() : (msg.caption ? msg.caption.trim() : '');
        const chatId = msg.chat.id;
        const userId = msg.from ? msg.from.id : 0;
        const userRole = getUserRole(userId);

        if (!text) return;

        const now = Date.now();
        if (!userRequestCounts.has(userId)) {
            userRequestCounts.set(userId, { count: 1, startTime: now });
        } else {
            const userData = userRequestCounts.get(userId);
            if (now - userData.startTime < 60000) {
                userData.count++;
                if (userData.count > 30) {
                    return bot.sendMessage(chatId, "⚠️ 𝗧𝗢𝗢 𝗠𝗔𝗡𝗬 𝗥𝗘𝗤𝗨𝗘𝗦𝗧𝗦 𝗜𝗡 𝗧𝗛𝗘 𝗟𝗔𝗦𝗧 𝗠𝗜𝗡𝗨𝗧𝗘. 𝗣𝗟𝗘𝗔𝗦𝗘 𝗧𝗥𝗬 𝗔𝗚𝗔𝗜𝗡 𝗟𝗔𝗧𝗘𝗥.");
                }
            } else {
                userData.count = 1;
                userData.startTime = now;
            }
        }

        const args = text.split(/ +/);
        const firstWord = args.shift().toLowerCase();

        const actualCommandName = commands.has(firstWord) ? firstWord : aliases.get(firstWord);

        if (actualCommandName && commands.has(actualCommandName)) {
            const command = commands.get(actualCommandName);
            const requiredRole = command.role !== undefined ? command.role : 0;

            if (userRole < requiredRole) {
                return bot.sendMessage(chatId, "❌ 𝗬𝗢𝗨 𝗗𝗢 𝗡𝗢𝗧 𝗛𝗔𝗩𝗘 𝗣𝗘𝗥𝗠𝗜𝗦𝗦𝗜𝗢𝗡 𝗧𝗢 𝗨𝗦𝗘 𝗧𝗛𝗜𝗦 𝗖𝗢𝗠𝗠𝗔𝗡𝗗!\n\nMY BOSS SIYAM ONLY");
            }

            try {
                if (typeof command.execute === 'function') {
                    return await command.execute(bot, msg, args);
                }
            } catch (error) {
                console.error(`Error executing ${actualCommandName}:`, error);
                return bot.sendMessage(chatId, "❌ 𝗔𝗡 𝗘𝗥𝗥𝗢𝗥 𝗢𝗖𝗖𝗨𝗥𝗥𝗘𝗗:\n\nError executing command!");
            }
        } else {
            if (text.startsWith('/')) {
                return bot.sendMessage(chatId, "⚠️ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗! 𝗣𝗟𝗘𝗔𝗦𝗘 𝗖𝗛𝗘𝗖𝗞 𝗬𝗢𝗨𝗥 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗢𝗥 𝗧𝗬𝗣𝗘 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦.");
            }
        }

    } catch (err) {
        console.error("Global Error:", err.message);
        try {
            await bot.sendMessage(msg.chat.id, "❌ 𝗦𝗘𝗥𝗩𝗘𝗥 𝗘𝗥𝗥𝗢𝗥, 𝗣𝗟𝗘𝗔𝗦𝗘 𝗧𝗥𝗬 𝗔𝗚𝗔𝗜𝗡 𝗟𝗔𝗧𝗘𝗥!");
        } catch (e) {}
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
