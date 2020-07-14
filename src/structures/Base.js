class Base {
    constructor(setup) {
        this.bot = setup.bot;
        this.clusterID = setup.clusterID;
        this.ipc = setup.ipc;
    }

    restartCluster(clusterID) {
        this.ipc.sendTo(clusterID, "restart", { name: "restart" });
    }
}

module.exports = Base;