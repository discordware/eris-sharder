const Sharder = require('./sharding/clustermanager.js');
const Base = require("./structures/Base.js");
module.exports = {
    Master: Sharder,
    Base: Base
};
