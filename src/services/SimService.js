const Cached = require("../helpers/Cached");
const Crypt = require("../helpers/Crypt");
const AiraloException = require("../exceptions/AiraloException");
const API_CONSTANTS = require("../constants/ApiConstants");

class SimService {
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

  /**
   * @param {Object} params - Optional parameters for the request
   * @returns {Promise<Object|null>} SIM usage data or null
   */
  async simUsage(params = {}) {
    const url = this.buildUrl(params);

    return Cached.get(
      async () => {
        const response = await this.httpClient
          .setHeaders([`Authorization: Bearer ${this.accessToken}`])
          .get(url);

        return response?.data ? response : null;
      },
      this.getKey(url, params),
      300,
    );
  }

  /**
   * @param {string[]} iccids - Array of ICCID numbers
   * @returns {Promise<Object|null>} Bulk SIM usage data
   */
  async simUsageBulk(iccids = []) {
    if (!Array.isArray(iccids) || iccids.length === 0) {
      throw new AiraloException(
        'The parameter "iccids" must be an array of ICCID numbers.',
      );
    }

    const requests = iccids.map((iccid) =>
      this.httpClient
        .setHeaders([`Authorization: Bearer ${this.accessToken}`])
        .get(this.buildUrl({ iccid }))
        .catch((error) => ({ error, iccid })),
    );

    return Cached.get(
      async () => {
        try {
          const responses = await Promise.all(requests);

          const result = {};

          responses.forEach((response, index) => {
            if (response.error) {
              result[iccids[index]] = response.error;
            } else {
              result[iccids[index]] = response.data;
            }
          });

          return Object.keys(result).length > 0 ? result : null;
        } catch (error) {
          console.error("Bulk SIM usage request failed:", error);
          return null;
        }
      },
      this.getKey(iccids.join(""), []),
      300,
    );
  }

  /**
   * @param {Object} params - Optional parameters for the request
   * @returns {Promise<Object|null>} SIM topup data
   */
  async simTopups(params = {}) {
    const url = this.buildUrl(params, API_CONSTANTS.ENDPOINTS.SIMS_TOPUPS);

    return Cached.get(
      async () => {
        const response = await this.httpClient
          .setHeaders([`Authorization: Bearer ${this.accessToken}`])
          .get(url);

        return response?.data ? response : null;
      },
      this.getKey(url, params),
      300,
    );
  }

  /**
   * @param {Object} params - Optional parameters for the request
   * @returns {Promise<Object|null>} SIM package history data
   */
  async simPackageHistory(params = {}) {
    const url = this.buildUrl(params, API_CONSTANTS.ENDPOINTS.SIMS_PACKAGES);

    return Cached.get(
      async () => {
        const response = await this.httpClient
          .setHeaders([`Authorization: Bearer ${this.accessToken}`])
          .get(url);

        return response?.data ? response : null;
      },
      this.getKey(url, params),
      900,
    );
  }

  /**
   * @param {Object} params - Request parameters
   * @param {string} [slug] - Optional URL slug
   * @returns {string} Constructed URL
   */
  buildUrl(params, slug = null) {
    if (!params.iccid || !this.isIccid(params.iccid)) {
      throw new AiraloException('The parameter "iccid" is invalid.');
    }

    const iccid = String(params.iccid);

    if (slug === API_CONSTANTS.ENDPOINTS.SIMS_TOPUPS && params["filter[country]"]) {
      const query = new URLSearchParams({ "filter[country]": params["filter[country]"] }).toString();
      slug += `?${query}`;
    }

    return `${this.baseUrl}${API_CONSTANTS.ENDPOINTS.SIMS}/${iccid}/${slug || API_CONSTANTS.ENDPOINTS.SIMS_USAGE}`;
  }

  /**
   * @param {string} url
   * @param {Object} params
   * @returns {string}
   */
  getKey(url, params) {
    const httpHeaders = JSON.stringify(this.config.getHttpHeaders());
    return Crypt.md5(
      `${url}${JSON.stringify(params)}${httpHeaders}${this.accessToken}`,
    );
  }

  /**
   * @param {*} val
   * @returns {boolean}
   */
  isIccid(val) {
    return (
      typeof val === "string" &&
      /^\d+$/.test(val) &&
      val.length >= 18 &&
      val.length <= 22
    );
  }
}

module.exports = SimService;
