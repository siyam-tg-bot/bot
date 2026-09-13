const fs = require('fs');
const path = require('path');

module.exports = (bot) => {
    const cacheDir = path.join(__dirname, '..', 'cache');
    
    setInterval(() => {
        if (fs.existsSync(cacheDir)) {
            fs.readdir(cacheDir, (err, files) => {
                if (!err && files) {
                    files.forEach(file => {
                        const filePath = path.join(cacheDir, file);
                        fs.stat(filePath, (err, stats) => {
                            if (!err && (Date.now() - stats.mtimeMs > 3600000)) {
                                fs.unlink(filePath, () => {});
                            }
                        });
                    });
                }
            });
        }
    }, 3600000);
};
