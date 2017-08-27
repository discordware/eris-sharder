const Eris = require("eris")
class Cluster {
    constructor() {
        this.shards = 0;
        this.firstShardID = null;
        this.lastShardID = null;
        this.mainFile = null;
    }

    spawn() {
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
                this.connect(msg.firstShardID, msg.lastShardID, msg.maxShards, msg.token)
                process.send({ type: "log", msg: `Rebooting with ${msg.shards} shards` });
            }
            else if (msg.message && msg.message === "connect") {
                this.firstShardID = msg.firstShardID;
                this.lastShardID = msg.lastShardID;
                this.mainFile = msg.file;
                this.connect(msg.firstShardID, msg.lastShardID, msg.maxShards, msg.token);
                process.send({ type: "log", msg: `Connecting with ${this.shards} shards` });
            }
            else if (msg.message && msg.message === "stats") {
                process.send({
                    type: "stats", stats: {
                        guilds: this.guilds,
                        users: this.users,
                        uptime: this.uptime,
                        ram: this.ram
                }});
            }
        });

        process.on('uncaughtException', (err) => {
            process.send({ type: "log", msg: err.stack });
        });
    }

    stats(bot) {
        let self = this;
        setInterval(function () {
                this.guilds = bot.guilds.size;
                this.users = bot.users.size;
                this.uptime = bot.uptime;
                this.ram = process.memoryUsage().rss / 1000000;
        }, 250);
    }


    connect(firstShardID, lastShardID, maxShards, token, options) {

        if (options.stats) {
            this.guilds = 0;
            this.users = 0;
            this.ram = 0;
            this.uptime = 0
        }



        const bot = new Eris(token, { firstShardID: firstShardID, lastShardID: lastShardID, maxShards: maxShards });
        bot.connect();

        process.send({ type: "log", msg: `Starting up ${this.shards} shards` });

        bot.on("connect", id => {
            process.send({ type: "log", msg: `Shard ${id} has connected` });

        });

        let self = this;
        bot.on("ready", function () {
            process.send({ type: "log", msg: `Shards ${self.firstShardID} - ${self.lastShardID} are ready!` });
            this.stats();

            let rootPath = process.cwd()
            rootPath.replace("\\", "/");
            process.send({ type: "log", msg: rootPath });
            let path = `${rootPath}${this.mainFile}`;

            let app = require(path);
            let client = new app(bot);
            client.launch();
        });

    }
}

module.exports = Cluster;