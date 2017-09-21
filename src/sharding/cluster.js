const Eris = require("eris");
const Base = require("../structures/Base.js");
console.log = (str) => process.send({ type: "log", msg: str });
console.error = (str) => process.send({ type: "error", msg: str });
console.warn = (str) => process.send({ type: "warn", msg: str });
console.info = (str) => process.send({ type: "info", msg: str });
console.debug = (str) => process.send({ type: "debug", msg: str });
/**
 * 
 * 
 * @class Cluster
 */
class Cluster {

    /**
     * Creates an instance of Cluster.
     * @param {any} clusterID 
     * @memberof Cluster
     */
    constructor() {

        this.shards = 0;
        this.firstShardID = null;
        this.lastShardID = null;
        this.mainFile = null;
        this.clusterID = null;
        this.guilds = 0;
        this.users = 0;
        this.uptime = 0;
        this.code = {};
        this.bot = null;

    }

    spawn() {
        process.on('uncaughtException', (err) => {
            process.send({ type: "error", msg: err.stack });
        });

        process.on('unhandledRejection', (reason, p) => {
            process.send({ type: "error", msg: `Unhandled rejection at: Promise  ${p} reason:  ${reason.stack}` });
        });


        process.on("message", msg => {

            switch (msg.message) {
                case "shards":
                    if (msg.type && msg.type === "round-robin") {
                        this.shards = this.shards + msg.shards;
                        process.send({ type: "log", msg: `Added ${msg.shards} more shards` });
                    } else if (msg.type && msg.type === "reboot") {
                        this.shards = msg.shards;
                        this.firstShardID = msg.firstShardID;
                        this.lastShardID = msg.lastShardID;
                        this.mainFile = msg.file;
                        this.clusterID = msg.id;
                        if (this.shards < 1) return;
                        this.connect(msg.firstShardID, msg.lastShardID, msg.maxShards, msg.token, "reboot", msg.clientOptions);
                    }
                    break;
                case "connect":
                    this.firstShardID = msg.firstShardID;
                    this.lastShardID = msg.lastShardID;
                    this.mainFile = msg.file;
                    this.clusterID = msg.id;
                    if (this.shards < 1) return;
                    this.connect(msg.firstShardID, msg.lastShardID, msg.maxShards, msg.token, "connect", msg.clientOptions);
                    break;
                case "stats":
                    process.send({
                        type: "stats", stats: {
                            guilds: this.guilds,
                            users: this.users,
                            uptime: this.uptime,
                            ram: process.memoryUsage().rss,
                            shards: this.shards
                        }
                    });
                    break;
                case "fetchUser":
                    let id = msg.value;
                    let user = this.bot.users.get(id);
                    if (user) {
                        process.send({ type: "fetchReturn", value: user })
                    }
                    break;
                case "fetchChannel":
                    let id = msg.value;
                    let channel = this.bot.channels.get(id);
                    if (channel) {
                        process.send({ type: "fetchReturn", value: channel })
                    }
                    break;
                case "fetchGuild":
                    let id = msg.value;
                    let guild = this.bot.guilds.get(id);
                    if (guild) {
                        process.send({ type: "fetchReturn", value: guild })
                    }
                    break;
                case "fetchReturn":
                    this.ipc.emit(msg.id, msg.value);
                    break;
            }
        });
    }

    /**
     * 
     * 
     * @param {any} firstShardID 
     * @param {any} lastShardID 
     * @param {any} maxShards 
     * @param {any} token 
     * @param {any} type 
     * @memberof Cluster
     */
    connect(firstShardID, lastShardID, maxShards, token, type, clientOptions) {
        switch (type) {
            case "connect":
                process.send({ type: "log", msg: `Connecting with ${this.shards} shards` });
                break;
            case "reboot":
                process.send({ type: "log", msg: `Rebooting with ${this.shards} shards` });
                break;
        }


        let options = { autoreconnect: true, firstShardID: firstShardID, lastShardID: lastShardID, maxShards: maxShards };
        let optionss = Object.keys(options);
        optionss.forEach(key => {
            delete clientOptions[key];
        });
        delete clientOptions.restMode;
        Object.assign(options, clientOptions);
        const bot = new Eris(token, options);
        this.bot = bot;
        bot.on("connect", id => {
            process.send({ type: "log", msg: `Shard ${id} established connection!` });
        });

        bot.on("shardDisconnect", (err, id) => {
            process.send({ type: "log", msg: `Shard ${id} disconnected!` });
            let embed = {
                title: "Shard Status Update",
                description: `Shard ${id} disconnected!`
            }
            process.send({ type: "shard", embed: embed });
        });

        bot.on("shardReady", id => {
            process.send({ type: "log", msg: `Shard ${id} is ready!` });
            let embed = {
                title: "Shard Status Update",
                description: `Shard ${id} is ready!`
            }
            process.send({ type: "shard", embed: embed });
        });

        bot.on("shardResume", id => {
            process.send({ type: "log", msg: `Shard ${id} has resumed!` });
            let embed = {
                title: "Shard Status Update",
                description: `Shard ${id} resumed!`
            }
            process.send({ type: "shard", embed: embed });
        });

        bot.on("warn", (message, id) => {
            process.send({ type: "warn", msg: `Shard ${id} | ${message}` });
        });

        bot.on("error", (error, id) => {
            process.send({ type: "error", msg: `Shard ${id} | ${error.stack}` });
        });


        bot.on("ready", id => {
            process.send({ type: "log", msg: `Shards ${this.firstShardID} - ${this.lastShardID} are ready!` });
            let embed = {
                title: `Cluster ${this.clusterID} is ready!`,
                description: `Shards ${this.firstShardID} - ${this.lastShardID}`
            }
            process.send({ type: "cluster", embed: embed });

            process.send({ type: "shardsStarted" });

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
            if (app instanceof Base) {
                this.code.client = new app(bot);
                this.code.client.launch();
            } else {
                console.error("Your code has not been loaded! This is due to it not extending the Base class. Please extend the Base class!");
            }
        });

        bot.connect();
    }

}

module.exports = Cluster;
