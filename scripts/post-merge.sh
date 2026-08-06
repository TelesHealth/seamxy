#!/bin/bash
set -e

echo "▶ Installing dependencies..."
pnpm install --frozen-lockfile=false

# NOTE: Database schema migrations are intentionally NOT run automatically.
# drizzle-kit push may prompt for confirmation on data-loss operations and
# will hang in a non-interactive environment. Run migrations manually:
#   pnpm --filter @workspace/db run push
# or use push-force only after reviewing the planned changes.

echo "▶ Post-merge setup complete."
