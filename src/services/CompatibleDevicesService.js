const AiraloException = require("../exceptions/AiraloException");
const API_CONSTANTS = require("../constants/ApiConstants");

class CompatibleDevicesService {
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

  async getCompatibleDevices() {
    const url = this.buildUrl();

    const response = await this.httpClient
      .setHeaders([
        "Content-Type: application/json",
        `Authorization: Bearer ${this.accessToken}`,
      ])
      .get(url);

    return response?.data ? response : null;
  }

  buildUrl() {
    return `${this.baseUrl}${API_CONSTANTS.ENDPOINTS.COMPATIBLE_DEVICES_SLUG}`;
  }
}

module.exports = CompatibleDevicesService;
