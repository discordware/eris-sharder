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

    broadcast(name, message) {
        message._eventName = name;
        process.send({ name: "broadcast", msg: message });
    }

    sendTo(cluster, name, message) {
        message._eventName = name;
        process.send({ name: "send", cluster: cluster, msg: message });
    }

    async fetchUser(id) {
        process.send({ name: "fetchUser", id: id });
        let self = this;

        return new Promise((resolve, reject) => {
            const callback = (user) => {
                self.removeListener(id, callback);
                resolve(user);
            };
            self.on(id, callback);
        });
    }

    async fetchGuild(id) {
        process.send({ name: "fetchGuild", id: id });
        let self = this;

        return new Promise((resolve, reject) => {
            const callback = (guild) => {
                self.removeListener(id, callback);
                resolve(guild);
            };
            self.on(id, callback);
        });
    }

    async fetchChannel(id) {
        process.send({ name: "fetchChannel", id: id });
        let self = this;

        return new Promise((resolve, reject) => {
            const callback = (channel) => {
                self.removeListener(id, callback);
                resolve(channel);
            };
            self.on(id, callback);
        });
    }
}

module.exports = IPC;