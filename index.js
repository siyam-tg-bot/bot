const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');

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
                    const command = require(filePath);
                    registerCommand(command);
                    console.log(`Loaded ${label}: [${command.name || command.config?.name || file}]`);
                } catch (error) {
                    console.error(`Error loading ${file} from ${label}:`, error.message);
                }
            }
        }
    };

    loadFromDirectory(commandsDir, 'commands');
    loadFromDirectory(privateDir, 'private');
}

loadAllModules();

function getUserRole(userId) {
    if (userId === config.ownerID || (config.adminIDs && config.adminIDs.includes(userId))) return 2;
    if (config.modIDs && config.modIDs.includes(userId)) return 1;
    return 0;
}

bot.on('message', async (msg) => {
    try {
        if (!msg || !msg.chat) return;
        const text = msg.text ? msg.text.trim() : '';
        const chatId = msg.chat.id;
        const userId = msg.from ? msg.from.id : 0;
        const userRole = getUserRole(userId);

        if (!text) return;
        const currentPrefix = config.prefix !== undefined ? config.prefix : '/';

        if (text === '/start' || text === `${currentPrefix}start`) {
            return bot.sendMessage(chatId, `Welcome to Telegram Bot!\n\nAll Commands: ${currentPrefix}help`);
        }

        let isCommand = false;
        let commandText = '';

        if (text.startsWith('/')) {
            isCommand = true;
            commandText = text.slice(1);
        } else if (currentPrefix !== '' && text.startsWith(currentPrefix)) {
            isCommand = true;
            commandText = text.slice(currentPrefix.length);
        }

        if (isCommand) {
            const args = commandText.split(/ +/);
            const inputCommand = args.shift().toLowerCase();
            if (!inputCommand) return;

            const actualCommandName = commands.has(inputCommand) ? inputCommand : aliases.get(inputCommand);

            if (actualCommandName && commands.has(actualCommandName)) {
                const command = commands.get(actualCommandName);
                const requiredRole = command.role !== undefined ? command.role : (command.config?.role !== undefined ? command.config.role : 0);

                if (userRole < requiredRole) {
                    return bot.sendMessage(chatId, `❌ এই কমান্ডটি ব্যবহারের আপনার অনুমতি নেই!`);
                }

                try {
                    const execFunc = command.execute || command.onStart;
                    return await execFunc({
                        bot,
                        msg,
                        args,
                        role: userRole,
                        prefix: currentPrefix,
                        commandName: actualCommandName
                    });
                } catch (error) {
                    console.error(`Error executing ${actualCommandName}:`, error);
                    return bot.sendMessage(chatId, '⚠️ কমান্ডটি রান করার সময় একটি সমস্যা হয়েছে!');
                }
            } else {
                return bot.sendMessage(chatId, `❌ কমান্ডটি পাওয়া যায়নি! সব কমান্ড দেখতে লিখে পাঠান: ${currentPrefix}help`);
            }
        }
    } catch (err) {
        console.error("Global Error:", err.message);
    }
});

console.log('Telegram Bot Engine Active and Ready!');
