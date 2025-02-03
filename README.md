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
async function getAllPackages(flat = false, limit = null, page = null)
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
      "countries": ["GR"]
    }
  ]
}
```
By default, no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.

<h3> Get Local Packages </h3>
Fetching local Airalo packages. By default, the response will be the same as the one from packages REST endpoint (more here: https://partners-doc.airalo.com/#d775be27-4c08-45d1-9faa-8ec2c4f97bf5). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async function getLocalPackages(flat = false, limit = null, page = null)
```
By default no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h3> Get Global Packages </h3>
Fetching global Airalo packages. By default, the response will be the same as the one from packages REST endpoint (more here: https://partners-doc.airalo.com/#d775be27-4c08-45d1-9faa-8ec2c4f97bf5). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async function getGlobalPackages(flat = false, limit = null, page = null)
```
By default, no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h3> Get Country Packages </h3>
Fetching country specific Airalo packages. By default, the response will be the same as the one from packages REST endpoint (more here: https://partners-doc.airalo.com/#d775be27-4c08-45d1-9faa-8ec2c4f97bf5). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async function getCountryPackages(countryCode, flat = false, limit = null)
```
By default, no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h3> Get SIM Packages </h3>
Fetching Sim only Airalo packages without top-ups. By default, the response will be the same as the one from packages REST endpoint (more here: https://partners-doc.airalo.com/#d775be27-4c08-45d1-9faa-8ec2c4f97bf5). Passing `flat` as true will return package objects data in a single data object.<br>

```javascript
async function getSimPackages(countryCode, flat = false, limit = null)
```
By default, no limit number of packages will be applied if `limit` is empty<br>
By default it will paginate all pages (multiple calls) or if `page` is provided it will be the starting pagination index.<br>

<h2> Orders </h2>
...

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