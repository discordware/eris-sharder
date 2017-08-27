const Eris = require("eris");

class Cluster {
    constructor() {
        this.shards = 0;
        this.firstShardID = null;
        this.lastShardID = null;
        this.mainFile = null;
        this.guilds = 0;
        this.users = 0;
        this.uptime = 0;


    }

    spawn() {
        process.on('uncaughtException', (err) => {
            process.send({ type: "log", msg: err.stack });
        });

        process.on('unhandledRejection', this.handleRejection.bind(this));
        // process.send("Cluster has started up!");
        process.on("message", msg => {
            if (msg.message && msg.message === "shards" && msg.type && msg.type === "round-robin") {
                this.shards = this.shards + msg.shards;
                process.send({ type: "log", msg: `Added ${msg.shards} more shards` });
            }
            else if (msg.message && msg.message === "shards" && msg.type && msg.type === "reboot") {
                this.shards = msg.shards;
                this.firstShardID = msg.firstShardID;
                this.lastShardID = msg.lastShardID;
                this.mainFile = msg.file;
                if (this.shards < 1) return;
                this.connect(msg.firstShardID, msg.lastShardID, msg.maxShards, msg.token, "reboot");
            }
            else if (msg.message && msg.message === "connect") {
                this.firstShardID = msg.firstShardID;
                this.lastShardID = msg.lastShardID;
                this.mainFile = msg.file;
                if (this.shards < 1) return;
                this.connect(msg.firstShardID, msg.lastShardID, msg.maxShards, msg.token, "connect");
            }
            else if (msg.message && msg.message === "stats") {
                process.send({
                    type: "stats", stats: {
                        guilds: this.guilds,
                        users: this.users,
                        uptime: this.uptime,
                        ram: process.memoryUsage().rss / 1000000,
                        shards: this.shards
                    }
                });
            }
        });
    }



    connect(firstShardID, lastShardID, maxShards, token, type) {
        switch (type) {
            case "connect":
                process.send({ type: "log", msg: `Connecting with ${this.shards} shards` });
                break;
            case "reboot":
                process.send({ type: "log", msg: `Rebooting with ${msg.shards} shards` });
                break;
        }

        const bot = new Eris(token, { autoreconnect: true, firstShardID: firstShardID, lastShardID: lastShardID, maxShards: maxShards });

        bot.on("connect", id => {
            process.send({ type: "log", msg: `Shard ${id} established connection!` });
        });

        bot.on("shardDisconnect", (err, id) => {
            process.send({ type: "log", msg: `Shard ${id} disconnected!` });
        });

        bot.on("shardReady", id => {
            process.send({ type: "log", msg: `Shard ${id} is ready!` });
        });

        bot.on("shardResume", id => {
            process.send({ type: "log", msg: `Shard ${id} has resumed!` });
        });

        bot.on("warn", (message, id) => {
            process.send({ type: "warn", msg: `Shard ${id} | ${message}` });
        });

        bot.on("error", (error, id) => {
            process.send({ type: "error", msg: `Shard ${id} | ${error}` });
        });


        bot.on("ready", id => {
            process.send({ type: "log", msg: `Shards ${this.firstShardID} - ${this.lastShardID} are ready!` });

            setInterval(() => {
                this.guilds = bot.guilds.size;
                this.users = bot.users.size;
                this.uptime = bot.uptime;
            }, 10);

            let rootPath = process.cwd();
            rootPath = rootPath.replace(`\\`, "/");

            process.send({ type: "log", msg: "Loading code!" });

            let path = `${rootPath}${this.mainFile}`;
            let app = require(path);
            let client = new app(bot);

            client.launch();
        });


        bot.connect();


    }

    handleRejection(reason, p) {
        try {
            process.send({ type: "log", msg: `Unhandled rejection at: Promise  ${p} reason:  ${reason}` });
        } catch (err) {
            process.send({ type: "log", msg: `${reason}` });
        }
    }
}

module.exports = Cluster;