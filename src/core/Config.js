const API_CONSTANTS = require("../constants/ApiConstants");
const SDK_CONSTANTS = require("../constants/SdkConstants");
const AiraloException = require("../exceptions/AiraloException");

class Config {
  static MANDATORY_CONFIG_KEYS = ["client_id", "client_secret"];

  static ENVIRONMENTS = ["sandbox", "production"];

  static DEFAULT_HEADERS = [
    `airalo-nodejs-sdk: ${SDK_CONSTANTS.VERSION}`,
    "Content-Type: application/json",
  ];

  constructor(data) {
    if (!data) {
      throw new AiraloException("Config data is not provided");
    }

    try {
      this.data =
        typeof data !== "object" ? JSON.parse(JSON.stringify(data)) : data;
    } catch (error) {
      throw new AiraloException(
        `Invalid config data provided, error: ${error.message}`,
      );
    }

    if (!this.data || Object.keys(this.data).length === 0) {
      throw new AiraloException(
        "Invalid config data provided, empty configuration",
      );
    }

    this.validate();
  }

  get(key, defaultValue = null) {
    return this.data[key] ?? defaultValue;
  }

  getConfig() {
    return this.data;
  }

  getCredentials(asString = false) {
    const credentials = {
      client_id: this.data.client_id,
      client_secret: this.data.client_secret,
    };

    return asString ? new URLSearchParams(credentials).toString() : credentials;
  }

  getEnvironment() {
    return this.data.env;
  }

  getUrl() {
    return this.getEnvironment() === "sandbox"
      ? API_CONSTANTS.BASE_URL.sandbox
      : API_CONSTANTS.BASE_URL.production;
  }

  getHttpHeaders() {
    return [...Config.DEFAULT_HEADERS, ...(this.data.http_headers ?? [])];
  }

  validate() {
    const configKeys = Object.keys(this.data);

    for (const key of Config.MANDATORY_CONFIG_KEYS) {
      if (
        !configKeys.includes(key) ||
        !this.data[key] ||
        this.data[key].trim() === ""
      ) {
        throw new AiraloException(
          `Mandatory field '${key}' is missing in the provided config data`,
        );
      }
    }

    if (!this.data.env) {
      this.data.env = "production";
    }

    if (!Config.ENVIRONMENTS.includes(this.data.env)) {
      throw new AiraloException(
        `Invalid environment provided: '${this.data.env}', allowed: ${Config.ENVIRONMENTS.join(", ")}`,
      );
    }

    if (this.data.http_headers !== undefined) {
      if (!Array.isArray(this.data.http_headers)) {
        throw new AiraloException("HTTP headers must be an array");
      }

      for (const header of this.data.http_headers) {
        if (typeof header !== "string" || !header.includes(":")) {
          throw new AiraloException(
            'Invalid HTTP header format. Must be "key: value"',
          );
        }
      }
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(this.data.client_id)) {
      throw new AiraloException("Invalid client_id format");
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(this.data.client_secret)) {
      throw new AiraloException("Invalid client_secret format");
    }
  }
}

module.exports = Config;
