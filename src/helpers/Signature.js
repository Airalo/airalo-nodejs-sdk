const crypto = require("crypto");

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
      Buffer.from(hash),
    );
  }

  preparePayload(payload) {
    if (!payload) return null;

    if (typeof payload === "string") {
      // Try to parse the string as JSON
      try {
        // Parse the JSON string
        const parsedPayload = JSON.parse(payload);

        // Re-stringify it to normalize format, BUT ALSO ESCAPE FORWARD SLASHES
        payload = JSON.stringify(parsedPayload).replace(/\//g, "\\/");
      } catch {
        // If it's not valid JSON, return null
        return null;
      }
    } else {
      // If it's an object, convert to JSON string WITH ESCAPED SLASHES
      payload = JSON.stringify(payload).replace(/\//g, "\\/");
    }

    return payload;
  }

  signData(payload, algo = "sha512") {
    return crypto.createHmac(algo, this.secret).update(payload).digest("hex");
  }
}

module.exports = Signature;
