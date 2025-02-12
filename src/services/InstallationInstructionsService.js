const AiraloException = require("../exceptions/AiraloException");
const API_CONSTANTS = require("../constants/ApiConstants");
const Cached = require("../helpers/Cached");

class InstallationInstructionsService {
  constructor(config, httpClient, accessToken) {
    if (!accessToken) {
      throw new AiraloException(
        "Invalid access token please check your credentials",
      );
    }

    this.config = config;
    this.httpClient = httpClient;
    this.accessToken = accessToken;
    this.baseUrl = this.config.getUrl();
  }

  async getInstructions(params = {}) {
    const url = this.buildUrl(params);

    const result = await Cached.get(
      async () => {
        const response = await this.httpClient
          .setHeaders([
            "Content-Type: application/json",
            `Authorization: Bearer ${this.accessToken}`,
            `Accept-Language: ${params.language || "en"}`,
          ])
          .get(url);

        return response;
      },
      this.getKey(url, params),
      3600,
    );

    return result?.data ? result : null;
  }

  buildUrl(params) {
    if (!params.iccid) {
      throw new AiraloException('The parameter "iccid" is required.');
    }

    const iccid = String(params.iccid);
    return `${this.baseUrl}${API_CONSTANTS.ENDPOINTS.SIMS}/${iccid}/${API_CONSTANTS.ENDPOINTS.INSTRUCTIONS_SLUG}`;
  }

  getKey(url, params) {
    return require("crypto")
      .createHash("md5")
      .update(
        url +
          JSON.stringify(params) +
          JSON.stringify(this.config.getHttpHeaders()) +
          this.accessToken,
      )
      .digest("hex");
  }
}

module.exports = InstallationInstructionsService;
