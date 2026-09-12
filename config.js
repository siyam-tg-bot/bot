require('dotenv').config();

module.exports = {
    botToken: process.env.BOT_TOKEN || '8664273023:AAEu9ICybK8hzbfQNBDNhUR-ADwjreagawI',
    prefix: ',',
    ownerID: 8442705758,
    
    adminIDs: [
        7683797493,
        8442705758, 
        9876543210
    ],

    modIDs: [],

    whitelistMode: {
        enable: false,
        whiteListIds: [
            "8442705758"
        ]
    }
};
