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