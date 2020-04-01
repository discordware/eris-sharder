const EventEmitter = require("events");
class IPC extends EventEmitter {
    constructor() {
        super();
        this.events = new Map();

        process.on("message", msg => {
            let event = this.events.get(msg._eventName);
            if (event) {
                event.fn(msg);
            }
        });
    }

    register(event, callback) {
        this.events.set(event, { fn: callback });
    }

    unregister(name) {
        this.events.delete(name);
    }

    broadcast(name, message = {}) {
        message._eventName = name;
        process.send({ name: "broadcast", msg: message });
    }

    sendTo(cluster, name, message = {}) {
        message._eventName = name;
        process.send({ name: "send", cluster: cluster, msg: message });
    }

    async fetchUser(id) {
        process.send({ name: "fetchUser", id });

        return new Promise((resolve, reject) => {
            const callback = (user) => {
                this.removeListener(id, callback);
                resolve(user);
            };

            this.on(id, callback);
        });
    }

    async fetchGuild(id) {
        process.send({ name: "fetchGuild", id });

        return new Promise((resolve, reject) => {
            const callback = (guild) => {
                this.removeListener(id, callback);
                resolve(guild);
            };

            this.on(id, callback);
        });
    }

    async fetchChannel(id) {
        process.send({ name: "fetchChannel", id });

        return new Promise((resolve, reject) => {
            const callback = (channel) => {
                this.removeListener(id, callback);
                resolve(channel);
            };

            this.on(id, callback);
        });
    }

    async fetchMember(guildID, memberID) {
        process.send({ name: "fetchMember", guildID, memberID });

        return new Promise((resolve, reject) => {
            const callback = (channel) => {
                this.removeListener(memberID, callback);
                resolve(channel);
            };

            this.on(memberID, callback);
        });
    }
}

module.exports = IPC;