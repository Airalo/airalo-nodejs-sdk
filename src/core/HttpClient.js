const https = require('https');
const { URL } = require('url');
const querystring = require('querystring');
const AiraloException = require('../exceptions/AiraloException');

class HttpClient {
    constructor(config) {
        this.config = config;
        this.defaultHeaders = this.config.getHttpHeaders();
        this.requestHeaders = [...this.defaultHeaders];
        this.code = 0;
        this.header = '';
        this.ignoreSSL = false;
        this.rfc = 'RFC1738';
    }

    setHeaders(headers = []) {
        this.requestHeaders = [
            ...this.defaultHeaders,
            ...headers
        ];
        return this;
    }

    setTimeout(timeout = 30) {
        this.timeout = timeout * 1000;
        return this;
    }

    ignoreSSL() {
        this.ignoreSSL = true;
        return this;
    }

    async request(url, { method, body, headers = {} } = {}) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);

            const requestHeaders = {
                ...this.requestHeaders.reduce((acc, header) => {
                    const [key, value] = header.split(': ');
                    acc[key] = value;
                    return acc;
                }, {}),
                ...headers,
                ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
            };

            const requestOptions = {
                method,
                headers: requestHeaders,
                path: parsedUrl.pathname + parsedUrl.search,
                host: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                timeout: this.timeout || 60000,
                rejectUnauthorized: !this.ignoreSSL
            };

            const req = https.request(requestOptions, (res) => {
                let data = '';

                this.code = res.statusCode;

                this.header = res.rawHeaders.join('\r\n');

                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 417) {
                        delete requestHeaders['Expect'];
                        return this.request(url, { method, body, headers: requestHeaders });
                    }

                    try {
                        const response = JSON.parse(data);
                        if (res.statusCode > 204) {
                            reject(new AiraloException(`Request failed with status code: ${res.statusCode}, response: ${data}`));
                        }
                        resolve(response);
                    } catch (error) {
                        reject(new AiraloException(`Failed to parse response: ${error.message}\nRaw response: ${data}`));
                    }
                });
            });

            req.on('error', reject);

            if (body) {
                req.write(body);
            }

            req.end();
        });
    }

    async get(url, params = {}) {
        if (Object.keys(params).length > 0) {
            url = url.replace(/\?$/, '');
            const queryString = querystring.stringify(params, null, null, {
                encodeURIComponent: this.rfc === 'RFC3986' ? encodeURIComponent : querystring.escape
            });
            url += '?' + queryString;
        }

        return this.request(url, {
            method: 'GET'
        });
    }

    async post(url, params = {}) {
        const body = typeof params === 'object' ?
            JSON.stringify(params) :
            params;

        return this.request(url, {
            method: 'POST',
            body
        });
    }

    async head(url, params = {}) {
        const body = typeof params === 'object' ?
            JSON.stringify(params) :
            params;

        return this.request(url, {
            method: 'HEAD',
            body
        });
    }
}

module.exports = HttpClient;