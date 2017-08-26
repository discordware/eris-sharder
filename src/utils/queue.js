class Queue {
    constructor(master) {
        this.queue = [];
        this.process = master;
    }

    queue(item) {
        if(this.queue.length > 0) {
            this.queue.push(item);
        } else {
            this.executeQueue(item);
        }
        
    }

    executeQueue(item) {
        
    }
}
module.exports =  Queue;