---
description: Run the SDK quality gates (lint, tests)
allowed-tools: Bash(npm run lint), Bash(npm test)
---

Run these in order and report each result. Stop at the first failure and show its output.

1. `npm run lint`
2. `npm test`

If both pass, say so in one line. If one fails, explain the cause and propose the fix, but do not apply it unless asked.
