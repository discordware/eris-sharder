const EventEmitter = require("events");
class IPC extends EventEmitter {
    constructor() {
        super();
        this.events = new Map();

        process.on("message", msg => {
            let event = this.events.get(msg.name);
            if (event) {
                event(msg);
            }
        });
    }

    register(event, callback) {
        this.events.set(event, callback);
    }

    unregister(name) {
        this.events.delete(name);
    }

    broadcast(name, message) {
        message.name = name;
        process.send({ name: "broadcast", msg: message });
    }

    sendTo(cluster, name, message) {
        message.name = name;
        process.send({ name: "send", cluster: cluster, msg: message });
    }

    async fetchUser(id) {
        process.send({ name: "fetchUser", id: id });
        const callback = (user) => {
            return user;
            this.removeListener(id, callback);
        };
        this.on(id, callback);
    }

    async fetchGuild(id) {
        process.send({ name: "fetchGuild", id: id });
        const callback = (guild) => {
            return guild;
            this.removeListener(id, callback);
        };
        this.on(id, callback);
    }

    async fetchChannel(id) {
        process.send({ name: "fetchChannel", id: id });
        const callback = (channel) => {
            return channel;
            this.removeListener(id, callback);
        };

        this.on(id, callback);
    }
}

module.exports = IPC;