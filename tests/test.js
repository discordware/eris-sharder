const Sharder = require("../src/index").Master;

let sharder = new Sharder("test", "/main.js", {
name: "Travis CLI",
stats: true,
clusters: 2,
shards: 4,
debug: true
});

sharder.on("stats", stats => {
console.log(stats)
});

setTimeout(() => {
process.exit();
}, 1000 * 60 * 2);
