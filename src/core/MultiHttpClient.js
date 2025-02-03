const HttpClient = require('./HttpClient');

class MultiHttpClient {
    static WINDOW = 5;

    constructor(config) {
        this.config = config;
        this.handlers = new Map();
        this.options = {};
        this.ignoreSSLFlag = false;
        this.timeoutValue = null;
        this.currentTag = null;
        this.headers = [];
    }

    tag(name = '') {
        if (name) {
            this.currentTag = name;
        }
        return this;
    }

    setHeaders(headers = []) {
        this.headers = headers;
        return this;
    }

    get(url, params = {}) {
        return this.add('get', [url, params]);
    }

    post(url, params = {}) {
        return this.add('post', [url, params]);
    }

    ignoreSSL() {
        this.ignoreSSLFlag = true;
        return this;
    }

    setTimeout(timeout = 30) {
        this.timeoutValue = timeout;
        return this;
    }

    add(methodName, args) {
        const httpClient = new HttpClient(this.config);

        if (this.ignoreSSLFlag) {
            httpClient.ignoreSSL();
        }

        if (this.timeoutValue) {
            httpClient.setTimeout(this.timeoutValue);
        }

        if (this.headers.length > 0) {
            httpClient.setHeaders(this.headers);
        }

        const request = {
            method: methodName,
            args: args,
            client: httpClient
        };

        if (this.currentTag !== null) {
            this.handlers.set(this.currentTag, request);
            this.currentTag = null;
        } else {
            this.handlers.set(this.handlers.size.toString(), request);
        }

        return this;
    }

    async exec() {
        const responses = {};
        const handlers = Array.from(this.handlers.entries());
        const windowSize = Math.min(handlers.length, MultiHttpClient.WINDOW);

        // Process requests in rolling window
        for (let i = 0; i < handlers.length; i += windowSize) {
            const batch = handlers.slice(i, i + windowSize);
            const promises = batch.map(async ([tag, request]) => {
                try {
                    const response = await request.client[request.method](...request.args);
                    return { tag, response };
                } catch (error) {
                    return { tag, error };
                }
            });

            const results = await Promise.all(promises);
            results.forEach(({ tag, response, error }) => {
                responses[tag] = error || response;
            });
        }

        this.handlers.clear();
        return responses;
    }
}

module.exports = MultiHttpClient;