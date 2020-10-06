const EventEmitter = require("events");

/**
 * @class IPC
 * @extends EventEmitter
 */
class IPC extends EventEmitter {
    /**
     * Creates an instance of IPC.
     */
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

    /**
     * @param {String} event 
     * @param {(...args) => void} callback 
     * @memberof IPC
     */
    register(event, callback) {
        this.events.set(event, { fn: callback });
    }

    /**
     * @param {String} name 
     * @memberof IPC
     */
    unregister(name) {
        this.events.delete(name);
    }

    /**
     * @param {String} name 
     * @param {any} message 
     * @memberof IPC
     */
    broadcast(name, message = {}) {
        message._eventName = name;
        process.send({ name: "broadcast", msg: message });
    }

    /**
     * @param {Number} cluster 
     * @param {String} name 
     * @param {any} message 
     * @memberof IPC
     */
    sendTo(cluster, name, message = {}) {
        message._eventName = name;
        process.send({ name: "send", cluster: cluster, msg: message });
    }

    /**
     * @param {String} id 
     * @returns {Promise<import("eris").User>}
     * @memberof IPC
     */
    async fetchUser(id) {
        process.send({ name: "fetchUser", id });

        return new Promise((resolve) => {
            const callback = (user) => {
                this.removeListener(id, callback);
                resolve(user);
            };

            this.on(id, callback);
        });
    }

    /**
     * @param {String} id 
     * @returns {Promise<import("eris").Guild>}
     * @memberof IPC
     */
    async fetchGuild(id) {
        process.send({ name: "fetchGuild", id });

        return new Promise((resolve) => {
            const callback = (guild) => {
                this.removeListener(id, callback);
                resolve(guild);
            };

            this.on(id, callback);
        });
    }

    /**
     * @param {String} id 
     * @returns {Promise<import("eris").Channel>}
     * @memberof IPC
     */
    async fetchChannel(id) {
        process.send({ name: "fetchChannel", id });

        return new Promise((resolve) => {
            const callback = (channel) => {
                this.removeListener(id, callback);
                resolve(channel);
            };

            this.on(id, callback);
        });
    }

    /**
     * 
     * @param {String} guildID 
     * @param {String} memberID 
     * @returns {Promise<import("eris").Member>}
     * @memberof IPC
     */
    async fetchMember(guildID, memberID) {
        process.send({ name: "fetchMember", guildID, memberID });

        return new Promise((resolve) => {
            const callback = (channel) => {
                this.removeListener(memberID, callback);
                resolve(channel);
            };

            this.on(memberID, callback);
        });
    }
}

module.exports = IPC;