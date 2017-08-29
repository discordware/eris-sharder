let EventEmitter = require("events");
class Queue extends EventEmitter {
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

    queueItem(item) {
       this.queue.push(item);
       if(this.mode === "waiting") {
           this.executeQueue();
           this.mode === "executing"
       }
    }
}

module.exports = Queue;