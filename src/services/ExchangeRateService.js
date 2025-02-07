const AiraloException = require('../exceptions/AiraloException');
const API_CONSTANTS = require('../constants/ApiConstants');
const Cached = require('../helpers/Cached');

class ExchangeRatesService {
  constructor(config, httpClient, accessToken) {
    if (!accessToken) {
      throw new AiraloException('Invalid access token please check your credentials');
    }

    this.config = config;
    this.httpClient = httpClient;
    this.accessToken = accessToken;
    this.baseUrl = this.config.getUrl();
  }

  async exchangeRates(params = {}) {
    this.validateExchangeRatesRequest(params);
    const url = this.buildUrl(params);

    return await Cached.get(async () => {
      return await this.httpClient
          .setHeaders([
            'Accept: application/json',
            'Content-Type: ',
            `Authorization: Bearer ${this.accessToken}`
          ])
          .get(url);
    }, this.getKey(url, params), 300);
  }

  validateExchangeRatesRequest(params) {
    if (params.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(params.date)) {
        throw new AiraloException('Please enter a valid date in the format YYYY-MM-DD');
      }
    }

    if (params.to) {
      const currencyRegex = /^([A-Za-z]{3})(?:,([A-Za-z]{3}))*$/;
      if (!currencyRegex.test(params.to)) {
        throw new AiraloException('Please enter a comma separated list of currency codes. Each code must have 3 letters');
      }
    }
  }

  buildUrl(params) {
    const url = `${this.baseUrl}${API_CONSTANTS.ENDPOINTS.EXCHANGE_RATES_SLUG}?`;
    const queryParams = {};

    if (params.date) {
      queryParams.date = params.date;
    }

    if (params.to) {
      queryParams.to = params.to;
    }

    const queryString = new URLSearchParams(queryParams).toString();
    return queryString ? `${url}${queryString}` : url;
  }

  getKey(url, params) {
    const keyString = url +
        JSON.stringify(params) +
        JSON.stringify(this.config.getHttpHeaders()) +
        this.accessToken;

    return require('crypto')
        .createHash('md5')
        .update(keyString)
        .digest('hex');
  }
}

module.exports = ExchangeRatesService;