require('dotenv').config();

module.exports = {
    botToken: process.env.BOT_TOKEN || '8664273023:AAEu9ICybK8hzbfQNBDNhUR-ADwjreagawI',
    prefix: ',',
    ownerID: '7683797493', 
    
    adminIDs: [
        '7683797493',
        '8442705755'
    ],

    modIDs: [],

    whitelistMode: {
        enable: false,
        whiteListIds: [
            '8442705755',
            '7683797493'
        ]
    }
};
