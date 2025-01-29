const Config = require('./core/Config');
const HttpClient = require('./core/HttpClient');
const Signature = require('./helpers/Signature');
const OAuthService = require('./services/OAuthService');
const PackagesService = require('./services/PackagesService');
const AiraloException = require('./exceptions/AiraloException');

class AiraloStatic {
  static pool = {};
  static config;
  static httpClient;
  static signature;
  static oauth;
  static packages;
  static order;
  static voucher;
  static topup;
  static instruction;
  static sim;

  static async init(config) {
    try {
      await this.initResources(config);
      await this.initServices();

      if (Object.keys(this.pool).length === 0) {
        // Store all instances in pool
        const staticProps = Object.getOwnPropertyNames(this)
            .filter(prop => typeof this[prop] !== 'function');

        for (const prop of staticProps) {
          if (this[prop]) {
            this.pool[prop] = this[prop];
          }
        }
      }
    } catch (error) {
      this.pool = {};
      throw new AiraloException(`Airalo SDK initialization failed: ${error.message}`);
    }
  }

  static async getAllPackages(flat = false, limit = null, page = null) {
    this.checkInitialized();
    return this.packages.getPackages({
      flat,
      limit,
      page
    });
  }

  static async getSimPackages(flat = false, limit = null, page = null) {
    this.checkInitialized();
    return this.packages.getPackages({
      flat,
      limit,
      page,
      simOnly: true
    });
  }

  static async getLocalPackages(flat = false, limit = null, page = null) {
    this.checkInitialized();
    return this.packages.getPackages({
      flat,
      limit,
      page,
      type: 'local'
    });
  }

  static async getGlobalPackages(flat = false, limit = null, page = null) {
    this.checkInitialized();
    return this.packages.getPackages({
      flat,
      limit,
      page,
      type: 'global'
    });
  }

  static async getCountryPackages(countryCode, flat = false, limit = null) {
    this.checkInitialized();
    return this.packages.getPackages({
      flat,
      limit,
      country: countryCode.toUpperCase()
    });
  }

  static async initResources(config) {
    this.config = this.pool['config'] ?? new Config(config);
    this.httpClient = this.pool['httpClient'] ?? new HttpClient(this.config);
    this.signature = this.pool['signature'] ?? new Signature(this.config.get('client_secret'));
  }

  static async initServices() {
    this.oauth = this.pool['oauth'] ?? new OAuthService(this.config, this.httpClient, this.signature);
    const token = await this.oauth.getAccessToken();

    this.packages = this.pool['packages'] ?? new PackagesService(this.config, this.httpClient, token);
  }

  static checkInitialized() {
    if (Object.keys(this.pool).length === 0) {
      throw new AiraloException('Airalo SDK is not initialized, please call static method init() first');
    }
  }

  static mock() {
    return new AiraloMock();
  }
}

module.exports = AiraloStatic;