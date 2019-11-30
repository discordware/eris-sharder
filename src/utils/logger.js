const colors = require('colors');
const { inspect } = require ('util');

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
var log = require('fancy-log');

/**
 * 
 * 
 * @class Logger
 */
class Logger {
    constructor() {

    }

    /**
     * 
     * 
     * @param {any} source 
     * @param {any} msg 
     * @memberof Logger
     */
    log(source, msg) {
        let message = colors.log(msg)
        log(`${source} | ${inspect(message)}`);
    }

    /**
     * 
     * 
     * @param {any} source 
     * @param {any} msg 
     * @memberof Logger
     */
    info(source, msg) {
        let message = colors.info(msg)
        log(`${source} | ${inspect(message)}`);
    }

    /**
     * 
     * 
     * @param {any} source 
     * @param {any} msg 
     * @memberof Logger
     */
    warn(source, msg) {
        let message = colors.warn(msg)
        log(`${source} | ${inspect(message)}`);
    }

    /**
     * 
     * 
     * @param {any} source 
     * @param {any} msg 
     * @memberof Logger
     */
    error(source, msg) {
        let message = colors.error(msg)
        log(`${source} | ${inspect(message)}`);
    }

    /**
     * 
     * 
     * @param {any} source 
     * @param {any} msg 
     * @memberof Logger
     */
    data(source, msg) {
        let message = colors.data(msg)
        log(`${source} | ${inspect(message)}`);
    }

    /**
     * 
     * 
     * @param {any} source 
     * @param {any} msg 
     * @memberof Logger
     */
    debug(source, msg) {
        let message = colors.debug(msg)
        log(`${source} | ${inspect(message)}`);
    }
}

module.exports = new Logger();
