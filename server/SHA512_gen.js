const crypto = require('crypto');
console.log(crypto.pbkdf2Sync("password", "user", 1, 200, 'SHA512').toString("hex"));
