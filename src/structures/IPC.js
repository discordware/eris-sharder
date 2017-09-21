const EventEmitter = require("events");
class IPC extends EventEmitter{
    constructor() {

    }

    register(event, callback) {
        process.on(event, callback.bind(this));
    }

    broadcast(message) {
        process.send({type: "broadcast", msg: message});
    }

    sendTo(cluster, message) {
        process.send({type: "send", cluster: cluster, msg: message});
    }

   async fetchUser(id) {
    process.send({type: "fetchUser", id: id});
    const callback = (user) => {
        return user;
        this.removeListener(id, callback);
      };
      this.on(id, callback);
    }

   async fetchGuild(id) {
    process.send({type: "fetchGuild", id: id});
    const callback = (guild) => {
        return guild;
        this.removeListener(id, callback);
      };
      this.on(id, callback);
    }

   async fetchChannel(id) {
    process.send({type: "fetchChannel", id: id});
    const callback = (channel) => {
        return channel;
        this.removeListener(id, callback);
      };

      this.on(id, callback);
    }
}

module.exports = IPC;