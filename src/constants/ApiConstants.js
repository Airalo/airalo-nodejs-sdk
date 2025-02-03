const API_CONSTANTS = {
    BASE_URL: {
        production: 'https://partners-api.airalo.com/v2/',
        sandbox: 'https://sandbox-partners-api.airalo.com/v2/'
    },
    ENDPOINTS: {
        TOKEN: 'token',
        PACKAGES: 'packages',
        ORDERS_SLUG: 'orders',
        ASYNC_ORDERS_SLUG: 'orders-async',
    }
};

module.exports = API_CONSTANTS;