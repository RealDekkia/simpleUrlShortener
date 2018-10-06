const http = require('http');
const sql = require('sql.js');
const fs = require('fs');
const express = require('express');
const crypto = require('crypto');
const url = require('url');

var logger = {
    write: function (text) {
        console.log(text);
    }
};

const app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});
app.use('/', express.static('../client/add'));

app.get('/api/add', function (req, res) {
    //Check if the User's session is valid:
    if (login.checkSession(req.headers.name, req.headers.sid)) {
        //check if url makes sense
        var regex = RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/);
        if (!regex.test(req.headers.long)) {
            res.status(400).send("noURL");
            return;
        } else {
            //Generate random hex-string and check if it already exists in the DB. Generate a new one if it does
            var hex = "";
            var inDb = true;
            while (inDb) {
                hex = rand_string(5);
                var x = db.quary("SELECT short FROM urls WHERE short=$short LIMIT 1", {
                    $short: hex
                }, "vals");
                inDb = false;
            };

            var now = new Date();

            //Save all into the db
            var y = db.quary("INSERT INTO urls(short, long, crDate, crIP) VALUES($short,$long,$date,$ip)", {
                $short: hex,
                $long: req.headers.long,
                $date: now.toISOString(),
                $ip: req.connection.remoteAddress
            }, "bool");

            if (y) {
                res.status(200).send(hex);
            } else {
                res.status(500).send("");
            }
        }
    } else {
        res.status(401).send("Unkonw Session-ID");
    }
});

app.get("/api/login", function (req, res) {
    var ret = login.checkPW(req.headers.name, req.headers.pw);


    if (ret === false) {
        res.status(401).send("Wrong Username or Password");
    } else {
        res.status(200).send(ret);
    }

});

http.createServer(app).listen(8000, '127.0.0.1');
logger.write('Server started local at Port 8000');

const appPublic = express();
appPublic.use('/', function (req, res) {
    if (req.url.length != 6) {
        res.status(400).send("unknownURl");
        return;
    }
    var x = db.quary("SELECT long FROM urls WHERE short=$short LIMIT 1", {
        $short: db.stringSqlPrepare(req.url.substring(1))
    }, "vals");
    if (x.length > 0) {
        //res.send("<script>window.open('" + encodeURI(x[0].long) + "', '_blank');</script>");
        res.send("<script>window.location.href = '" + encodeURI(x[0].long) + "';</script>");
        //res.redirect(x[0].long);
    } else {
        res.status(400).send("unknownURl");
    }
});
http.createServer(appPublic).listen(8001, '127.0.0.1');
logger.write('Public Server started local at Port 8001');

const dbDir = "database.db3";

var db = {
    db: undefined,
    stringSqlPrepare: function (str) {
        if (str != undefined && str != null) {
            //If an object is not a string: make it one
            if (typeof str !== 'string') str = str.toString();
            return str.replace(/</ig, '').replace(/;/ig, '').replace(/"/ig, '').replace(/'/ig, '').replace(/>/ig, '').replace(/\//ig, '');
        } else {
            return null;
        }
    },
    open: function () {
        if (db.db == undefined) {
            logger.write('Reading Database from disk..');
            var bfr = fs.readFileSync(dbDir);
            db.db = new sql.Database(bfr);
        }

        //Close database-connections if it wasn't used at all for 1 minute
        var dt = new Date().getTime();
        curDbId = dt;
        setTimeout(function () {
            if (dt == curDbId) {
                logger.write('Automatically closing database after 1 Minute...');
                db.close();
            }
        }, 60000);
    },
    close: function () {
        try {
            if (db.db != undefined) {
                var data = db.db.export();
                var buffer = new Buffer(data);
                logger.write('Writing Database to disk..');
                fs.writeFileSync(dbDir, buffer);
                db.db.close();
            }
        } catch (e) {
            logger.write(e);
        }
        db.db = undefined;
    },
    quary: function (quary, bindings, returnType) {
        db.open();
        try {
            var rows = [];
            if (returnType == "vals") {
                var stmt = db.db.prepare(quary);
                if (bindings) {
                    stmt.bind(bindings);
                }
                while (stmt.step()) {
                    var row = stmt.getAsObject();
                    rows.push(row);
                }
                stmt.reset();
                return rows;
            } else {
                if (bindings) {
                    db.db.run(quary, bindings);
                } else {
                    db.db.run(quary, {});
                }

                if (db.db.getRowsModified() != 0) {
                    return true;
                } else {
                    return false;
                }

            }
        } catch (err) {
            //console.log(err);
            return false;
        }
    },


};

db.open();

function rand_string(n) {
    if (n <= 0) {
        return '';
    }
    var rs = '';
    try {
        rs = crypto.randomBytes(Math.ceil(n / 2)).toString('hex').slice(0, n);
        /* note: could do this non-blocking, but still might fail */
    } catch (ex) {
        /* known exception cause: depletion of entropy info for randomBytes */
        //console.error('Exception generating random string: ' + ex);
        /* weaker random fallback */
        rs = '';
        var r = n % 8,
            q = (n - r) / 8,
            i;
        for (i = 0; i < q; i++) {
            rs += Math.random().toString(16).slice(2);
        }
        if (r > 0) {
            rs += Math.random().toString(16).slice(2, i);
        }
    }
    return rs;
}

function generateSessionToken() {
    var sha = crypto.createHash('SHA512');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};

var login = {
    checkPW: function (name, pw) {
        var rows = db.quary('SELECT * FROM user WHERE name=$name', {
            $name: db.stringSqlPrepare(name)
        }, "vals");
        if (rows.length > 0) {
            var key = crypto.pbkdf2Sync(pw, name, 1, 200, 'SHA512');
            if (key.toString('hex') == rows[0].pwHash) {
                var token = generateSessionToken();
                var now = new Date();
                try {
                    var x = db.quary('UPDATE user SET sessionID =$token, sessionDate=$date WHERE name=$name', {
                        $token: db.stringSqlPrepare(token),
                        $date: now.toISOString(),
                        $name: db.stringSqlPrepare(name)
                    }, "bool");
                    if (x) {
                        var data = {
                            tk: token,
                            name: db.stringSqlPrepare(name),
                            id: rows[0].ID
                        };
                        return data;
                    } else {
                        return false;
                    }

                } catch (err) {}
            }
        } else {
            return false;
        }
    },
    checkSession: function (name, session) {
        var rows = db.quary('SELECT * FROM user WHERE name=$name', {
            $name: db.stringSqlPrepare(name)
        }, "vals");

        if (rows.length > 0) {
            //Return true if the session is not older than 24h(86.400.000ms)
            var today = new Date();
            var sessiondate = new Date(rows[0].sessionDate);

            if (rows[0].sessionID == session && parseInt(today - sessiondate) <= 86400000) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
};

/*Exit-handling*/
function exitHandler(options, err) {
    if (options.cleanup) {
        db.close();
    };
    if (options.exit) {
        process.exit();
    };
    logger.write('Exiting...');
}
process.on('exit', exitHandler.bind(null, {
    cleanup: true
}));
process.on('SIGINT', exitHandler.bind(null, {
    exit: true
}));
process.on('SIGUSR1', exitHandler.bind(null, {
    exit: true
}));
process.on('SIGUSR2', exitHandler.bind(null, {
    exit: true
}));
process.on('uncaughtException', exitHandler.bind(null, {
    exit: true
}));
