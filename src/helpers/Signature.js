const crypto = require('crypto');

class Signature {
    constructor(secret) {
        this.secret = secret;
    }

    getSignature(payload) {
        const preparedPayload = this.preparePayload(payload);
        if (!preparedPayload) return null;

        return this.signData(preparedPayload);
    }

    checkSignature(hash = null, payload = null) {
        if (!hash || !payload) return false;

        const preparedPayload = this.preparePayload(payload);
        if (!preparedPayload) return false;

        return crypto.timingSafeEqual(
            Buffer.from(this.signData(preparedPayload)),
            Buffer.from(hash)
        );
    }

    preparePayload(payload) {
        if (!payload) return null;

        if (typeof payload === 'string') {
            // remove all whitespaces from JSON string
            try {
                payload = JSON.stringify(JSON.parse(payload));
            } catch {
                return null;
            }
        }

        if (typeof payload !== 'string') {
            payload = JSON.stringify(payload);
        }

        return payload;
    }

    signData(payload, algo = 'sha512') {
        return crypto
            .createHmac(algo, this.secret)
            .update(payload)
            .digest('hex');
    }
}

module.exports = Signature;