const AiraloException = require('../exceptions/AiraloException');
const API_CONSTANTS = require('../constants/ApiConstants');

class TopupService {
    constructor(config, httpClient, signature, accessToken) {
        if (!accessToken) {
            throw new AiraloException('Invalid access token please check your credentials');
        }

        this.config = config;
        this.httpClient = httpClient;
        this.signature = signature;
        this.accessToken = accessToken;
    }

    async createTopup(payload) {
        this.validateTopup(payload);

        return await this.httpClient
            .setHeaders([
                'Content-Type: application/json',
                `Authorization: Bearer ${this.accessToken}`,
                `airalo-signature: ${this.signature.getSignature(payload)}`
            ])
            .post(`${this.config.getUrl()}${API_CONSTANTS.ENDPOINTS.TOPUPS_SLUG}`, payload);
    }

    validateTopup(payload) {
        if (!payload.package_id || payload.package_id === '') {
            throw new AiraloException(`The package_id is required, payload: ${JSON.stringify(payload)}`);
        }

        if (!payload.iccid || payload.iccid === '') {
            throw new AiraloException(`The iccid is required, payload: ${JSON.stringify(payload)}`);
        }
    }
}

module.exports = TopupService;