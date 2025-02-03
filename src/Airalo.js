const Config = require('./core/Config');
const HttpClient = require('./core/HttpClient');
const OAuthService = require('./services/OAuthService');
const PackagesService = require('./services/PackagesService');
const TopupService = require('./services/TopupService');
const Signature = require('./helpers/Signature');

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

    this.services.topup = new TopupService(
        this.config,
        this.httpClient,
        this.signature,
        this.token
    );

    return this;
  }

  // Package methods that use the initialized services
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

  async topup(packageId, iccid, description=null) {
    return this.services.topup.createTopup({
      package_id: packageId,
      iccid,
      description
    });
  }
}

module.exports = Airalo;