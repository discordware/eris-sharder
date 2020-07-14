const Sharder = require("../src/index").Master;

require('dotenv').config();

let sharder = new Sharder(`Bot ${process.env.TOKEN}`, "/main.js", {
    name: "Travis CLI",
    stats: true,
    clusters: 2,
    shards: 4,
    debug: true
});

sharder.on("stats", stats => {
    console.log(stats)
});