# Airalo Node.js SDK
Airalo's Node.js SDK provides extremely simple integration with the RESTful API and adds extra layer of security on top.

The SDK supports:
- Auto authentication and encryption
- Auto caching and rate limit handling
- Packages fetching of local, global, country and all combined
- Packages auto pagination on endpoints
- Compatible with Unix, macOS, Windows operating systems

# Requirements
- Node.js version >= `18.x`
- NPM or Yarn package manager

# Installation
Install the Airalo SDK using npm:
`npm install airalo-sdk`

OR

Install the Airalo SDK using npm: `yarn add airalo-sdk`

# Initialization
The SDK provides two ways to interact with the API:

- Object usage:
```javascript
const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    env: 'sandbox',                                 // optional, defaults to `production`
});

// Must initialize before using
await airalo.initialize();

const allPackages = await airalo.getAllPackages(true);
```

- Static usage:
```javascript
const { AiraloStatic } = require('airalo-sdk');

// `init` must be called before using any of the methods
await AiraloStatic.init({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    env: 'sandbox',                                 // optional, defaults to `production`
});

const allPackages = await AiraloStatic.getAllPackages(true);
```

# Methods Interface
<h2> Packages </h2>

>**_NOTE:_**<br>
>Passing `true` to `flat` parameter makes the response significantly more compact and easy to handle. However it differs from the main one returned from the endpoints. Be mindful in which occasions you will need the original and in which the compact version. Happy coding!

<h3> Get All Packages </h3>

```javascript
async getAllPackages(flat = false, limit = null, page = null)
```
Fetching all of Airalo's packages. By default, the response will be the same as the one from packages REST endpoint (more here: https://partners-doc.airalo.com/#d775be27-4c08-45d1-9faa-8ec2c4f97bf5). Passing `flat` as true will return package objects data in a single data object, example:
```json
{
  "data": [
    {
      "package_id": "meraki-mobile-7days-1gb",
      "slug": "greece",
      "type": "sim",
      "price": 5,
      "net_price": 4,
      "amount": 1024,
      "day": 7,
      "is_unlimited": false,
      "title": "1 GB - 7 Days",
      "data": "1 GB",
      "short_info": "This eSIM doesn't come with a phone number.",
      "voice": null,
      "text": null,
      "plan_type": "data",
      "activation_policy": "first-usage",
      "operator": {
        "title": "Meraki Mobile",
        "is_roaming": true,
        "info": [
          "LTE Data-only eSIM.",
          "Rechargeable online with no expiry.",
          "Operates on the Wind network in Greece."
        ]
      },
      "countries": [
        "GR"
      ],
      "prices": {
        "net_price": {
          "AUD": 6.44,
          "BRL": 23.52,
          "GBP": 3.2,
          "AED": 14.68,
          "EUR": 3.84,
          "ILS": 14.32,
          "JPY": 616.67,
          "MXN": 82.72,
          "USD": 4.0,
          "VND": 100330.0
        },
        "recommended_retail_price": {
          "AUD": 10.07,
          "BRL": 36.75,
          "GBP": 5.0,
          "AED": 22.93,
          "EUR": 6.01,
          "ILS": 22.38,
          "JPY": 963.54,
          "MXN": 129.25,
          "USD": 6.25,
          "VND": 156765.62
        }
      }
    },
    {
      "package_id": "meraki-mobile-7days-1gb-topup",
      "slug": "greece",
      "type": "topup",
      "price": 5,
      "net_price": 4,
      "amount": 1024,
      "day": 7,
      "is_unlimited": false,
      "title": "1 GB - 7 Days",
      "data": "1 GB",
      "short_info": null,
      "voice": null,
      "text": null,
      "plan_type": "data",
      "activation_policy": "first-usage",
      "operator": {
        "title": "Meraki Mobile",
        "is_roaming": true,
        "info": [
          "LTE Data-only eSIM.",
          "Rechargeable online with no expiry.",
          "Operates on the Wind network in Greece."
        ]
      },
      "countries": [
        "GR"
      ],
      "prices": {
        "net_price": {
          "AUD": 6.44,
          "BRL": 23.52,
          "GBP": 3.2,
          "AED": 14.68,
          "EUR": 3.84,
          "ILS": 14.32,
          "JPY": 616.67,
          "MXN": 82.72,
          "USD": 4.0,
          "VND": 100330.0
        },
        "recommended_retail_price": {
          "AUD": 10.07,
          "BRL": 36.75,
          "GBP": 5.0,
          "AED": 22.93,
          "EUR": 6.01,
          "ILS": 22.38,
          "JPY": 963.54,
          "MXN": 129.25,
          "USD": 6.25,
          "VND": 156765.62
        }
      }
    }
  ]
}
```
By default, no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.

<h3> Get Local Packages </h3>
Fetching local Airalo packages. By default, the response will be the same as the one from packages REST endpoint (more here: https://partners-doc.airalo.com/#d775be27-4c08-45d1-9faa-8ec2c4f97bf5). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async getLocalPackages(flat = false, limit = null, page = null)
```
By default no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h3> Get Global Packages </h3>
Fetching global Airalo packages. By default, the response will be the same as the one from packages REST endpoint (more here: https://partners-doc.airalo.com/#d775be27-4c08-45d1-9faa-8ec2c4f97bf5). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async getGlobalPackages(flat = false, limit = null, page = null)
```
By default, no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h3> Get Country Packages </h3>
Fetching country specific Airalo packages. By default, the response will be the same as the one from packages REST endpoint (more here: https://partners-doc.airalo.com/#d775be27-4c08-45d1-9faa-8ec2c4f97bf5). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async getCountryPackages(countryCode, flat = false, limit = null)
```
By default, no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h3> Get SIM Packages </h3>
Fetching Sim only Airalo packages without top-ups. By default, the response will be the same as the one from packages REST endpoint (more here: https://partners-doc.airalo.com/#d775be27-4c08-45d1-9faa-8ec2c4f97bf5). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async getSimPackages(countryCode, flat = false, limit = null)
```
By default, no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h2> Orders </h2>

<h3> Single Order </h3>

```javascript
async order(packageId, quantity, description = null)
```
Places an order for a given package id (fetched from any of the packages calls) and calls `order` endpoint of the REST API.
Full response example can be found here: https://partners-doc.airalo.com/#768fbbc7-b649-4fb5-9755-be579333a2d9<br>

```javascript
const { Airalo, AiraloStatic } = require('airalo-sdk');

// Instance usage
const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',
    client_secret: '<YOUR_API_CLIENT_SECRET>',
});
await airalo.initialize();

// Get packages and select one
const allPackages = await airalo.getAllPackages(true);
const packageId = allPackages.data[0].package_id;

// Place the order
const order = await airalo.order(packageId, 1);

// Static usage
await AiraloStatic.init({
    client_id: '<YOUR_API_CLIENT_ID>',
    client_secret: '<YOUR_API_CLIENT_SECRET>',
});

const staticOrder = await AiraloStatic.order(packageId, 1);
```

<h3> Async Order </h3>

```javascript
async orderAsync(packageId, quantity, webhookUrl = null, description = null)
```

Places an async order for a given package id (fetched from any of the packages calls) and calls `order-async` endpoint of the REST API.
Full information can be found here: https://partners-doc.airalo.com/#c8471dfc-83d6-4d36-ac8e-6dce2d55a49e<br>

```javascript
const asyncOrder = await airalo.orderAsync(
    'package_123',
    1,
    'https://your-webhook.com/orders'
);

// Static usage
const staticAsyncOrder = await AiraloStatic.orderAsync(
    'package_123',
    1,
    'https://your-webhook.com/orders'
);
```

<h3> Order with Email eSIM Share </h3>

```javascript
async orderWithEmailSimShare(packageId, quantity, esimCloud, description = null)
```

Places an order for a given package id (fetched from any of the packages calls) and calls `order` endpoint of the REST API.<br>
Accepts additional array $esimCloud with mandatory key `to_email` (a valid email address) belonging to an end user and `sharing_option` one of or both: ['link', 'pdf'] with optional list of `copy_address`.<br>
The end user will receive an email with a link button (and pdf attachment if selected) with redirect to a fully managed eSIM page with installation instructions, usage checks.<br>
This method is recommended if you do not intend to handle eSIM management for your users in your applications.<br>
Full response example can be found here: https://partners-doc.airalo.com/#768fbbc7-b649-4fb5-9755-be579333a2d9<br>

```javascript
const order = await airalo.orderWithEmailSimShare(
    'package_123',
    1,
    {
        to_email: 'customer@example.com',
        sharing_option: ['link', 'pdf'],
        copy_address: ['support@example.com']
    }
);

// Static usage
const staticOrder = await AiraloStatic.orderWithEmailSimShare(
    'package_123',
    1,
    {
        to_email: 'customer@example.com',
        sharing_option: ['link', 'pdf']
    }
);
```

<h3> Bulk Order </h3>

```javascript
async orderBulk(packages, description = null)
```
Parameters: array `packages` where the key is the package name and the value represents the desired quantity.
Parallel ordering for multiple packages (up to 50 different package ids) within the same function call.<br>

```javascript
const bulkOrders = await airalo.orderBulk({
    'package_123': 2,  // package_id: quantity
    'package_456': 1
});

// Static usage
const staticBulkOrders = await AiraloStatic.orderBulk({
    'package_123': 2,
    'package_456': 1
});
```

<h3> Async Bulk Order </h3>

```javascript
async orderAsyncBulk(packages, webhookUrl = null, description = null)
```
Parameters: array `packages` where the key is the package name and the value represents the desired quantity.
Parallel async ordering for multiple packages (up to 50 different package ids) within the same function call<br>

```javascript
const asyncBulkOrders = await airalo.orderAsyncBulk(
    {
        'package_123': 2,
        'package_456': 1
    },
    'https://your-webhook.com/bulk-orders'
);

// Static usage
const staticAsyncBulkOrders = await AiraloStatic.orderAsyncBulk(
    {
        'package_123': 2,
        'package_456': 1
    },
    'https://your-webhook.com/bulk-orders'
);
```

> **_NOTE:_**<br>
> For bulk orders, each package ID is a key in the returned response. The quantity of `sims` objects represents the ordered quantity from the initial call.
> If an error occurs in one of the parallel orders, the error response will be assigned to that package ID's key, so you must validate each response.


<h2> Sim Usage </h2>

`async simUsage(string iccid)`<br>

Places an iccid with user iccid  and calls `simUsage` endpoint of the REST API. <br>
Full response example can be found here: https://partners-doc.airalo.com/#e411d932-2993-463f-a548-754c47ac7c00<br>

```javascript
const { Airalo } = require('airalo-sdk');
const { AiraloStatic } = require('airalo-sdk');

async main() {
    const airalo = new Airalo({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET',
        env: 'sandbox'  // or 'production'
    });

    await airalo.initialize();

    const usage = await airalo.getSimUsage('894000000000048447');
    console.log(usage);
}

//
// Static usage
//
async main() {
    const airalo = AiraloStatic.init({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET',
        env: 'sandbox'  // or 'production'
    });

    const usage = await AiraloStatic.getSimUsage('894000000000048447');
    console.log(usage);
}
```

Example response can be found in the API documentation (link above).<br>


`async simUsageBulk(iccids)`<br>

Places an array of iccids and calls `simUsage` endpoint of the REST API in parallel for each of the iccids. <br>
Full response example can be found here: https://partners-doc.airalo.com/#e411d932-2993-463f-a548-754c47ac7c00<br>

```javascript
const { Airalo } = require('airalo-sdk');
const { AiraloStatic } = require('airalo-sdk');

async main() {
    const airalo = new Airalo({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET',
        env: 'sandbox'  // or 'production'
    });

    await airalo.initialize();

    const usages = await airalo.simUsageBulk(['894000000000048447', '894000000000048448']);
    console.log(usages);
}

//
// Static usage
//
async main() {
    const airalo = AiraloStatic.init({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET',
        env: 'sandbox'  // or 'production'
    });

    const usages = await AiraloStatic.simUsageBulk(['894000000000048447', '894000000000048448']);
    console.log(usages);
}
```

Example response can be found in the API documentation (link above). <br>
>**_NOTE:_**<br>
>Each iccid is a key in the returned response.
><br><b>If an error occurs in one of the parallel usage calls, the error REST response will be assigned to the iccid key, so you must make sure to validate each response</b>
<br><br>
<h2> Sim Topups </h2>

`async getSimTopups(iccid)`<br>

Fetches all available topups for the provided `iccid` belonging to an ordered eSIM. <br>
Full response example can be found here: https://partners-doc.airalo.com/#13535dd3-c337-4122-8e97-2fdb93263e86<br>

```javascript
const { Airalo } = require('airalo-sdk');
const { AiraloStatic } = require('airalo-sdk');

async main() {
    const airalo = new Airalo({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET',
        env: 'sandbox'  // or 'production'
    });

    await airalo.initialize();

    const topups = await airalo.getSimTopups('894000000000048447');
    console.log(topups);
}

//
// Static usage
//
async main() {
    const airalo = AiraloStatic.init({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET',
        env: 'sandbox'  // or 'production'
    });

    const topups = await AiraloStatic.getSimTopups('894000000000048447');
    console.log(topups);
}
```

Example response can be found in the API documentation (link above). <br>
<br><br>
<h2> Sim Package History </h2>

`async getSimPackageHistory(iccid)`<br>

Fetches package history for the provided `iccid` belonging to an ordered eSIM. <br>
Full response example can be found here: https://partners-doc.airalo.com/#5e9bdbcb-dce5-42f7-8e41-d7c1d2dba7a5<br>

```javascript
const { Airalo } = require('airalo-sdk');
const { AiraloStatic } = require('airalo-sdk');

async main() {
    const airalo = new Airalo({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET',
        env: 'sandbox'  // or 'production'
    });

    await airalo.initialize();

    const history = await airalo.getSimPackageHistory('894000000000048447');
    console.log(history);
}

//
// Static usage
//
async main() {
    const airalo = AiraloStatic.init({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET',
        env: 'sandbox'  // or 'production'
    });

    const history = await AiraloStatic.getSimPackageHistory('894000000000048447');
    console.log(history);
}
```

Example response can be found in the API documentation (link above). <br>


<h2> Topups </h2>

`async topup(packageId, iccid, description=null)`<br>

Places a topup for a given package id and iccid of an eSIM and calls `topups` endpoint of the REST API.<br>
Full response example can be found here: https://partners-doc.airalo.com/#e411d932-2993-463f-a548-754c47ac7c00<br>

```javascript

const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    env: 'sandbox',                                 // optional, defaults to `production`
});

// Must initialize before using
await airalo.initialize();

const allPackages = await airalo.topup(packageId, iccid);


//
// Static usage
//
const { AiraloStatic } = require('airalo-sdk');

// `init` must be called before using any of the methods
await AiraloStatic.init({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    env: 'sandbox',                                 // optional, defaults to `production`
});

const allPackages = await AiraloStatic.topup(packageId, iccid);
```

<h2> Vouchers </h2>

`async voucher(usageLimit, amount, quantity, isPaid = false, voucherCode = null)` method calls the `voucher` endpoint of the REST API.
Full response example can be found here: https://partners-doc.airalo.com/#768fbbc7-b649-4fb5-9755-be579333a2d9

```javascript
const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    env: 'sandbox',                                 // optional, defaults to `production`
});

// Must initialize before using
await airalo.initialize();

const vouchers = await airalo.voucher(40, 22, 1, false, 'ABC111');


//
// Static usage
//
const { Airalo } = require('airalo-sdk');

await AiraloStatic.init({
    client_id: '<YOUR_API_CLIENT_ID>',
    client_secret: '<YOUR_API_CLIENT_SECRET>'
});

const staticVouchers = await AiraloStatic.voucher(40, 22, 1, false, 'ABC111');
```

Example response:
```json
{
  "data": [
    [
      {
        "id": 677073,
        "code": "MIRO4",
        "usage_limit": 10,
        "amount": 1,
        "is_paid": false,
        "created_at": "2025-02-05 13:51:31"
      }
    ]
  ],
  "meta": {
    "message": "success"
  }
}
```

<h2>Esim Vouchers</h2>

`async esimVouchers(vouchers)` method calls the `voucher/esim` endpoint of the REST API.
Full response example can be found here: https://partners-doc.airalo.com/#5a48bb8d-70d1-4030-ad92-4a82eb979281

```javascript
const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    env: 'sandbox',                                 // optional, defaults to `production`
});

// Must initialize before using
await airalo.initialize();

const vouchers = await airalo.esimVouchers({
    vouchers: [
        {
            package_id: "package_slug",
            quantity: 2
        }
    ]
});


//
// Static usage
//
const { Airalo } = require('airalo-sdk');

await AiraloStatic.init({
    client_id: '<YOUR_API_CLIENT_ID>',
    client_secret: '<YOUR_API_CLIENT_SECRET>'
});

const staticVouchers = await AiraloStatic.esimVouchers({
    vouchers: [
        {
            package_id: "package_slug",
            quantity: 1
        }
    ]
});
```

Example response:
```json
{
  "data": [
    {
      "package_id": "merhaba-7days-1gb",
      "codes": [
        "XAB80SO2"
      ],
      "booking_reference": null
    }
  ],
  "meta": {
    "message": "success"
  }
}
```

# Exchange Rates

### Get Exchange Rates
```javascript
async function getExchangeRates(date = null, source = null, from = null, to = null)
```

Fetches exchange rates for the provided parameters:
- `date`: Date in YYYY-MM-DD format (optional)
- `source`: Always null
- `from`: Always USD
- `to`: Comma-separated list of currency codes to convert to (e.g., 'AUD,GBP,EUR')

NOTE: This endpoint must be enabled before you can use it.
 
Example:
```javascript
const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    env: 'sandbox',                                 // optional, defaults to `production`
});

// Must initialize before using
await airalo.initialize();
const rates = await airalo.getExchangeRates('2025-01-30', null, null, 'AUD,GBP,EUR');

//
// Static usage
//
const { Airalo } = require('airalo-sdk');

await AiraloStatic.init({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    env: 'sandbox',                                 // optional, defaults to `production`
});

const rates = await AiraloStatic.getExchangeRates('2025-01-30', null, null, 'AUD,GBP,EUR');
```

Example Response:
```json
{
  "data": {
    "date": "2025-01-30",
    "rates": [
      {
        "from": "USD",
        "mid": "1.6059162",
        "to": "AUD"
      },
      {
        "from": "USD",
        "mid": "0.80433592",
        "to": "GBP"
      },
      {
        "from": "USD",
        "mid": "0.96191527",
        "to": "EUR"
      }
    ]
  },
  "meta": {
    "message": "success"
  }
}
```

# Technical notes
- Encrypted auth tokens are automatically cached in filesystem for 24h
- Caching is automatically stored in filesystem for 1h
- Utilize the `mock()` methods in Airalo and AiraloStatic for seamless stubbing with your own unit tests
- All exceptions thrown by the SDK are instance of `AiraloException`
- To clear all cache (not recommended to clear cache on production often) you can just do the following:
```javascript
const { Cached } = require('airalo-sdk');
await Cached.clearCache();
```