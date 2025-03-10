const AiraloException = require("../exceptions/AiraloException");
const CloudSimShareValidator = require("../helpers/CloudSimShareValidator");
const API_CONSTANTS = require("../constants/ApiConstants");
const SDK_CONSTANTS = require("../constants/SdkConstants");

class OrderService {
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

  async createOrder(payload) {
    this.validateOrder(payload);

    const response = await this.httpClient
      .setHeaders(this.getHeaders(payload))
      .post(
        `${this.config.getUrl()}${API_CONSTANTS.ENDPOINTS.ORDERS_SLUG}`,
        payload,
      );

    return response;
  }

  async createOrderWithEmailSimShare(payload, esimCloud) {
    this.validateOrder(payload);
    this.validateCloudSimShare(esimCloud);

    const orderPayload = {
      ...payload,
      to_email: esimCloud.to_email,
      sharing_option: esimCloud.sharing_option,
    };

    if (esimCloud.copy_address) {
      orderPayload.copy_address = esimCloud.copy_address;
    }

    const response = await this.httpClient
      .setHeaders(this.getHeaders(orderPayload))
      .post(
        `${this.config.getUrl()}${API_CONSTANTS.ENDPOINTS.ORDERS_SLUG}`,
        orderPayload,
      );

    return response;
  }

  async createOrderAsync(payload) {
    this.validateOrder(payload);

    const response = await this.httpClient
      .setHeaders(this.getHeaders(payload))
      .post(
        `${this.config.getUrl()}${API_CONSTANTS.ENDPOINTS.ASYNC_ORDERS_SLUG}`,
        payload,
      );

    return response;
  }

  async createOrderBulk(packages, description = null) {
    this.validateBulkOrder(packages);

    const orderPromises = Object.entries(packages).map(
      ([packageId, quantity]) => {
        const payload = {
          package_id: packageId,
          quantity,
          type: "sim",
          description:
            description ?? "Bulk order placed via Airalo Node.js SDK",
        };

        this.validateOrder(payload);

        return this.httpClient
          .setHeaders(this.getHeaders(payload))
          .post(
            `${this.config.getUrl()}${API_CONSTANTS.ENDPOINTS.ORDERS_SLUG}`,
            payload,
          )
          .then((response) => ({ [packageId]: response }))
          .catch((error) => ({
            [packageId]: {
              data: { error: error.message },
              meta: { message: "error" },
            },
          }));
      },
    );

    const responses = await Promise.all(orderPromises);
    return responses.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }

  async createOrderBulkWithEmailSimShare(
    packages,
    esimCloud,
    description = null,
  ) {
    this.validateBulkOrder(packages);
    this.validateCloudSimShare(esimCloud);

    const orderPromises = Object.entries(packages).map(
      ([packageId, quantity]) => {
        const payload = {
          package_id: packageId,
          quantity,
          type: "sim",
          description:
            description ?? "Bulk order placed via Airalo Node.js SDK",
          to_email: esimCloud.to_email,
          sharing_option: esimCloud.sharing_option,
        };

        if (esimCloud.copy_address) {
          payload.copy_address = esimCloud.copy_address;
        }

        this.validateOrder(payload);

        return this.httpClient
          .setHeaders(this.getHeaders(payload))
          .post(
            `${this.config.getUrl()}${API_CONSTANTS.ENDPOINTS.ORDERS_SLUG}`,
            payload,
          )
          .then((response) => ({ [packageId]: response }))
          .catch((error) => ({
            [packageId]: {
              data: { error: error.message },
              meta: { message: "error" },
            },
          }));
      },
    );

    const responses = await Promise.all(orderPromises);
    return responses.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }

  async createOrderAsyncBulk(packages, webhookUrl = null, description = null) {
    this.validateBulkOrder(packages);

    const orderPromises = Object.entries(packages).map(
      ([packageId, quantity]) => {
        const payload = {
          package_id: packageId,
          quantity,
          type: "sim",
          description:
            description ?? "Bulk order placed via Airalo Node.js SDK",
          webhook_url: webhookUrl,
        };

        this.validateOrder(payload);

        return this.httpClient
          .setHeaders(this.getHeaders(payload))
          .post(
            `${this.config.getUrl()}${API_CONSTANTS.ENDPOINTS.ASYNC_ORDERS_SLUG}`,
            payload,
          )
          .then((response) => ({ [packageId]: response }))
          .catch((error) => ({
            [packageId]: {
              data: { error: error.message },
              meta: { message: "error" },
            },
          }));
      },
    );

    const responses = await Promise.all(orderPromises);
    return responses.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }

  getHeaders(payload) {
    return [
      "Content-Type: application/json",
      `Authorization: Bearer ${this.accessToken}`,
      `airalo-signature: ${this.signature.getSignature(payload)}`,
    ];
  }

  validateOrder(payload) {
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

    if (payload.quantity > SDK_CONSTANTS.ORDER_LIMIT) {
      throw new AiraloException(
        `The quantity may not be greater than ${SDK_CONSTANTS.BULK_ORDER_LIMIT}`,
      );
    }
  }

  validateCloudSimShare(simCloudShare) {
    CloudSimShareValidator.validate(simCloudShare, [
      "to_email",
      "sharing_option",
    ]);
  }

  validateBulkOrder(payload) {
    if (Object.keys(payload).length > SDK_CONSTANTS.BULK_ORDER_LIMIT) {
      throw new AiraloException(
        `The packages count may not be greater than ${SDK_CONSTANTS.BULK_ORDER_LIMIT}`,
      );
    }
  }
}

module.exports = OrderService;
