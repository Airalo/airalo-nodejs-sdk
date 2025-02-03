const Config = require('./core/Config');
const HttpClient = require('./core/HttpClient');
const OAuthService = require('./services/OAuthService');
const PackagesService = require('./services/PackagesService');
const OrderService = require('./services/OrderService');
const Signature = require('./helpers/Signature');
const SimService = require('./services/SimService');

class Airalo {
  constructor(config) {
    this.initResources(config);
  }

  initResources(config) {
    this.config = new Config(config);
    this.httpClient = new HttpClient(this.config);
    this.signature = new Signature(this.config.getCredentials().client_secret);
    this.oauth = new OAuthService(this.config, this.httpClient, this.signature);
    this.services = {};
  }

  async initialize() {
    this.token = await this.oauth.getAccessToken();

    // Initialize services
    this.services.packages = new PackagesService(
        this.config,
        this.httpClient,
        this.token
    );

    this.services.order = new OrderService(
        this.config,
        this.httpClient,
        this.signature,
        this.token
    );

    this.services.sims = new SimService(
        this.config,
        this.httpClient,
        this.token
    );

    return this;
  }

  // Package methods
  async getAllPackages(flat = false, limit = null, page = null) {
    return this.services.packages.getPackages({
      flat,
      limit,
      page
    });
  }

  async getSimPackages(flat = false, limit = null, page = null) {
    return this.services.packages.getPackages({
      flat,
      limit,
      page,
      simOnly: true
    });
  }

  async getLocalPackages(flat = false, limit = null, page = null) {
    return this.services.packages.getPackages({
      flat,
      limit,
      page,
      type: 'local'
    });
  }

  async getGlobalPackages(flat = false, limit = null, page = null) {
    return this.services.packages.getPackages({
      flat,
      limit,
      page,
      type: 'global'
    });
  }

  async getCountryPackages(countryCode, flat = false, limit = null) {
    return this.services.packages.getPackages({
      flat,
      limit,
      country: countryCode.toUpperCase()
    });
  }

  // Order convenience methods
  async order(packageId, quantity, description = null) {
    return this.services.order.createOrder({
      package_id: packageId,
      quantity,
      type: 'sim',
      description: description ?? 'Order placed via Airalo Node.js SDK'
    });
  }

  async orderWithEmailSimShare(packageId, quantity, esimCloud, description = null) {
    return this.services.order.createOrderWithEmailSimShare(
        {
          package_id: packageId,
          quantity,
          type: 'sim',
          description: description ?? 'Order placed via Airalo Node.js SDK'
        },
        esimCloud
    );
  }

  async orderAsync(packageId, quantity, webhookUrl = null, description = null) {
    return this.services.order.createOrderAsync({
      package_id: packageId,
      quantity,
      type: 'sim',
      description: description ?? 'Order placed via Airalo Node.js SDK',
      webhook_url: webhookUrl
    });
  }

  async orderBulk(packages, description = null) {
    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.services.order.createOrderBulk(packages, description);
  }

  async orderBulkWithEmailSimShare(packages, esimCloud, description = null) {
    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.services.order.createOrderBulkWithEmailSimShare(packages, esimCloud, description);
  }

  async orderAsyncBulk(packages, webhookUrl = null, description = null) {
    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.services.order.createOrderAsyncBulk(packages, webhookUrl, description);
  }

  async getSimUsage(iccid) {
    return this.services.sims.simUsage({ iccid });
  }

  async getSimUsageBulk(iccids) {
    return this.services.sims.simUsageBulk(iccids);
  }

  async getSimTopups(iccid) {
    return this.services.sims.simTopups({ iccid });
  }

  async getSimPackageHistory(iccid) {
    return this.services.sims.simPackageHistory({ iccid });
  }
}

module.exports = Airalo;