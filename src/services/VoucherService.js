const AiraloException = require('../exceptions/AiraloException');
const ApiConstants = require('../constants/ApiConstants');
const SdkConstants = require('../constants/SdkConstants');

class VoucherService {
    constructor(config, httpClient, signature, accessToken) {
        if (!accessToken) {
            throw new AiraloException('Invalid access token please check your credentials');
        }

        this.config = config;
        this.httpClient = httpClient;
        this.signature = signature;
        this.accessToken = accessToken;
    }

    async createVoucher(payload) {
        this._validateVoucher(payload);

        return await this.httpClient
            .setHeaders([
                'Content-Type: application/json',
                `Authorization: Bearer ${this.accessToken}`,
                `airalo-signature: ${this.signature.getSignature(payload)}`
            ])
            .post(`${this.config.getUrl()}${ApiConstants.ENDPOINTS.VOUCHERS_SLUG}`, payload);
    }

    async createEsimVoucher(payload) {
        this._validateEsimVoucher(payload);

        return await this.httpClient
            .setHeaders([
                'Content-Type: application/json',
                `Authorization: Bearer ${this.accessToken}`,
                `airalo-signature: ${this.signature.getSignature(payload)}`
            ])
            .post(`${this.config.getUrl()}${ApiConstants.ENDPOINTS.VOUCHERS_ESIM_SLUG}`, payload);
    }

    _validateVoucher(payload) {
        if (!payload.amount || payload.amount === '' || payload.amount < 1) {
            throw new AiraloException(`The amount is required, payload: ${JSON.stringify(payload)}`);
        }

        if (payload.amount > SdkConstants.VOUCHER_MAX_NUM) {
            throw new AiraloException(`The amount may not be greater than ${SdkConstants.VOUCHER_MAX_NUM}`);
        }

        if (payload.voucher_code && typeof payload.voucher_code === 'string' && payload.voucher_code.length > 255) {
            throw new AiraloException('The voucher code may not exceed 255 characters.');
        }

        if (payload.voucher_code && payload.quantity && payload.quantity > 1) {
            throw new AiraloException('The selected voucher code allows a maximum quantity of 1');
        }

        if (payload.usage_limit && (payload.usage_limit < 1 || payload.usage_limit > SdkConstants.VOUCHER_MAX_NUM)) {
            throw new AiraloException(`The usage_limit may not be greater than ${SdkConstants.VOUCHER_MAX_NUM}`);
        }

        if (!payload.quantity || payload.quantity === '' || payload.quantity < 1) {
            throw new AiraloException(`The quantity is required, payload: ${JSON.stringify(payload)}`);
        }

        if (payload.quantity > SdkConstants.VOUCHER_MAX_QUANTITY) {
            throw new AiraloException(`The quantity may not be greater than ${SdkConstants.VOUCHER_MAX_QUANTITY}`);
        }
    }

    _validateEsimVoucher(payload) {
        if (!payload.vouchers || payload.vouchers.length === 0) {
            throw new AiraloException(`vouchers field is required, payload: ${JSON.stringify(payload)}`);
        }

        if (!Array.isArray(payload.vouchers)) {
            console.log(payload.vouchers);
            throw new AiraloException(`vouchers field should be an array, payload: ${JSON.stringify(payload)}`);
        }

        payload.vouchers.forEach(voucher => {
            if (!voucher.package_id) {
                throw new AiraloException(`The vouchers.package_id is required, payload: ${JSON.stringify(payload)}`);
            }

            if (!voucher.quantity) {
                throw new AiraloException(`The vouchers.quantity is required and should be greater than 0, payload: ${JSON.stringify(payload)}`);
            }

            if (voucher.quantity > SdkConstants.VOUCHER_MAX_QUANTITY) {
                throw new AiraloException(`The vouchers.quantity may not be greater than ${SdkConstants.VOUCHER_MAX_QUANTITY}`);
            }
        });
    }
}

module.exports = VoucherService;
