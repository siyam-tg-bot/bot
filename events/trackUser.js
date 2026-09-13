const database = require('../database');

module.exports = (bot) => {
  bot.on('message', (msg) => {
    try {
      if (!msg || !msg.from) return;

      const userId = String(msg.from.id);
      const username = msg.from.username || "Unknown";
      const firstName = msg.from.first_name || "";

      let db = database.getData();
      if (!db.users) db.users = {};

      if (!db.users[userId]) {
        db.users[userId] = {
          username: username,
          firstName: firstName,
          joinedAt: new Date().toISOString()
        };
        database.saveData(db);
      }
    } catch (err) {}
  });
};
