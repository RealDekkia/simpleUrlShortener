const crypto = require('crypto');
console.log(crypto.pbkdf2Sync("dekkia", name, 1, 200, 'SHA512'));
