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
eris-sharder is a powerful sharding manager for the discord Eris library. It uses Node.js's cluster module to spread shards evenly among all the cores. 

# Installation
To download eris-sharder, run `npm install eris-sharder --save`

# How to use
To use eris-sharder, simply copy this code and place it in a file, in the same directory that you ran the npm install in:

```javascript
const Sharder = require('eris-sharder').Master;
const sharder = new Sharder(token, pathToMainFile, options);
```

## Options
| Name  | Description |
| ------------- | ------------- |
| `token`  | your discord bot token. It will be used to calculate how many shards to spawn and to pass it on to your main file.  |
| `pathToMainFile`  | path to a file that exports a class. The class must containt a method called "launch". In the constructor the only paramater you should put is for the bot.  |
| `options.stats` | boolean. When set to true it enables stats output. |
| `options.webhooks` | Object.```{shard: {id: "webhookID", token: "webhookToken"}, cluster:{id: "webhookID", token: "webhookToken"}}```|
| `options.clientOptions` | A object of client options you want to pass to the Eris client constructor.|
| `options.debug` | Boolean to enable debug logging.|
| `options.name` | Name to print on startup. By default it's "Eris-Sharder".|
| `options.guildsPerShard` | Number to calculate how many guilds per shard. Defaults to 1300. Overriden if you only have 1 shard.|

To see an example, click [here](https://github.com/Discord-Sharders/eris-sharder#example)

# IPC
eris-sharder supports a variety of IPC events. All IPC events can be used via `process.send({type: "event"});`

## Logging
eris-sharder supports the following IPC logging events.

| Name | Example | Description |
| ---- | ------- | ----------- |
| log  | `process.send({name: "log", msg: "example"});` | Logs to console with gray color. |
| info | `process.send({name: "info", msg: "example"});`| Logs to console in green color. |
| debug| `process.send({name: "debug", msg: "example"});` | Logs to console in cyan color. |
| warn | `process.send({name: "warn", msg: "example"});` | Logs to console in yellow color. |
| error| `process.send({name: "error", msg: "example"});` | Logs to console in red color. |

# Info
In every cluster when your code is loaded, if you extend the Base class you get access to `this.bot` and `this.ipc`. `this.ipc` has a couple methods which you can find very useful.

| Method Name | Description |
| ----------- | ----------- |
| `this.ipc.register(event, callback);` | Using this you can register to listen for events and a callback that will handle them |
| `this.ipc.unregister(event);` | Use this to unregister for an event |
| `this.ipc.broadcast(name, message);` | Using this you can send a custom message to every cluster |
| `this.ipc.sendTo(cluster, name, message)` | Using this you can send a message to a specific cluster |
| `await this.ipc.fetchUser(id)` | Using this you can search for a user by id on all clusters |
| `await this.ipc.fetchGuild(id)` | Using this you can search for a guild by id on all clusters |
| `await this.ipc.fetchChannel(id)` | Using this you can search for a channel by id on all clusters |

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
const Base = require('eris-sharder').Base;
class Class extends Base{
    constructor(bot) {
        super(bot);
    }

    launch() {

    }

}

module.exports = Class;
```

## Example of index.js
```javascript
const Sharder = require('eris-sharder').Master;
const sharder = new Sharder("someToken", "/src/main.js", {
  stats: true,
  debug: true,
  guildsPerShard: "1500",
  name: "ExampleBot",
  webhooks: {
    shard: {
      id: "webhookID",
      token: "webhookToken"
    },
     cluster: {
      id: "webhookID",
      token: "webhookToken"
    }
  },
  clientOptions: {
      messageLimit: 150,
      defaultImageFormat: "png"
  }
});

sharder.on("stats", stats => {
  console.log(stats);
});
```

## Starting the script

```
node index.js
```

## NOTICE

If you are using pm2 to run your script add the `-- --colors` option to enable the colorful logging.
