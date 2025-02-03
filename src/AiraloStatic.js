const Config = require('./core/Config');
const HttpClient = require('./core/HttpClient');
const Signature = require('./helpers/Signature');
const OAuthService = require('./services/OAuthService');
const PackagesService = require('./services/PackagesService');
const OrderService = require('./services/OrderService');
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

  // Package methods
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

  // Order convenience methods
  static async order(packageId, quantity, description = null) {
    this.checkInitialized();
    return this.order.createOrder({
      package_id: packageId,
      quantity,
      type: 'sim',
      description: description ?? 'Order placed via Airalo Node.js SDK'
    });
  }

  static async orderWithEmailSimShare(packageId, quantity, esimCloud, description = null) {
    this.checkInitialized();
    return this.order.createOrderWithEmailSimShare(
        {
          package_id: packageId,
          quantity,
          type: 'sim',
          description: description ?? 'Order placed via Airalo Node.js SDK'
        },
        esimCloud
    );
  }

  static async orderAsync(packageId, quantity, webhookUrl = null, description = null) {
    this.checkInitialized();
    return this.order.createOrderAsync({
      package_id: packageId,
      quantity,
      type: 'sim',
      description: description ?? 'Order placed via Airalo Node.js SDK',
      webhook_url: webhookUrl
    });
  }

  static async orderBulk(packages, description = null) {
    this.checkInitialized();
    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.order.createOrderBulk(packages, description);
  }

  static async orderBulkWithEmailSimShare(packages, esimCloud, description = null) {
    this.checkInitialized();
    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.order.createOrderBulkWithEmailSimShare(packages, esimCloud, description);
  }

  static async orderAsyncBulk(packages, webhookUrl = null, description = null) {
    this.checkInitialized();
    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.order.createOrderAsyncBulk(packages, webhookUrl, description);
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
    this.order = this.pool['order'] ?? new OrderService(this.config, this.httpClient, this.signature, token);
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