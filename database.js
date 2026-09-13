const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'database.json');

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ users: {}, groups: {} }, null, 2));
}

module.exports = {
  getData: () => {
    try {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return { users: {}, groups: {} };
    }
  },
  saveData: (data) => {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch (e) {
      return false;
    }
  }
};
