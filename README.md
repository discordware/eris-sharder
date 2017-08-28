<div align="center">
  <p>
    <a href="https://www.npmjs.com/package/"><img src="https://img.shields.io/npm/v/eris-sharder.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/eris-sharder"><img src="https://img.shields.io/npm/dt/eris-sharder.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://david-dm.org/Discord-Sharders/eris-sharder"><img src="https://img.shields.io/david/Discord-Sharders/eris-sharder.svg?maxAge=3600" alt="Dependencies" /></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/eris-sharder/"><img src="https://nodei.co/npm/eris-sharder.png?downloads=true&stars=true" alt="NPM info" /></a>
  </p>
</div>

# About
eris-sharder is a powerful sharding manager for the discord Eris library. It uses node.js's cluster module to spread shards evenly among all the cores. 

# Installation
To download eris-sharder run `npm install eris-sharder --save`

# How to use
To use eris-sharder simply copy this code and place it in a file, in the same directory that you ran the npm install in.
```javascript
const Sharder = require('eris-sharder');
const sharder = new Sharder(token, pathToMainFile, options);
```
-`token`: your discord bot token. It will be used to calculate how many shards to spawn and to pass it on to your main file.

-`pathToMainFile`: path to a file that exports a class. The class must containt a method called "launch". In the constructor the only paramater you should put is for the bot.

-`options.stats`: boolean. When set to true it enables stats output.

-`options.webhooks`: Object.```{shard: {id: "webhookID", token: "webhookToken}, cluster:{id: "webhookID", token: "webhookToken}}```

# IPC
eris-sharder supports a variety of IPC events. All IPC events can be used via `process.send({type: "event"});`

## Logging
eris-sharder supports the following IPC logging events.

-log: `process.send({type: "log", msg: "example"});`

-info: `process.send({type: "info", msg: "example"});`

-debug: `process.send({type: "debug", msg: "example"});`

-warn: `process.send({type: "warn", msg: "example"});`

-error: `process.send({type: "error", msg: "example"});`

# Example
## Directory Tree
In this example the directory tree will look something like this:
```
Project/
├── node-modules/
│   ├── eris-sharder
|
├── src/
│   ├── main.js
│   
├── index.js
```

## Example of main.js
```javascript
class Class {
    constructor(bot) {
        this.bot = bot;
    }

    launch() {

    }

}

module.exports = Class;
```

## Example of index.js
```javascript
const Sharder = require('eris-sharder');
const sharder = new Sharder("someToken", "/src/main.js", {
  stats: true,
  webhooks: {
    shard: {
      id: "webhookID",
      token: "webhookToken"
    },
     cluster: {
      id: "webhookID",
      token: "webhookToken"
    }
  }
});

sharder.on("stats", stats => {
  console.log(stats);
});
```



