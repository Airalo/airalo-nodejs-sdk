# AGENTS.md

Instructions for AI coding agents working in this repository. Human contributors are welcome to read it too.

## Purpose

`airalo-sdk` is the official Node.js SDK for the [Airalo Partner API](https://developers.partners.airalo.com/). It wraps the REST API (`https://partners-api.airalo.com/v2/`) and handles authentication, request signing, response caching and rate limiting for the caller.

## Requirements

- Node.js `>=18.0.0` (see `engines` in `package.json`)
- npm (or Yarn)
- Runtime dependencies: none. Everything in `package.json` is a dev dependency.

## Public surface

The package entry point is `index.js`, which re-exports `src/index.js`:

```javascript
const { Airalo, AiraloStatic, Cached } = require("airalo-sdk");
```

- `Airalo`: instance API. Call `await airalo.initialize()` before any other method.
- `AiraloStatic`: static API with the same methods. Call `await AiraloStatic.init(config)` first.
- `Cached`: the file-based response cache. `Cached.setCachePath(path)` changes the cache directory. The `AIRALO_SDK_CACHE_PATH` env var does the same, and the default is `.cache` in the current working directory.
- TypeScript declarations for `Airalo` live in `src/Airalo.d.ts`.

The only mandatory config keys are `client_id` and `client_secret` (`Config.MANDATORY_CONFIG_KEYS`).

Every public method must exist on **both** `Airalo` and `AiraloStatic`, and behave the same way on each.

## Layout

```
index.js                  package entry, re-exports src/
src/
  Airalo.js               instance API, wires services in initialize()
  AiraloStatic.js         static API, wires services in initServices()
  Airalo.d.ts             TypeScript declarations
  index.js                public exports
  core/                   Config (validation, headers, base URL), HttpClient
  services/               one service per API area (Packages, Order, Sim, Topup, ...)
  helpers/                Cached, Signature, Crypt, CloudSimShareValidator
  constants/              ApiConstants (base URL, endpoints), SdkConstants (version, limits, cache)
  exceptions/             AiraloException
tests/unit/services/      one <Service>.test.js per service
```

## Code conventions

- CommonJS modules (`require` / `module.exports`), ES2023.
- ESLint 9 flat config (`eslint.config.mjs`) with Prettier enforced through `eslint-plugin-prettier`. Formatting problems fail lint.
- One class per file (`max-classes-per-file`).
- No `console.log`. `console.warn` and `console.error` are allowed.
- Prefer `const`, arrow callbacks and object destructuring. The lint rules enforce all three.
- Validation errors are thrown as `AiraloException`.
- Limits and magic numbers belong in `src/constants/SdkConstants.js`, endpoints in `src/constants/ApiConstants.js`.

## Quality gates

Run these in order before opening a PR. CI runs lint and then tests on every pull request to `main`, and both must pass.

```bash
npm install     # package-lock.json is gitignored, so this resolves fresh
npm run lint    # eslint + prettier
npm test        # jest
```

Run a single test file with `npx jest tests/unit/services/Topup.test.js`.

## Testing

- Jest, `testEnvironment: "node"`, matching `**/tests/**/*.test.js`.
- Unit tests only. Never call the live API from tests.
- Mock collaborators instead of the network: stub `OAuthService` with `jest.mock(...)` and pass mock `config`, `httpClient` and `signature` objects to the service under test. Follow the pattern in the existing `tests/unit/services/*.test.js` files.
- Cover each new public method through the service and through both `Airalo` and `AiraloStatic`, and include the validation failure paths.

## Adding or changing an endpoint

1. Add the endpoint path to `src/constants/ApiConstants.js`.
2. Implement it in the matching service under `src/services/`, or add a new service there.
3. Wire the service and expose the method in `src/Airalo.js` **and** `src/AiraloStatic.js`.
4. Update `src/Airalo.d.ts`.
5. Document the method in `README.md` under "Methods Interface".
6. Add or extend tests in `tests/unit/services/`.

## Releases

The SDK version is recorded in two places that must stay in sync: `version` in `package.json` and `VERSION` in `src/constants/SdkConstants.js`. The second value is sent as the `airalo-nodejs-sdk` request header. Bump both for any change that affects behaviour. Documentation-only changes don't need a bump.

## Contributing

- Branch from `main`. Target `main` with the pull request.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages and PR titles (`feat:`, `fix:`, `docs:`, `chore:`, ...).
- Keep each PR to one change, with lint and tests passing.

## Don'ts

- Don't commit `package-lock.json`, `node_modules/`, `.cache/` or `.idea/`. All are gitignored.
- Don't commit credentials. Tests use placeholder values only.
- Don't add runtime dependencies without a strong reason. The SDK currently has none.
