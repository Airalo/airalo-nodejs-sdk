const AiraloException = require("../exceptions/AiraloException");
const CloudSimShareValidator = require("../helpers/CloudSimShareValidator");
const API_CONSTANTS = require("../constants/ApiConstants");
const SDK_CONSTANTS = require("../constants/SdkConstants");

class FutureOrderService {
  constructor(config, httpClient, signature, accessToken) {
    if (!accessToken) {
      throw new AiraloException(
        "Invalid access token please check your credentials",
      );
    }

    this.config = config;
    this.httpClient = httpClient;
    this.signature = signature;
    this.accessToken = accessToken;
  }

  async createFutureOrder(payload) {
    this.validateFutureOrder(payload);
    this.validateCloudSimShare(payload);

    const response = await this.httpClient
      .setHeaders(this.getHeaders(payload))
      .post(
        `${this.config.getUrl()}${API_CONSTANTS.ENDPOINTS.FUTURE_ORDERS}`,
        payload,
      );

    return response;
  }

  async cancelFutureOrder(payload) {
    this.validateCancelFutureOrder(payload);

    const response = await this.httpClient
      .setHeaders(this.getHeaders(payload))
      .post(
        `${this.config.getUrl()}${API_CONSTANTS.ENDPOINTS.CANCEL_FUTURE_ORDERS}`,
        payload,
      );

    return response;
  }

  getHeaders(payload) {
    return [
      "Content-Type: application/json",
      `Authorization: Bearer ${this.accessToken}`,
      `airalo-signature: ${this.signature.getSignature(payload)}`,
    ];
  }

  validateFutureOrder(payload) {
    if (!payload.package_id || payload.package_id === "") {
      throw new AiraloException(
        `The package_id is required, payload: ${JSON.stringify(payload)}`,
      );
    }

    if (payload.quantity < 1) {
      throw new AiraloException(
        `The quantity is required, payload: ${JSON.stringify(payload)}`,
      );
    }

    if (payload.quantity > SDK_CONSTANTS.FUTURE_ORDER_LIMIT) {
      throw new AiraloException(
        `The packages count may not be greater than ${SDK_CONSTANTS.FUTURE_ORDER_LIMIT}`,
      );
    }

    if (!payload.due_date || payload.due_date === "") {
      throw new AiraloException(
        `The due_date is required (format: YYYY-MM-DD HH:mm), payload: ${JSON.stringify(payload)}`,
      );
    }

    // Validate date format (YYYY-MM-DD HH:mm)
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!dateRegex.test(payload.due_date)) {
      throw new AiraloException(
        `The due_date must be in the format YYYY-MM-DD HH:mm, payload: ${JSON.stringify(payload)}`,
      );
    }
  }

  validateCloudSimShare(simCloudShare) {
    CloudSimShareValidator.validate(simCloudShare);
  }

  validateCancelFutureOrder(payload) {
    if (
      !payload.request_ids ||
      !Array.isArray(payload.request_ids) ||
      payload.request_ids.length < 1
    ) {
      throw new AiraloException(
        `The request_ids is required, payload: ${JSON.stringify(payload)}`,
      );
    }
  }
}

module.exports = FutureOrderService;
