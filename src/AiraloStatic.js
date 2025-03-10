const Config = require("./core/Config");
const HttpClient = require("./core/HttpClient");
const Signature = require("./helpers/Signature");
const OAuthService = require("./services/OAuthService");
const PackagesService = require("./services/PackagesService");
const OrderService = require("./services/OrderService");
const TopupService = require("./services/TopupService");
const AiraloException = require("./exceptions/AiraloException");
const SimService = require("./services/SimService");
const VoucherService = require("./services/VoucherService");
const ExchangeRateService = require("./services/ExchangeRateService");
const InstallationInstructionsService = require("./services/InstallationInstructionsService");
const FutureOrderService = require("./services/FutureOrderService");

class AiraloStatic {
  static pool = {};
  static config;
  static httpClient;
  static signature;
  static oauth;
  static packagesService;
  static orderService;
  static topupService;
  static simService;
  static voucherService;
  static exchangeRateService;
  static installationInstructionsService;
  static futureOrderService;

  static async init(config) {
    try {
      await this.initResources(config);
      await this.initServices();

      if (Object.keys(this.pool).length === 0) {
        // Store all instances in pool
        const staticProps = Object.getOwnPropertyNames(this).filter(
          (prop) => typeof this[prop] !== "function",
        );

        for (const prop of staticProps) {
          if (this[prop]) {
            this.pool[prop] = this[prop];
          }
        }
      }
    } catch (error) {
      this.pool = {};
      throw new AiraloException(
        `Airalo SDK initialization failed: ${error.message}`,
      );
    }
  }

  // Package methods
  static async getAllPackages(flat = false, limit = null, page = null) {
    this.checkInitialized();
    return this.packagesService.getPackages({
      flat,
      limit,
      page,
    });
  }

  static async getSimPackages(flat = false, limit = null, page = null) {
    this.checkInitialized();
    return this.packagesService.getPackages({
      flat,
      limit,
      page,
      simOnly: true,
    });
  }

  static async getLocalPackages(flat = false, limit = null, page = null) {
    this.checkInitialized();
    return this.packagesService.getPackages({
      flat,
      limit,
      page,
      type: "local",
    });
  }

  static async getGlobalPackages(flat = false, limit = null, page = null) {
    this.checkInitialized();
    return this.packagesService.getPackages({
      flat,
      limit,
      page,
      type: "global",
    });
  }

  static async getCountryPackages(countryCode, flat = false, limit = null) {
    this.checkInitialized();
    return this.packagesService.getPackages({
      flat,
      limit,
      country: countryCode.toUpperCase(),
    });
  }

  // Order convenience methods
  static async order(packageId, quantity, description = null) {
    this.checkInitialized();
    return this.orderService.createOrder({
      package_id: packageId,
      quantity,
      type: "sim",
      description: description ?? "Order placed via Airalo Node.js SDK",
    });
  }

  static async orderWithEmailSimShare(
    packageId,
    quantity,
    esimCloud,
    description = null,
  ) {
    this.checkInitialized();
    return this.orderService.createOrderWithEmailSimShare(
      {
        package_id: packageId,
        quantity,
        type: "sim",
        description: description ?? "Order placed via Airalo Node.js SDK",
      },
      esimCloud,
    );
  }

  static async orderAsync(
    packageId,
    quantity,
    webhookUrl = null,
    description = null,
  ) {
    this.checkInitialized();
    return this.orderService.createOrderAsync({
      package_id: packageId,
      quantity,
      type: "sim",
      description: description ?? "Order placed via Airalo Node.js SDK",
      webhook_url: webhookUrl,
    });
  }

  static async orderBulk(packages, description = null) {
    this.checkInitialized();
    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.orderService.createOrderBulk(packages, description);
  }

  static async orderBulkWithEmailSimShare(
    packages,
    esimCloud,
    description = null,
  ) {
    this.checkInitialized();
    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.orderService.createOrderBulkWithEmailSimShare(
      packages,
      esimCloud,
      description,
    );
  }

  static async orderAsyncBulk(packages, webhookUrl = null, description = null) {
    this.checkInitialized();
    if (!packages || Object.keys(packages).length === 0) {
      return null;
    }
    return this.orderService.createOrderAsyncBulk(
      packages,
      webhookUrl,
      description,
    );
  }

  static async getSimUsage(iccid) {
    this.checkInitialized();
    return this.simService.simUsage({ iccid });
  }

  static async getSimUsageBulk(iccids) {
    this.checkInitialized();
    return this.simService.simUsageBulk(iccids);
  }

  static async getSimTopups(iccid) {
    this.checkInitialized();
    return this.simService.simTopups({ iccid });
  }

  static async getSimPackageHistory(iccid) {
    this.checkInitialized();
    return this.simService.simPackageHistory({ iccid });
  }

  static async topup(
    packageId,
    iccid,
    description = "Topup placed from Nodejs SDK",
  ) {
    this.checkInitialized();
    return this.topupService.createTopup({
      package_id: packageId,
      iccid,
      description,
    });
  }

  static async voucher(
    usageLimit,
    amount,
    quantity,
    isPaid = false,
    voucherCode = null,
  ) {
    this.checkInitialized();
    return this.voucherService.createVoucher({
      voucher_code: voucherCode,
      usage_limit: usageLimit,
      amount,
      quantity,
      is_paid: isPaid,
    });
  }

  static async esimVouchers(payload) {
    this.checkInitialized();
    return this.voucherService.createEsimVoucher({
      vouchers: payload?.vouchers,
    });
  }

  static async getExchangeRates(
    date = null,
    source = null,
    from = null,
    to = null,
  ) {
    this.checkInitialized();
    return this.exchangeRateService.exchangeRates({
      date,
      source,
      from,
      to,
    });
  }

  static async getSimInstructions(iccid, language = "en") {
    this.checkInitialized();
    return this.installationInstructionsService.getInstructions({
      iccid,
      language,
    });
  }

  static async createFutureOrder(
    packageId,
    quantity,
    dueDate,
    webhookUrl = null,
    description = null,
    brandSettingsName = null,
    toEmail = null,
    sharingOption = null,
    copyAddress = null,
  ) {
    this.checkInitialized();
    return this.futureOrderService.createFutureOrder({
      package_id: packageId,
      quantity,
      due_date: dueDate,
      webhook_url: webhookUrl,
      description: description ?? "Future order placed via Airalo Node.js SDK",
      brand_settings_name: brandSettingsName,
      to_email: toEmail,
      sharing_option: sharingOption,
      copy_address: copyAddress,
    });
  }

  static async cancelFutureOrder(requestIds) {
    this.checkInitialized();
    return this.futureOrderService.cancelFutureOrder({
      request_ids: requestIds,
    });
  }

  static async initResources(config) {
    this.config = this.pool["config"] ?? new Config(config);
    this.httpClient = this.pool["httpClient"] ?? new HttpClient(this.config);
    this.signature =
      this.pool["signature"] ?? new Signature(this.config.get("client_secret"));
  }

  static async initServices() {
    this.oauth =
      this.pool["oauth"] ??
      new OAuthService(this.config, this.httpClient, this.signature);
    const token = await this.oauth.getAccessToken();

    this.orderService =
      this.pool["orderService"] ??
      new OrderService(this.config, this.httpClient, this.signature, token);
    this.topupService =
      this.pool["topupService"] ??
      new TopupService(this.config, this.httpClient, this.signature, token);
    this.voucherService =
      this.pool["voucherService"] ??
      new VoucherService(this.config, this.httpClient, this.signature, token);
    this.packagesService =
      this.pool["packagesService"] ??
      new PackagesService(this.config, this.httpClient, token);
    this.orderService =
      this.pool["orderService"] ??
      new OrderService(this.config, this.httpClient, this.signature, token);
    this.simService =
      this.pool["simService"] ??
      new SimService(this.config, this.httpClient, token);
    this.exchangeRateService =
      this.pool["exchangeRateService"] ??
      new ExchangeRateService(this.config, this.httpClient, token);
    this.installationInstructionsService =
      this.pool["installationInstructionsService"] ??
      new InstallationInstructionsService(this.config, this.httpClient, token);
    this.futureOrderService =
      this.pool["futureOrderService"] ??
      new FutureOrderService(
        this.config,
        this.httpClient,
        this.signature,
        token,
      );
  }

  static checkInitialized() {
    if (Object.keys(this.pool).length === 0) {
      throw new AiraloException(
        "Airalo SDK is not initialized, please call static method init() first",
      );
    }
  }
}

module.exports = AiraloStatic;
