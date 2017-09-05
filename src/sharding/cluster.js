const Eris = require("eris");
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
            process.send({ type: "log", msg: err.stack });
        });

        process.on('unhandledRejection', this.handleRejection.bind(this));
        // process.send("Cluster has started up!");
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
                            ram: process.memoryUsage().rss / 1000000,
                            shards: this.shards
                        }
                    });
                    break;
                case "reload":
                    if (this.shards < 1) return;
                    delete this.code.client;
                    let rootPath = process.cwd();
                    rootPath = rootPath.replace("\\", "/");
                    let path = `${rootPath}${this.mainFile}`;
                    let app = require(path);
                    this.code.client = new app(this.bot);
                    this.code.client.launch();
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
            this.code.client = new app(bot);
            this.code.client.launch();
        });


        bot.connect();


    }

    /**
     * 
     * 
     * @param {any} reason 
     * @param {any} p 
     * @memberof Cluster
     */
    handleRejection(reason, p) {
        try {
            process.send({ type: "log", msg: `Unhandled rejection at: Promise  ${p} reason:  ${reason.stack}` });
        } catch (err) {
            process.send({ type: "log", msg: `${reason.stack}` });
        }
    }
}

module.exports = Cluster;
