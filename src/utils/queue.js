let EventEmitter = require("events");
/**
 * @class Queue
 * @extends EventEmitter
 */
class Queue extends EventEmitter {
    /**
     * Creates an instance of Queue.
     * @memberof Queue
     */
    constructor() {
        super();
        this.queue = [];
    }

    /**
     * @memberof Queue
     */
    executeQueue() {
        let item = this.queue[0];

        if (!item) return;
        this.emit("execute", item);
    }

    /**
     * @param {Object} item 
     * @param {Number} item.item
     * @param {Object} item.value
     * @param {Number} item.value.id
     * @param {Number} item.value.clusterCount
     * @param {String} item.value.name
     * @param {Number} item.value.firstShardID
     * @param {Number} item.value.lastShardID
     * @param {String} item.value.maxShards
     * @param {String} item.value.token
     * @param {String} item.value.file
     * @param {import("eris").ClientOptions} item.value.clientOptions
     * @memberof Queue
     */
    queueItem(item) {
        if (this.queue.length === 0) {
            this.queue.push(item);
            this.executeQueue();
        } else {
            this.queue.push(item);
        }
    }
}

module.exports = Queue;