const Base = require("../src/index").Base;
class Main extends Base {
    constructor(bot) {
        super(bot);
    }

    async launch() {
        console.log("Launched");
        
        let msg = await this.bot.createMessage('366761211376959489', `Hello from cluster ${this.clusterID}!`);

        console.log(msg.id);
    }
}

module.exports = Main;