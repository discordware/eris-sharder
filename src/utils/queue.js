let EventEmitter = require("events");
/**
 * 
 * 
 * @class Queue
 * @extends {EventEmitter}
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

    executeQueue() {
        let item = this.queue[0];
        if (!item) return;
        this.emit("execute", item);
        this.queue.splice(0, 1);
    }

    /**
     * 
     * 
     * @param {any} item 
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