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
                        console.log(`Loaded Event: [${file}]`);
                    } else {
                        registerCommand(moduleExport);
                        console.log(`Loaded ${label}: [${moduleExport.name || moduleExport.config?.name || file}]`);
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

bot.on('message', async (msg) => {
    try {
        if (!msg || !msg.chat) return;
        const text = msg.text ? msg.text.trim() : (msg.caption ? msg.caption.trim() : '');
        const chatId = msg.chat.id;
        const userId = msg.from ? msg.from.id : 0;
        const userRole = getUserRole(userId);
        const currentPrefix = config.prefix !== undefined ? config.prefix : '/';

        let isCommand = false;
        let commandText = '';

        if (text) {
            if (text.startsWith('/')) {
                isCommand = true;
                commandText = text.slice(1);
            } else if (currentPrefix !== '' && text.startsWith(currentPrefix)) {
                isCommand = true;
                commandText = text.slice(currentPrefix.length);
            }
        }

        if (isCommand) {
            const args = commandText.split(/ +/);
            const inputCommand = args.shift().toLowerCase();

            if (inputCommand) {
                const actualCommandName = commands.has(inputCommand) ? inputCommand : aliases.get(inputCommand);

                if (actualCommandName && commands.has(actualCommandName)) {
                    const command = commands.get(actualCommandName);
                    const requiredRole = command.role !== undefined ? command.role : (command.config?.role !== undefined ? command.config.role : 0);

                    if (userRole < requiredRole) {
                        return bot.sendMessage(chatId, `**𝗠𝗬 𝗕𝗢𝗦𝗦 𝗦𝗜𝗬𝗔𝗠 𝗢𝗡𝗟𝗬**`, { parse_mode: "Markdown" });
                    }

                    try {
                        if (typeof command.execute === 'function') {
                            return await command.execute(bot, msg, args);
                        } else if (typeof command.onStart === 'function') {
                            const getLang = command.langs && command.langs.en ? (key, val) => {
                                let txt = command.langs.en[key] || key;
                                if (val !== undefined) txt = txt.replace('%1', val);
                                return txt;
                            } : (key) => key;

                            return await command.onStart({
                                bot,
                                msg,
                                args,
                                role: userRole,
                                prefix: currentPrefix,
                                commandName: actualCommandName,
                                getLang
                            });
                        }
                    } catch (error) {
                        console.error(`Error executing ${actualCommandName}:`, error);
                        return bot.sendMessage(chatId, '⚠️ কমান্ডটি রান করার সময় একটি সমস্যা হয়েছে!');
                    }
                } else {
                    return bot.sendMessage(chatId, `❌ কমান্ডটি পাওয়া যায়নি! সব কমান্ড দেখতে লিখে পাঠান: ${currentPrefix}help`);
                }
            }
        }

        for (const command of commands.values()) {
            try {
                if (typeof command.onChat === 'function') {
                    await command.onChat({ bot, msg, role: userRole, prefix: currentPrefix });
                }

                if (msg.reply_to_message && typeof command.onReply === 'function') {
                    await command.onReply({ bot, msg, role: userRole, prefix: currentPrefix });
                }
            } catch (err) {
                console.error(`Error executing onChat/onReply in ${command.name || command.config?.name}:`, err.message);
            }
        }

    } catch (err) {
        console.error("Global Error:", err.message);
    }
});

bot.on('callback_query', async (callbackQuery) => {
    try {
        const data = callbackQuery.data;
        const qMsg = callbackQuery.message;
        const userId = callbackQuery.from.id;
        const userRole = getUserRole(userId);
        const currentPrefix = config.prefix !== undefined ? config.prefix : '/';

        if (data.startsWith("run_")) {
            const cmdToRun = data.replace("run_", "");
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: `Executing: ${currentPrefix}${cmdToRun}`,
                show_alert: false
            });

            const targetCmd = commands.get(cmdToRun);
            if (targetCmd && typeof targetCmd.execute === "function") {
                const fakeMsg = {
                    chat: qMsg.chat,
                    message_id: qMsg.message_id,
                    from: callbackQuery.from,
                    text: `${currentPrefix}${cmdToRun}`
                };
                return await targetCmd.execute(bot, fakeMsg, []);
            }
        }
    } catch (err) {
        console.error("Callback Query Error:", err);
    }
});

console.log('Telegram Bot Engine Active and Ready![cite: 4]');
```[cite: 4]
