const API_CONSTANTS = {
  BASE_URL: {
    production: "https://partners-api.airalo.com/v2/",
    sandbox: "https://sandbox-partners-api.airalo.com/v2/",
  },
  ENDPOINTS: {
    TOKEN: "token",
    PACKAGES: "packages",
    ORDERS_SLUG: "orders",
    ASYNC_ORDERS_SLUG: "orders-async",
    SIMS: "sims",
    SIMS_USAGE: "usage",
    SIMS_TOPUPS: "topups",
    SIMS_PACKAGES: "packages",
    TOPUPS_SLUG: "orders/topups",
    VOUCHERS_SLUG: "voucher/airmoney",
    VOUCHERS_ESIM_SLUG: "voucher/esim",
    EXCHANGE_RATES_SLUG: "finance/exchange-rates",
    INSTRUCTIONS_SLUG: "instructions",
    FUTURE_ORDERS: "future-orders",
    CANCEL_FUTURE_ORDERS: "cancel-future-orders",
  },
};

module.exports = API_CONSTANTS;
