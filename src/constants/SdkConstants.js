const SDK_CONSTANTS = {
  VERSION: "1.0.1",
  BULK_ORDER_LIMIT: 50,
  ORDER_LIMIT: 50,
  VOUCHER_MAX_NUM: 100000,
  VOUCHER_MAX_QUANTITY: 100,
  CACHE: {
    KEY: "airalo_",
    TTL: 86400, // 24 hours in seconds
  },
};

module.exports = SDK_CONSTANTS;
