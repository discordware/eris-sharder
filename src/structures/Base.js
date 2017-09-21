const IPC = require("./IPC.js");
class Base {
    constructor(bot) {
        this.bot = bot;
        this.ipc = new IPC();
    }
}

module.exports = Base;