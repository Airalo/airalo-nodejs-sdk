const Config = require("./core/Config");
const HttpClient = require("./core/HttpClient");
const OAuthService = require("./services/OAuthService");
const PackagesService = require("./services/PackagesService");
const OrderService = require("./services/OrderService");
const TopupService = require("./services/TopupService");
const Signature = require("./helpers/Signature");
const SimService = require("./services/SimService");
const VoucherService = require("./services/VoucherService");
const ExchangeRateService = require("./services/ExchangeRateService");
const AiraloException = require("./exceptions/AiraloException");

class Airalo {
  constructor(config) {
    this.initResources(config);

    this.initCalled = false;
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
      this.token,
    );
    this.services.order = new OrderService(
      this.config,
      this.httpClient,
      this.signature,
      this.token,
    );
    this.services.sims = new SimService(
      this.config,
      this.httpClient,
      this.token,
    );
    this.services.topup = new TopupService(
      this.config,
      this.httpClient,
      this.signature,
      this.token,
    );
    this.services.vouchers = new VoucherService(
      this.config,
      this.httpClient,
      this.signature,
      this.token,
    );
    this.services.exchangeRates = new ExchangeRateService(
      this.config,
      this.httpClient,
      this.token,
    );

    this.initCalled = true;

    return this;
  }

  // Package methods
  async getAllPackages(flat = false, limit = null, page = null) {
    this._isInitialised();

    return this.services.packages.getPackages({
      flat,
      limit,
      page,
    });
  }

  async getSimPackages(flat = false, limit = null, page = null) {
    this._isInitialised();

    return this.services.packages.getPackages({
      flat,
      limit,
      page,
      simOnly: true,
    });
  }

  async getLocalPackages(flat = false, limit = null, page = null) {
    this._isInitialised();

    return this.services.packages.getPackages({
      flat,
      limit,
      page,
      type: "local",
    });
  }

  async getGlobalPackages(flat = false, limit = null, page = null) {
    this._isInitialised();

    return this.services.packages.getPackages({
      flat,
      limit,
      page,
      type: "global",
    });
  }

  async getCountryPackages(countryCode, flat = false, limit = null) {
    this._isInitialised();

    return this.services.packages.getPackages({
      flat,
      limit,
      country: countryCode.toUpperCase(),
    });
  }

  async topup(packageId, iccid, description = "Topup placed from Nodejs SDK") {
    this._isInitialised();

    return this.services.topup.createTopup({
      package_id: packageId,
      iccid,
      description,
    });
  }

  // Order convenience methods
  async order(packageId, quantity, description = null) {
    this._isInitialised();

    return this.services.order.createOrder({
      package_id: packageId,
      quantity,
      type: "sim",
      description: description ?? "Order placed via Airalo Node.js SDK",
    });
  }

  async orderWithEmailSimShare(
    packageId,
    quantity,
    esimCloud,
    description = null,
  ) {
    this._isInitialised();

    return this.services.order.createOrderWithEmailSimShare(
      {
        package_id: packageId,
        quantity,
        type: "sim",
        description: description ?? "Order placed via Airalo Node.js SDK",
      },
      esimCloud,
    );
  }

  async orderAsync(packageId, quantity, webhookUrl = null, description = null) {
    this._isInitialised();

    return this.services.order.createOrderAsync({
      package_id: packageId,
      quantity,
      type: "sim",
      description: description ?? "Order placed via Airalo Node.js SDK",
      webhook_url: webhookUrl,
    });
  }

  async orderBulk(packages, description = null) {
    this._isInitialised();

    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.services.order.createOrderBulk(packages, description);
  }

  async orderBulkWithEmailSimShare(packages, esimCloud, description = null) {
    this._isInitialised();

    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.services.order.createOrderBulkWithEmailSimShare(
      packages,
      esimCloud,
      description,
    );
  }

  async orderAsyncBulk(packages, webhookUrl = null, description = null) {
    this._isInitialised();

    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.services.order.createOrderAsyncBulk(
      packages,
      webhookUrl,
      description,
    );
  }

  async getSimUsage(iccid) {
    this._isInitialised();

    return this.services.sims.simUsage({ iccid });
  }

  async getSimUsageBulk(iccids) {
    this._isInitialised();

    return this.services.sims.simUsageBulk(iccids);
  }

  async getSimTopups(iccid) {
    this._isInitialised();

    return this.services.sims.simTopups({ iccid });
  }

  async getSimPackageHistory(iccid) {
    this._isInitialised();

    return this.services.sims.simPackageHistory({ iccid });
  }

  async voucher(
    usageLimit,
    amount,
    quantity,
    isPaid = false,
    voucherCode = null,
  ) {
    this._isInitialised();

    return this.services.vouchers.createVoucher({
      voucher_code: voucherCode,
      usage_limit: usageLimit,
      amount,
      quantity,
      is_paid: isPaid,
    });
  }

  async esimVouchers(payload) {
    this._isInitialised();

    return this.services.vouchers.createEsimVoucher({
      vouchers: payload?.vouchers,
    });
  }

  async getExchangeRates(date = null, source = null, from = null, to = null) {
    this._isInitialised();
    return this.services.exchangeRates.exchangeRates({
      date,
      source,
      from,
      to,
    });
  }

  _isInitialised() {
    if (!this.initCalled) {
      throw new AiraloException(
        "Airalo SDK not initialized. Please call initialize() method first.",
      );
    }
  }
}

module.exports = Airalo;
