---
name: SeamXY port lessons
description: Durable lessons from porting the SeamXY fullstack app into the multi-artifact pnpm workspace.
---

## Key decisions

**registerRoutes over Router refactor**  
Routes.ts was 5045 lines — too large to safely convert to an Express Router. Kept `registerRoutes(app)` and wired it directly into `app.ts` alongside the health router. Functional parity beats pattern compliance.

**Why:** Converting a 5000-line file to a Router pattern is risky and out of scope for a port.

**Skipped OpenAPI spec**  
App had 50+ endpoints. Skipping spec + codegen was the right call; the existing fetch layer (`queryClient.ts`) was preserved instead.

**Why:** Rewriting every page to use generated hooks is too risky for a port.

## Asset alias fix
The copy script sets `@assets` → `../../attached_assets/` (workspace root). But the original client assets were copied to `artifacts/<slug>/src/assets/`. The alias must point to `src/assets/` inside the artifact, not the workspace root.

**Fix:** `'@assets': path.resolve(import.meta.dirname, 'src', 'assets')`

## Stripe missing secret workaround
When STRIPE_SECRET_KEY is absent, routes.ts throws at module load time. Use a Proxy trap instead:
```ts
// @ts-ignore
const stripe: Stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { ... })
  : new Proxy({}, { get() { throw new Error('STRIPE_SECRET_KEY not configured'); } });
```

## DB migration in non-TTY shell
`drizzle-kit push` and `drizzle-kit push --force` both hang waiting for interactive conflict resolution when the schema differs from what's in the DB. Use `drizzle-kit migrate` with pre-existing SQL files (copy from `.migration-backup/migrations/`) instead.

## @shared alias in frontend
Frontend files import from `@shared/schema` and `@shared/training-questions`. Add vite alias pointing to the lib/db/src path, and copy `training-questions.ts` to `lib/db/src/`.

## Connection string priority
Both `SUPABASE_DATABASE_URL` and `NEON_DATABASE_URL` must be tried before `DATABASE_URL`. The lib/db index.ts and drizzle.config.ts both need this fallback chain.

## Missing api-server deps after copy
The copy script doesn't install all legacy app deps. After backend copy, manually add:
`bcrypt express-session connect-pg-simple stripe @anthropic-ai/sdk @aws-sdk/client-s3 @aws-sdk/s3-request-presigner memorystore uuid pg zod axios ws @neondatabase/serverless`
