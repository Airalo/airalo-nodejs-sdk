---
name: release
description: Bump the SDK version consistently in package.json and SdkConstants.VERSION, choosing major/minor/patch from the change. Use when preparing a release, when a behaviour change needs a version bump, or when asked to bump the version.
---

# Bump the SDK version

The version is recorded in two places that must always match:

- `version` in `package.json`
- `VERSION` in `src/constants/SdkConstants.js` (sent as the `airalo-nodejs-sdk` request header)

## 1. Decide whether a bump is needed

- Behaviour change (new method, changed signature, bug fix, changed request/response handling): bump.
- Documentation, tests or tooling only (README, AGENTS.md, `.claude/`, CI): no bump.

## 2. Pick the level (semver)

- **major**: a breaking change to a public method's name, parameters or return shape, or to `Config` requirements.
- **minor**: a new public method or new optional parameter, backwards compatible.
- **patch**: a bug fix with no API change.

Confirm the level with the user if it is not obvious from the diff.

## 3. Apply it

Read the current value from `package.json`, compute the new one, and update **both** files to the same string. Then check they match:

```bash
node -e 'const p=require("./package.json").version,s=require("./src/constants/SdkConstants").VERSION;if(p!==s){console.error(`mismatch: package.json=${p} SdkConstants=${s}`);process.exit(1)}console.error(`ok ${p}`)'
```

Do not edit `package-lock.json`; it is gitignored.

## 4. Verify

```bash
npm run lint
npm test
```

Propose a Conventional Commit message, e.g. `feat: add getFoo endpoint` (minor) or `fix: validate iccid in getSimTopups` (patch). Do not commit, push or tag unless the user asks.
