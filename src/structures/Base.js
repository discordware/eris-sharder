/**
 * @class Base
 */
class Base {
    /**
     * Creates an instance of Base.
     * @param {Object} setup 
     * @param {import("eris").Client} setup.bot
     * @param {Number} setup.clusterID
     * @param {import("./IPC")} setup.ipc
     */
    constructor(setup) {
        this.bot = setup.bot;
        this.clusterID = setup.clusterID;
        this.ipc = setup.ipc;
    }

    /**
     * @param {Number} clusterID 
     * @memberof Base
     */
    restartCluster(clusterID) {
        this.ipc.sendTo(clusterID, "restart", { name: "restart" });
    }
}

module.exports = Base;