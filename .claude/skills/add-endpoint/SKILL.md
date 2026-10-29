---
name: add-endpoint
description: Add or change an Airalo Partner API endpoint in the SDK end to end: constants, service, both Airalo and AiraloStatic, TypeScript declarations, README and tests. Use when asked to add a new API method, support a new endpoint, or change the signature of an existing public method.
---

# Add or change an endpoint

Every public method lives in several places that must stay in sync. Work through all steps; a partial change breaks parity between `Airalo` and `AiraloStatic`.

## 1. Gather the contract

Before writing code, confirm from the user or the [Partner API docs](https://developers.partners.airalo.com/):

- HTTP method and path (relative to `https://partners-api.airalo.com/v2/`)
- Required and optional parameters, and their validation rules
- Response shape, whether the response should be cached (`Cached`), and whether the request body is signed (`Signature`)

## 2. Endpoint constant

Add the path to `src/constants/ApiConstants.js`. Put any new limits or magic numbers in `src/constants/SdkConstants.js`, never inline.

## 3. Service

Implement the call in the matching service under `src/services/`, or create a new `<Area>Service.js` (one class per file).

- Follow the structure of the closest existing service. Constructors come in two shapes:
  - Read-only endpoints take `(config, httpClient, accessToken)`, e.g. `SimService.js`, `PackagesService.js`.
  - Endpoints with a signed request body take `(config, httpClient, signature, accessToken)`, e.g. `OrderService.js`, `TopupService.js`.
- Wire the service with the same argument order in `Airalo.js` and `AiraloStatic.js`.
- Validate inputs first and throw `AiraloException` with a clear message on failure.
- No `console.log`.

## 4. Wire it into both entry points

- `src/Airalo.js`: instantiate a new service in `initialize()` if you added one, and add the public instance method.
- `src/AiraloStatic.js`: if you added a service, declare it as a static field next to the others (`static fooService;`), then instantiate it in `initServices()` using the same `pool` fallback as every other service:

  ```javascript
  this.fooService =
    this.pool["fooService"] ??
    new FooService(this.config, this.httpClient, token);
  ```

  Then add the matching `static` method with the same name, parameters, defaults and return value. Call `this.checkInitialized()` first, as every other static method does, so an uninitialised SDK throws `AiraloException` instead of a `TypeError`:

  ```javascript
  static async getFoo(params) {
    this.checkInitialized();
    return this.fooService.getFoo(params);
  }
  ```

## 5. TypeScript declarations

Update `src/Airalo.d.ts` with the method signature and any new parameter/response types.

## 6. README

Document the method under "Methods Interface" in `README.md`, matching the style of the neighbouring entries.

## 7. Tests

In `tests/unit/services/<Area>.test.js`, following the existing files:

- Mock `OAuthService` with `jest.mock(...)` and pass mock `config`, `httpClient` and `signature`. Never call the live API.
- Cover the success path through the service, through `Airalo` and through `AiraloStatic`.
- Cover every validation failure path (expect `AiraloException`).

## 8. Verify and version

```bash
npm run lint
npm test
```

Confirm the method exists on `Airalo`, on `AiraloStatic` and in `Airalo.d.ts`. This is a behaviour change, so bump the version with the `release` skill (both `package.json` and `SdkConstants.VERSION`).
