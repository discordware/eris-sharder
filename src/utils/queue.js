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
        this.mode = "executing"
    }

    executeQueue() {
        let item = this.queue[0];
        if(!item) return;
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
       this.queue.push(item);
       if(this.mode === "waiting") {
           this.executeQueue();
           this.mode === "executing"
       }
    }
}

module.exports = Queue;