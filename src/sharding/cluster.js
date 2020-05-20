let Eris;

try {
    Eris = require("eris-additions")(require("eris"));
} catch (err) {
    Eris = require("eris");
}

const Base = require("../structures/Base.js");
const { inspect } = require('util');

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
        this.maxShards = 0;
        this.firstShardID = 0;
        this.lastShardID = 0;
        this.mainFile = null;
        this.clusterID = 0;
        this.clusterCount = 0;
        this.guilds = 0;
        this.users = 0;
        this.uptime = 0;
        this.exclusiveGuilds = 0;
        this.largeGuilds = 0;
        this.voiceChannels = 0;
        this.shardsStats = [];
        this.app = null;
        this.bot = null;
        this.test = false;

        console.log = (str) => process.send({ name: "log", msg: this.logOverride(str) });
        console.error = (str) => process.send({ name: "error", msg: this.logOverride(str) });
        console.warn = (str) => process.send({ name: "warn", msg: this.logOverride(str) });
        console.info = (str) => process.send({ name: "info", msg: this.logOverride(str) });
        console.debug = (str) => process.send({ name: "debug", msg: this.logOverride(str) });

    }

    logOverride(message) {
        if (typeof message == 'object') return inspect(message);
        else return message;
    }

    spawn() {
        process.on('uncaughtException', (err) => {
            process.send({ name: "error", msg: err.stack });
        });

        process.on('unhandledRejection', (reason, p) => {
            process.send({ name: "error", msg: `Unhandled rejection at: Promise  ${p} reason:  ${reason.stack}` });
        });


        process.on("message", msg => {
            if (msg.name) {
                switch (msg.name) {
                    case "connect": {
                        this.firstShardID = msg.firstShardID;
                        this.lastShardID = msg.lastShardID;
                        this.mainFile = msg.file;
                        this.clusterID = msg.id;
                        this.clusterCount = msg.clusterCount;
                        this.shards = (this.lastShardID - this.firstShardID) + 1;
                        this.maxShards = msg.maxShards;

                        if (this.shards < 1) return;

                        if (msg.test) {
                            this.test = true;
                        }

                        this.connect(msg.firstShardID, msg.lastShardID, this.maxShards, msg.token, "connect", msg.clientOptions);

                        break;
                    }
                    case "stats": {
                        process.send({
                            name: "stats", stats: {
                                guilds: this.guilds,
                                users: this.users,
                                uptime: this.uptime,
                                ram: process.memoryUsage().rss,
                                shards: this.shards,
                                exclusiveGuilds: this.exclusiveGuilds,
                                largeGuilds: this.largeGuilds,
                                voice: this.voiceChannels,
                                shardsStats: this.shardsStats
                            }
                        });

                        break;
                    }
                    case "fetchUser": {
                        if (!this.bot) return;
                        let id = msg.value;
                        let user = this.bot.users.get(id);
                        if (user) {
                            process.send({ name: "fetchReturn", value: user });
                        }

                        break;
                    }
                    case "fetchChannel": {
                        if (!this.bot) return;
                        let id = msg.value;
                        let channel = this.bot.getChannel(id);
                        if (channel) {
                            channel = channel.toJSON();
                            return process.send({ name: "fetchReturn", value: channel });
                        }

                        break;
                    }
                    case "fetchGuild": {
                        if (!this.bot) return;
                        let id = msg.value;
                        let guild = this.bot.guilds.get(id);
                        if (guild) {
                            guild = guild.toJSON();
                            process.send({ name: "fetchReturn", value: guild });
                        }

                        break;
                    }
                    case "fetchMember": {
                        if (!this.bot) return;
                        let [guildID, memberID] = msg.value;

                        let guild = this.bot.guilds.get(guildID);
                        
                        if (guild) {
                            let member = guild.members.get(memberID);

                            if (member) {
                                member = member.toJSON();
                                process.send({ name: "fetchReturn", value: member });
                            }
                        }

                        break;
                    }
                    case "fetchReturn":
                        this.ipc.emit(msg.id, msg.value);
                        break;
                    case "restart":
                        process.exit(1);
                        break;
                }
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
        process.send({ name: "log", msg: `Connecting with ${this.shards} shard(s)` });

        let options = { autoreconnect: true, firstShardID: firstShardID, lastShardID: lastShardID, maxShards: maxShards };
        let optionss = Object.keys(options);
        optionss.forEach(key => {
            delete clientOptions[key];
        });

        Object.assign(options, clientOptions);

        const bot = new Eris(token, options);
        this.bot = bot;

        bot.on("connect", id => {
            process.send({ name: "log", msg: `Shard ${id} established connection!` });
        });

        bot.on("shardDisconnect", (err, id) => {
            process.send({ name: "log", msg: `Shard ${id} disconnected!` });
            let embed = {
                title: "Shard Status Update",
                description: `Shard ${id} disconnected!`
            }
            process.send({ name: "shard", embed: embed });
        });

        bot.on("shardReady", id => {
            process.send({ name: "log", msg: `Shard ${id} is ready!` });
            let embed = {
                title: "Shard Status Update",
                description: `Shard ${id} is ready!`
            }
            process.send({ name: "shard", embed: embed });
        });

        bot.on("shardResume", id => {
            process.send({ name: "log", msg: `Shard ${id} has resumed!` });
            let embed = {
                title: "Shard Status Update",
                description: `Shard ${id} resumed!`
            }
            process.send({ name: "shard", embed: embed });
        });

        bot.on("warn", (message, id) => {
            process.send({ name: "warn", msg: `Shard ${id} | ${message}` });
        });

        bot.on("error", (error, id) => {
            process.send({ name: "error", msg: `Shard ${id} | ${error.stack}` });
        });

        bot.once("ready", id => {
            this.loadCode(bot);

            this.startStats(bot);
        });

        bot.on("ready", id => {
            process.send({ name: "log", msg: `Shards ${this.firstShardID} - ${this.lastShardID} are ready!` });
            let embed = {
                title: `Cluster ${this.clusterID} is ready!`,
                description: `Shards ${this.firstShardID} - ${this.lastShardID}`
            }
            process.send({ name: "cluster", embed: embed });

            process.send({ name: "shardsStarted" });
        });

        if (!this.test) {
            bot.connect();
        } else {
            process.send({ name: "shardsStarted" });
            this.loadCode(bot);
        }
    }

    loadCode(bot) {
        let rootPath = process.cwd();
        rootPath = rootPath.replace(`\\`, "/");


        let path = `${rootPath}${this.mainFile}`;
        let app = require(path);
        if (app.prototype instanceof Base) {
            this.app = new app({ bot: bot, clusterID: this.clusterID });
            this.app.launch();
            this.ipc = this.app.ipc;
        } else {
            console.error("Your code has not been loaded! This is due to it not extending the Base class. Please extend the Base class!");
        }
    }

    startStats(bot) {
        setInterval(() => {
            this.guilds = bot.guilds.size;
            this.users = bot.users.size;
            this.uptime = bot.uptime;
            this.voiceChannels = bot.voiceConnections.size;
            this.largeGuilds = bot.guilds.filter(g => g.large).length;
            this.exclusiveGuilds = bot.guilds.filter(g => g.members.filter(m => m.bot).length === 1).length;
            this.shardsStats = [];
            this.bot.shards.forEach(shard => {
                this.shardsStats.push({
                    id: shard.id,
                    ready: shard.ready,
                    latency: shard.latency,
                    status: shard.status
                });
            });
        }, 1000 * 5);
    }
}


module.exports = Cluster;
