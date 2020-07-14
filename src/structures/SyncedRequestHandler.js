const crypto = require('crypto');

class SyncedRequestHandler {
    constructor(ipc, options) {
        this.ipc = ipc;
        this.timeout = options.timeout + 1000;
    }

    request(method, url, auth, body, file, _route, short) {
        return new Promise((resolve, reject) => {
            let stackCapture = new Error().stack;

            let requestID = crypto.randomBytes(16).toString('hex');

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