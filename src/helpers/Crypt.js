const crypto = require("crypto");

class Crypt {
  static encrypt(data, key) {
    try {
      // Create a random nonce
      const nonce = crypto.randomBytes(24);

      // Create cipher using the key and nonce
      const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        Buffer.from(key).slice(0, 32),
        nonce,
      );

      // Encrypt the data
      let encrypted = cipher.update(data, "utf8", "base64");
      encrypted += cipher.final("base64");

      // Get the auth tag
      const authTag = cipher.getAuthTag();

      // Combine nonce, encrypted data and auth tag
      const result = Buffer.concat([
        nonce,
        Buffer.from(encrypted, "base64"),
        authTag,
      ]).toString("base64");

      return result;
    } catch {
      return data;
    }
  }

  static decrypt(data, key) {
    try {
      // Convert base64 string to buffer
      const buffer = Buffer.from(data, "base64");

      // Extract nonce, encrypted data and auth tag
      const nonce = buffer.slice(0, 24);
      const encrypted = buffer.slice(24, -16);
      const authTag = buffer.slice(-16);

      // Create decipher
      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        Buffer.from(key).slice(0, 32),
        nonce,
      );

      // Set auth tag
      decipher.setAuthTag(authTag);

      // Decrypt the data
      let decrypted = decipher.update(encrypted);
      decrypted += decipher.final();

      return decrypted.toString();
    } catch {
      return data;
    }
  }

  static isEncrypted(data) {
    if (typeof data !== "string") return false;
    if (data.length < 56) return false;

    try {
      const buffer = Buffer.from(data, "base64");
      return buffer.length >= 56 && buffer.toString("base64") === data;
    } catch {
      return false;
    }
  }

  static md5(str) {
    return crypto.createHash("md5").update(str).digest("hex");
  }
}

module.exports = Crypt;
