const crypto = require('crypto');

/**
 * @class SyncedRequestHandler
 */
class SyncedRequestHandler {
    /**
     * Creates an instance of SyncedRequestHandler.
     * @param {import("./IPC")} ipc 
     * @param {Object} options
     * @param {Number} options.timeout 
     * @memberof SyncedRequestHandler
     */
    constructor(ipc, options) {
        this.ipc = ipc;
        this.timeout = options.timeout + 1000;
    }

    /**
     * @param {String} method 
     * @param {String} url 
     * @param {Boolean} [auth] 
     * @param {Object} [body] 
     * @param {Object} [file] 
     * @param {ArrayBuffer | SharedArrayBuffer} file.file
     * @param {String} file.name
     * @param {String} _route 
     * @param {Boolean} short 
     * @returns {Promise<Object>}
     * @memberof SyncedRequestHandler
     */
    request(method, url, auth, body, file, _route, short) {
        return new Promise((resolve, reject) => {
            let stackCapture = new Error().stack;

            let requestID = crypto.randomBytes(16).toString('hex');

            if (file && file.file) file.file = Buffer.from(file.file).toString('base64');

            process.send({ name: 'apiRequest', requestID, method, url, auth, body, file, _route, short });

            let timeout = setTimeout(() => {
                reject(new Error(`Request timed out (>${this.timeout}ms) on ${method} ${url}`));

                this.ipc.unregister(`apiResponse.${requestID}`);
            }, this.timeout);

            this.ipc.register(`apiResponse.${requestID}`, data => {
                if (data.err) {
                    let error = new Error(data.err.message);

                    error.stack = data.err.stack + '\n' + stackCapture.substring(stackCapture.indexOf('\n') + 1);
                    error.code = data.err.code;

                    reject(error);
                } else {
                    resolve(data.data);
                }

                clearTimeout(timeout);
                this.ipc.unregister(`apiResponse.${requestID}`);
            });
        });
    }
}

module.exports = SyncedRequestHandler;