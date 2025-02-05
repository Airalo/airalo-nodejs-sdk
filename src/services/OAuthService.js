const Cached = require("../helpers/Cached");
const Crypt = require("../helpers/Crypt");
const AiraloException = require("../exceptions/AiraloException");
const API_CONSTANTS = require("../constants/ApiConstants");

class OAuthService {
  static RETRY_LIMIT = 2;
  static CACHE_NAME = "airalo_access_token";

  constructor(config, httpClient, signature) {
    this.config = config;
    this.httpClient = httpClient;
    this.signature = signature;
    this.payload = {
      ...this.config.getCredentials(),
      grant_type: "client_credentials",
    };
  }

  async getAccessToken() {
    let retryCount = 0;
    const cacheKey = `${OAuthService.CACHE_NAME}_${this.config.getCredentials(true)}`;

    while (retryCount < OAuthService.RETRY_LIMIT) {
      try {
        const token = await Cached.get(async () => {
          const response = await this.httpClient
            .setHeaders([
              `airalo-signature: ${this.signature.getSignature(this.payload)}`,
            ])
            .post(
              `${this.config.getUrl()}${API_CONSTANTS.ENDPOINTS.TOKEN}`,
              this.payload,
            );

          if (!response?.data?.access_token) {
            throw new AiraloException("Access token not found in response");
          }

          return Crypt.encrypt(
            response.data.access_token,
            this.getEncryptionKey(),
          );
        }, cacheKey);

        // Decrypt and return the token outside of the promise executor
        const decryptedToken = Crypt.decrypt(token, this.getEncryptionKey());
        return decryptedToken;
      } catch (error) {
        retryCount++;
        if (retryCount >= OAuthService.RETRY_LIMIT) {
          throw new AiraloException(
            `Failed to get access token: ${error.message}`,
          );
        }
        // Use a regular promise for delay
        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });
      }
    }

    throw new AiraloException("Failed to get access token after all retries");
  }

  getEncryptionKey() {
    return this.config.getCredentials(true);
  }
}

module.exports = OAuthService;
