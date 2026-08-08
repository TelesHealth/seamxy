---
name: packageManager pin must match installed pnpm
description: Why pinning packageManager to an unavailable pnpm major bricks every pnpm command in this environment
---
Rule: the root `package.json` `packageManager` field must match the pnpm version actually installed in the Nix environment (`pnpm --version`), currently the 10.x line.

**Why:** A commit pinned `packageManager` to `pnpm@11.20.0` (unavailable here). pnpm then tried to self-install that version on every invocation (`pnpm add pnpm@11.20.0`), got SIGABRT, and every workflow/command failed with a wall of identical errors. Fixed by re-pinning to the installed version.

**How to apply:** If all pnpm commands suddenly fail with repeated `pnpm add pnpm@X` errors, check the `packageManager` field first. When bumping pnpm, verify the version exists in the environment before pinning.
