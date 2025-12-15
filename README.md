# The Official Airalo Partner API NodeJS SDK
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

Install the Airalo SDK using yarn: `yarn add airalo-sdk`

# Initialization
The SDK provides two ways to interact with the API:

- Object usage:
```javascript
const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
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
});

const allPackages = await AiraloStatic.getAllPackages(true);
```

## Cache Configuration

The SDK caches API responses to improve performance. By default, cache files are stored in `.cache` directory relative to your current working directory.

### Custom Cache Location

You can specify a custom cache directory using either of these methods:

**Programmatically:**
```javascript
const Cached = require("../helpers/Cached");

// Set custom cache path
Cached.setCachePath("./my-custom-cache");
```

**Environment Variable:**
```bash
AIRALO_SDK_CACHE_PATH="/path/to/cache"
```

**IMPORTANT: Cache path priority order**

1. Programmatically set path (via `setCachePath()` method)
2. Environment variable (`AIRALO_SDK_CACHE_PATH`)
3. Default path (`.cache` in current working directory)

Both absolute and relative paths are supported. The SDK will automatically create the cache directory if it doesn't exist.

# Methods Interface
<h2> Packages </h2>

>**_NOTE:_**<br>
>Passing `true` to `flat` parameter makes the response significantly more compact and easy to handle. However it differs from the main one returned from the endpoints. Be mindful in which occasions you will need the original and in which the compact version. Happy coding!

<h3> Get All Packages </h3>

```javascript
async getAllPackages(flat = false, limit = null, page = null)
```
Fetching all of Airalo's packages.<br>
NOTE that depending on from the pricing model (field named 'model' in the pricing object) there can be additional fields displayed or hidden. Check the documentation link below for more details.<br>
By default, the response will be the same as the one from packages REST endpoint (more here: https://developers.partners.airalo.com/get-packages-11883036e0). Passing `flat` as true will return package objects data in a single data object, example:
```json
{
  "pricing": {
    "model": "net_pricing",
    "discount_percentage": 0
  },
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
Fetching local Airalo packages. By default, the response will be the same as the one from packages REST endpoint (more here: https://developers.partners.airalo.com/get-packages-11883036e0). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async getLocalPackages(flat = false, limit = null, page = null)
```
By default no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h3> Get Global Packages </h3>
Fetching global Airalo packages. By default, the response will be the same as the one from packages REST endpoint (more here: https://developers.partners.airalo.com/get-packages-11883036e0). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async getGlobalPackages(flat = false, limit = null, page = null)
```
By default, no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h3> Get Universal Packages </h3>
Fetching universal Airalo packages. By default, the response will be the same as the one from packages REST endpoint (more here: https://developers.partners.airalo.com/get-packages-11883036e0). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async getUniversalPackages(flat = false, limit = null, page = null)
```
By default, no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h3> Get Country Packages </h3>
Fetching country specific Airalo packages. By default, the response will be the same as the one from packages REST endpoint (more here: https://developers.partners.airalo.com/get-packages-11883036e0). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async getCountryPackages(countryCode, flat = false, limit = null)
```
By default, no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h3> Get SIM Packages </h3>
Fetching Sim only Airalo packages without top-ups. By default, the response will be the same as the one from packages REST endpoint (more here: https://developers.partners.airalo.com/get-packages-11883036e0). Passing `flat` as true will return package objects data in a single data object.<br>

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
Full response example can be found here: https://developers.partners.airalo.com/submit-order-11883024e0<br>

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
Full information can be found here:  https://developers.partners.airalo.com/submit-order-async-11883025e00<br>

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
Accepts additional array `esimCloud` with mandatory key `to_email` (a valid email address) belonging to an end user and `sharing_option` one of or both: ['link', 'pdf'] with optional list of `copy_address`.<br>
The end user will receive an email with a link button (and pdf attachment if selected) with redirect to a fully managed eSIM page with installation instructions, usage checks.<br>
This method is recommended if you do not intend to handle eSIM management for your users in your applications.<br>

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
Full response example can be found here: https://developers.partners.airalo.com/get-usage-data-text-voice-11883030e0<br>

```javascript
const { Airalo } = require('airalo-sdk');
const { AiraloStatic } = require('airalo-sdk');

async main() {
    const airalo = new Airalo({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET',
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
        
    });

    const usage = await AiraloStatic.getSimUsage('894000000000048447');
    console.log(usage);
}
```

Example response can be found in the API documentation (link above).<br>


`async simUsageBulk(iccids)`<br>

Places an array of iccids and calls `simUsage` endpoint of the REST API in parallel for each of the iccids. <br>
Full response example can be found here: https://developers.partners.airalo.com/get-usage-data-text-voice-11883030e0<br>

```javascript
const { Airalo } = require('airalo-sdk');
const { AiraloStatic } = require('airalo-sdk');

async main() {
    const airalo = new Airalo({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET', 
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

`async getSimTopups(iccid, iso2CountryCode=null)`<br>

Fetches all available topups for the provided `iccid` belonging to an ordered eSIM. <br><br>

Parameters:<br>
`iccid` - the `iccid` from the eSim order<br>
`iso2CountryCode` - optional parameter to filter topups for a specific iso2 country code. Only applicable if the `iccid` is from a universal eSim<br>


Full response example can be found here: https://developers.partners.airalo.com/get-top-up-package-list-11883031e0<br>

```javascript
const { Airalo } = require('airalo-sdk');
const { AiraloStatic } = require('airalo-sdk');

async main() {
    const airalo = new Airalo({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET',
        
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
Full response example can be found here: https://developers.partners.airalo.com/get-esim-package-history-11883032e0<br>

```javascript
const { Airalo } = require('airalo-sdk');
const { AiraloStatic } = require('airalo-sdk');

async main() {
    const airalo = new Airalo({
        client_id: '<YOUR_TOKEN_ID',
        client_secret: 'YOUR_SECRET',
        
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
        
    });

    const history = await AiraloStatic.getSimPackageHistory('894000000000048447');
    console.log(history);
}
```

Example response can be found in the API documentation (link above). <br>


<h2> Topups </h2>

`async topup(packageId, iccid, description=null)`<br>

Places a topup for a given package id and iccid of an eSIM and calls `topups` endpoint of the REST API.<br>
Full response example can be found here: https://developers.partners.airalo.com/submit-top-up-order-11883026e0<br>

```javascript

const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
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
});

const allPackages = await AiraloStatic.topup(packageId, iccid);
```

<h2> Vouchers </h2>

`async voucher(usageLimit, amount, quantity, isPaid = false, voucherCode = null)` method calls the `voucher` endpoint of the REST API.

```javascript
const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    
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
Full response example can be found here: https://developers.partners.airalo.com/esim-voucher-11883065e0<br>

```javascript
const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    
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

<h2> Sim Instructions </h2>

`async getSimInstructions(iccid, language = "en")`<br>
Places an `iccid` with user iccid & `language` with language like en,de. by default its en and calls `getSimInstructions` endpoint of the REST API.
Full response example can be found here: https://developers.partners.airalo.com/get-installation-instructions-11883029e0<br>

```javascript
const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    
});

// Must initialize before using
await airalo.initialize();
const instructions = await airalo.getSimInstructions('893000000000002115');

//
// Static usage
//
const { Airalo } = require('airalo-sdk');

await AiraloStatic.init({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    
});

const instructions = await AiraloStatic.getSimInstructions('893000000000002115');
```
Example response:<br>
```json
{
  "data": {
    "instructions": {
      "language": "EN",
      "ios": [
        {
          "model": null,
          "version": "15.0,14.0.,13.0,12.0",
          "installation_via_qr_code": {
            "steps": {
              "1": "Go to Settings > Cellular/Mobile > Add Cellular/Mobile Plan.",
              "2": "Scan the QR Code.",
              "3": "Tap on 'Add Cellular Plan'.",
              "4": "Label the eSIM.",
              "5": "Choose preferred default line to call or send messages.",
              "6": "Choose the preferred line to use with iMessage, FaceTime, and Apple ID.",
              "7": "Choose the eSIM plan as your default line for Cellular Data and do not turn on 'Allow Cellular Data Switching' to prevent charges on your other line.",
              "8": "Your eSIM has been installed successfully, please scroll down to see the settings for accessing data."
            },
            "qr_code_data": "5a30d830-cfa9-4353-8d76-f103351d53b6",
            "qr_code_url": "https://www.conroy.biz/earum-dolor-qui-molestiae-at"
          },
          "installation_manual": {
            "steps": {
              "1": "Go to Settings > Cellular/Mobile > Add Cellular/Mobile Plan.",
              "2": "Tap on 'Enter Details Manually'.",
              "3": "Enter your SM-DP+ Address and Activation Code.",
              "4": "Tap on 'Add Cellular Plan'.",
              "5": "Label the eSIM.",
              "6": "Choose preferred default line to call or send messages.",
              "7": "Choose the preferred line to use with iMessage, FaceTime, and Apple ID.",
              "8": "Choose the eSIM plan as your default line for Cellular Data and do not turn on 'Allow Cellular Data Switching' to prevent charges on your other line.",
              "9": "Your eSIM has been installed successfully, please scroll down to see the settings for accessing data."
            },
            "smdp_address_and_activation_code": "6a7f7ab6-6469-461d-8b17-2ee5c0207d22"
          },
          "network_setup": {
            "steps": {
              "1": "Select your  eSIM under 'Cellular Plans'.",
              "2": "Ensure that 'Turn On This Line' is toggled on.",
              "3": "Go to 'Network Selection' and select the supported network.",
              "4": "Need help? Chat with us."
            },
            "apn_type": "manual",
            "apn_value": "globaldata",
            "is_roaming": null
          }
        },
        {
          "model": null,
          "version": null,
          "installation_via_qr_code": {
            "steps": {
              "1": "Go to Settings > Cellular/Mobile Data > Add eSIM or Set up Cellular/Mobile Service > Use QR Code on your device. ",
              "2": "Scan the QR code available on the  app, then tap “Continue” twice and wait for a while. Your eSIM will connect to the network, this may take a few minutes, then tap “Done”.",
              "3": "Choose a label for your new eSIM plan.",
              "4": "Choose “Primary” for your default line, then tap “Continue”.",
              "5": "Choose “Primary” you want to use with iMessage and FaceTime for your Apple ID, then tap “Continue”.",
              "6": "Choose your new eSIM plan for cellular/mobile data, then tap “Continue”."
            },
            "qr_code_data": "5a30d830-cfa9-4353-8d76-f103351d53b6",
            "qr_code_url": "https://www.conroy.biz/earum-dolor-qui-molestiae-at"
          },
          "installation_manual": {
            "steps": {
              "1": "Go to Settings > Cellular/Mobile Data > Add eSIM or Set up Cellular/Mobile Service > Use QR Code on your device.",
              "2": "Tap “Enter Details Manually” and enter the SM-DP+ Address and Activation Code available on the  app by copying them, tap “Next”, then tap “Continue” twice and wait for a while. Your eSIM will connect to the network, this may take a few minutes, then tap “Done”.",
              "3": "Choose a label for your new eSIM plan.",
              "4": "Choose “Primary” for your default line, then tap “Continue”.",
              "5": "Choose “Primary” you want to use with iMessage and FaceTime for your Apple ID, then tap “Continue”.",
              "6": "Choose your new eSIM plan for cellular/mobile data, then tap “Continue”."
            },
            "smdp_address_and_activation_code": "6a7f7ab6-6469-461d-8b17-2ee5c0207d22"
          },
          "network_setup": {
            "steps": {
              "1": "Go to “Cellular/Mobile Data”, then select the recently downloaded eSIM on your device. Enable the “Turn On This Line” toggle, then select your new eSIM plan for cellular/mobile data. ",
              "2": "Tap “Network Selection”, disable the “Automatic” toggle, then select the supported network available on the  app manually if your eSIM has connected to the wrong network."
            },
            "apn_type": "manual",
            "apn_value": "globaldata",
            "is_roaming": null
          }
        }
      ],
      "android": [
        {
          "model": null,
          "version": null,
          "installation_via_qr_code": {
            "steps": {
              "1": "Go to Settings > Connections > SIM Card Manager.",
              "2": "Tap on 'Add Mobile Plan'.",
              "3": "Tap on 'Scan Carrier QR Code' and tap on 'Add'.",
              "4": "When the plan has been registered, tap 'Ok' to turn on a new mobile plan.",
              "5": "Your eSIM has been installed successfully, please scroll down to see the settings for accessing data."
            },
            "qr_code_data": "5a30d830-cfa9-4353-8d76-f103351d53b6",
            "qr_code_url": "https://www.conroy.biz/earum-dolor-qui-molestiae-at"
          },
          "installation_manual": {
            "steps": {
              "1": "Go to Settings > Connections > SIM Card Manager.",
              "2": "Tap on 'Add Mobile Plan'.",
              "3": "Tap on 'Scan Carrier QR Code' and tap on 'Enter code instead'.",
              "4": "Enter the Activation Code (SM-DP+ Address & Activation Code).",
              "5": "When the plan has been registered, tap 'Ok' to turn on a new mobile plan.",
              "6": "Your eSIM has been installed successfully, please scroll down to see the settings for accessing data."
            },
            "smdp_address_and_activation_code": "6a7f7ab6-6469-461d-8b17-2ee5c0207d22"
          },
          "network_setup": {
            "steps": {
              "1": "In the 'SIM Card Manager' select your  eSIM.",
              "2": "Ensure that your eSIM is turned on under 'Mobile Networks'.",
              "3": "Enable the Mobile Data.",
              "4": "Go to Settings > Connections > Mobile networks > Network Operators.",
              "5": "Ensure that the supported network is selected.",
              "6": "Need help? Chat with us."
            },
            "apn_type": "automatic",
            "apn_value": "globaldata",
            "is_roaming": null
          }
        },
        {
          "model": null,
          "version": null,
          "installation_via_qr_code": {
            "steps": {
              "1": "Go to Settings > Network & internet.",
              "2": "Tap on the '+' (Add) icon next to the Mobile network.",
              "3": "Tap 'Next' when asked, “Don’t have a SIM card?”.",
              "4": "Scan the QR Code.",
              "5": "Your eSIM has been installed successfully, please scroll down to see the settings for accessing data."
            },
            "qr_code_data": "5a30d830-cfa9-4353-8d76-f103351d53b6",
            "qr_code_url": "https://www.conroy.biz/earum-dolor-qui-molestiae-at"
          },
          "installation_manual": {
            "steps": {
              "1": "Go to Settings > Network & internet.",
              "2": "Tap on the '+' (Add) icon next to the Mobile network.",
              "3": "Tap on 'Next' when asked, “Don’t have a SIM card?”.",
              "4": "Tap 'Enter Code Manually'. You will be asked to enter your Activation Code (SM-DP+ Adress & Activation Code).",
              "5": "Your eSIM has been installed successfully, please scroll down to see the settings for accessing data."
            },
            "smdp_address_and_activation_code": "6a7f7ab6-6469-461d-8b17-2ee5c0207d22"
          },
          "network_setup": {
            "steps": {
              "1": "Go to Network & internet and tap on 'Mobile network'.",
              "2": "Connect manually to the supported network.",
              "3": "Turn on eSIM under 'Mobile network'.",
              "4": "Enable the Mobile Data.",
              "5": "Need help? Chat with us."
            },
            "apn_type": "automatic",
            "apn_value": "globaldata",
            "is_roaming": null
          }
        },
        {
          "model": "Galaxy",
          "version": "1",
          "installation_via_qr_code": {
            "steps": {
              "1": "Go to “Settings”, tap “Connections”, then tap “SIM card manager” on your device.",
              "2": "Tap “Add mobile plan”, then tap “Scan carrier QR code”.",
              "3": "Tap “Enter activation code”.",
              "4": "Enter the SM-DP+ Address & Activation Code by copying it, tap “Connect”, then tap “Confirm”."
            },
            "qr_code_data": "5a30d830-cfa9-4353-8d76-f103351d53b6",
            "qr_code_url": "https://www.conroy.biz/earum-dolor-qui-molestiae-at"
          },
          "installation_manual": {
            "steps": {
              "1": "Go to “Settings”, tap “Connections”, then tap “SIM card manager” on your device.",
              "2": "Tap “Add mobile plan”, then tap “Scan carrier QR code”.",
              "3": "Tap “Enter activation code”.",
              "4": "Enter the SM-DP+ Address & Activation Code by copying it, tap “Connect”, then tap “Confirm”."
            },
            "smdp_address_and_activation_code": "6a7f7ab6-6469-461d-8b17-2ee5c0207d22"
          },
          "network_setup": {
            "steps": {
              "1": "Go to “Settings”, tap “Connections”, then tap “SIM card manager” on your device.",
              "2": "Tap “Add mobile plan”, then tap “Scan carrier QR code”.",
              "3": "Tap “Enter activation code”.",
              "4": "Enter the SM-DP+ Address & Activation Code by copying it, tap “Connect”, then tap “Confirm”."
            },
            "apn_type": "automatic",
            "apn_value": "globaldata",
            "is_roaming": null
          }
        }
      ]
    }
  },
  "meta": {
    "message": "success"
  }
}
```

<br><br>
<h2> Future Orders </h2>

`async createFutureOrder(packageId, quantity, dueDate, webhookUrl = null, description = null, brandSettingsName = null, toEmail = null, sharingOption = null, copyAddress = null)`<br>

Places future order for a given package id (fetched from any of the packages calls) and calls `future-orders` endpoint of the REST API.
>**_NOTE:_**<br>
>`dueDate` should always be in UTC timezone and in the format `YYYY-MM-DD HH:MM`<br>

```javascript
const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    
});

// Must initialize before using
await airalo.initialize();
const futureOrder = await airalo.createFutureOrder(
    'package_id', // mandatory
    1, // mandatory
    '2025-03-10 10:00', // mandatory
    'https://your-webhook.com',
    'Test description from NodeJS SDK',
    null,
    'end.user.email@domain.com', // mandatory
    ['link', 'pdf'],
    ['other.user.email@domain.com'] // optional
);

//
// Static usage
//
const { Airalo } = require('airalo-sdk');

await AiraloStatic.init({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    
});

const futureOrder = await AiraloStatic.createFutureOrder(
    'package_id', // mandatory
    1, // mandatory
    '2025-03-10 10:00', // mandatory
    'https://your-webhook.com',
    'Test description from NodeJS SDK',
    null,
    'end.user.email@domain.com', // mandatory
    ['link', 'pdf'],
    ['other.user.email@domain.com'] // optional
);
```
<br><br>
Example response for the call:<br>
```json
{
  "data": {
    "request_id": "bUKdUc0sVB_nXJvlz0l8rTqYR",
    "due_date": "2025-03-10 10:00",
    "latest_cancellation_date": "2025-03-09 10:00"
  },
  "meta": {
    "message": "success"
  }
}
```

<br><br>
<h2> Cancel Future Orders </h2>

`async cancelFutureOrder(requestIds)`<br>

Cancels future orders and calls `cancel-future-orders` endpoint of the REST API.
```javascript
const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    
});

// Must initialize before using
await airalo.initialize();
const cancelFutureOrders = await airalo.cancelFutureOrder(
    'request_id_1',
    'request_id_2',
    'request_id_3',
);

//
// Static usage
//
const { AiraloStatic } = require('airalo-sdk');

await AiraloStatic.init({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    
});

const futureOrder = await AiraloStatic.cancelFutureOrder(
    'request_id_1',
    'request_id_2',
    'request_id_3',
);
```
<br><br>
Example response for the call:<br>
```json
{
  "data": {},
  "meta": {
    "message": "Future orders cancelled successfully"
  }
}
```
<br>
<h2> Get Compatible Devices </h2>

`async getCompatibleDevices()`<br>

Calls the compatible eSIM devices endpoint of the REST API.
```javascript

const { Airalo } = require('airalo-sdk');

const airalo = new Airalo({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    
});

const devices = await airalo.getCompatibleDevices();

//
// Static usage
//
const { AiraloStatic } = require('airalo-sdk');

await AiraloStatic.init({
    client_id: '<YOUR_API_CLIENT_ID>',              // mandatory
    client_secret: '<YOUR_API_CLIENT_SECRET>',      // mandatory
    
});

const devices = await AiraloStatic.getCompatibleDevices();
```
<br><br>
Example response for the call:<br>
```json
{
    "data": [
        {
            "os": "android",
            "brand": "ABCTECH",
            "name": "X20"
        },
        {
            "os": "android",
            "brand": "Asus",
            "name": "ZenFone Max Pro M1 (ZB602KL) (WW) / Max Pro M1 (ZB601KL) (IN)"
        },
        {
            "os": "android",
            "brand": "Asus",
            "name": "ZenFone Max Pro M1 (ZB602KL) (WW) / Max Pro M1 (ZB601KL) (IN)"
        },
        ...
        ...
        ...
    ]
}
```
<br>

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