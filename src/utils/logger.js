const colors = require('colors');
colors.setTheme({
    silly: 'rainbow',
    log: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'cyan',
    error: 'red'
});

class Logger {
    constructor() {

    }

    log(source, msg) {
        let message = colors.log(msg)
        console.log(`${source} | ${message}`);
    }

    info(source, msg) {
        let message = colors.info(msg)
        console.log(`${source} | ${message}`);
    }

    warn(source, msg) {
        let message = colors.warn(msg)
        console.log(`${source} | ${message}`);
    }

    error(source, msg) {
        let message = colors.error(msg)
        console.log(`${source} | ${message}`);
    }

    data(source, msg) {
        let message = colors.data(msg)
        console.log(`${source} | ${message}`);
    }

    debug(source, msg) {
        let message = colors.debug(msg)
        console.log(`${source} | ${message}`);
    }
}

module.exports = new Logger();