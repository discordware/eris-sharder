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
        });

        process.on('uncaughtException', (err) => {
            process.send({ type: "log", msg: err.stack });
        });
    }


    connect(firstShardID, lastShardID, maxShards, token) {

        const bot = new Eris(token, { firstShardID: firstShardID, lastShardID: lastShardID, maxShards: maxShards });
        bot.connect();

        process.send({ type: "log", msg: `Starting up ${this.shards} shards` });

        bot.on("connect", id => {
            process.send({ type: "log", msg: `Shard ${id} has connected` });

        });

        let self = this;
        bot.on("ready", function () {
            process.send({ type: "log", msg: `Shards ${self.firstShardID} - ${self.lastShardID} are ready!` });
        });
        let rootPath = process.cwd()
        rootPath.replace("\\", "/");
        process.send({ type: "log", msg: rootPath });
        let path = `${rootPath}${this.mainFile}`;

        let app = require(path);
        let client = new app(bot);
        client.launch();
    }
}

module.exports = Cluster;