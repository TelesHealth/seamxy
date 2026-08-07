# SeamXY — Findings & Recommendations

Derived from the August 2026 codebase reference. Work through phases in order and stop for approval between each.

**Standing instruction for the agent:**

> Some findings below are inferred from documentation rather than read from source. Before changing anything in a phase, verify the finding against the actual code and tell me what you found. If a finding is wrong, say so and skip it — do not manufacture a fix. If a finding is right but the fix is riskier than described, say that too.

---

## PHASE 1 — Schema fork (blocking)

Nothing else should land until this is resolved. The known-sharp-edges section states that `.migration-backup/shared/schema.ts` is what the running API server actually uses, while `lib/db` is the forward-going schema home. If accurate, schema changes made in the intended location have no effect on the running app, and any work either of us does in `lib/db` will silently do nothing.

```
Resolve the schema fork before any other work.

1. Confirm the situation. Which schema does artifacts/api-server actually
   import at runtime — lib/db, or .migration-backup/shared/schema.ts? Show me
   the import chain from the server entrypoint.
2. Diff the two schemas. What tables, columns, or types exist in one and not
   the other? Report the full diff before changing anything.
3. Propose a consolidation plan: make lib/db authoritative, repoint the API
   server, and confirm every table the running app depends on is present.
   Do not delete .migration-backup until the app runs green against lib/db.
4. Confirm pnpm --filter @workspace/db run push targets the same database the
   API server reads from.
5. After consolidation: run pnpm run typecheck and pnpm run build, and confirm
   the app boots and a representative read/write path works end to end.

Report the diff and your plan. Do not execute the consolidation until I approve.
```

---

## PHASE 2 — Database connection ambiguity

Two connection strings and two client libraries are configured: `NEON_DATABASE_URL` with `@neondatabase/serverless`, and `SUPABASE_DATABASE_URL` described as a fallback, with `pg`.

```
Clarify the database connection setup.

1. Show me where each of NEON_DATABASE_URL and SUPABASE_DATABASE_URL is read,
   and the logic that selects between them.
2. Do these point at the same Postgres instance or two different ones? If two,
   is any code path writing to both, or reading from one and writing to the
   other?
3. If Supabase is a leftover from migration, remove it — the env var, the
   client, and the fallback logic — so a mis-set env cannot silently point at
   a stale database.
4. If both are genuinely needed, document the selection rule in the codebase
   reference and add a startup log line stating which one is in use.

Report findings before removing anything.
```

---

## PHASE 3 — AI cost and abuse controls

No rate limiting appears anywhere in the stack. `conversation_credits` and `tryon_usage` tables exist, which is promising — the question is whether anything reads them before an expensive call.

```
Verify and implement AI cost controls.

VERIFY FIRST:
1. Is there ANY rate limiting middleware registered in artifacts/api-server?
2. Is conversation_credits actually checked before calling Anthropic in
   POST /api/v1/ai-sessions/:sessionId/messages? Show me the code path.
   If credits are written but never read, say so plainly.
3. Same question for tryon_usage — is it enforced, or only recorded?
4. What is AI_INTEGRATIONS_OPENAI_API_KEY used for? It appears in the env
   list but in no architecture documentation. Is that code path live?
5. Is there a max_tokens cap and a timeout on every Anthropic SDK call?

THEN IMPLEMENT:
6. Add rate limiting (express-rate-limit or equivalent):
   - Unauthenticated AI generation: strict per-IP. Suggest 5/hour, 20/day.
   - Authenticated AI endpoints: per-user, more generous.
   - Global per-IP backstop across /api/v1.
7. Enforce conversation_credits server-side before the Anthropic call, with
   distinct Free and Pro allowances and a clear structured error on exhaustion.
8. Log token usage per request — input tokens, output tokens, model, user or
   anonymous session id, endpoint — so cost per user is measurable.
9. Set an explicit max_tokens and timeout on every Claude call.

Note: the Pro tier is marketed as "Unlimited" Concierge. Set the Pro allowance
high enough to be invisible in normal use, but there must be a ceiling. Flag
that the pricing copy needs to change to a stated fair-use number.
```

---

## PHASE 4 — Security

```
Address these security items. Verify each before changing it.

1. INTEGRATION TOKEN ENCRYPTION. INTEGRATION_TOKEN_KEY encrypts supplier
   OAuth tokens (Shopify, WooCommerce) in integration_tokens. Documentation
   indicates AES-256-CBC, which provides confidentiality but not integrity —
   ciphertext is malleable and tampering is undetectable. Confirm the mode in
   use. If CBC, migrate to AES-256-GCM or add encrypt-then-HMAC, and write a
   migration path for existing rows. These tokens grant write access to
   suppliers' storefronts, so this is the highest-value secret in the system.

2. STRIPE WEBHOOKS. Confirm signature verification using the webhook signing
   secret. Confirm handlers are idempotent — duplicate deliveries must not
   double-grant access or double-record payouts. Confirm which events are
   handled and whether checkout.session.completed is among them.

3. UPLOAD VALIDATION. S3 presigned URL flows for closet photos, try-on photos,
   and portfolio items: confirm file type and size are validated server-side
   before the presigned URL is issued, and that bucket objects are not
   publicly listable.

4. AUTH HARDENING across all three tracks (customer session, supplier, admin):
   report on session expiry, password reset, email verification, and whether
   admin sessions have a shorter timeout than customer sessions.

5. WEBSOCKET AUTH. The ws server handles real-time chat and try-on state.
   Confirm connections are authenticated and scoped — a user must not be able
   to subscribe to another user's session.
```

---

## PHASE 5 — Accessibility

```
Fix brand token contrast. Two combinations fail WCAG AA for text.

- The mid-gray used for secondary text (#8A8A8A) on --bg-base #FAF6F2 is
  roughly 3.2:1. Body text requires 4.5:1. Darken to approximately #6B6B6B
  or lower.
- --primary #CC1519 on --bg-dark #111111 is roughly 3.3:1. This is used for
  the small-caps section labels throughout the decks and site. Either lighten
  the red specifically for dark backgrounds (add a --primary-on-dark token),
  or restrict crimson-on-black to large text and non-text UI only.

Both pass the 3:1 threshold for large text and UI components, so headings and
buttons are fine. The failure is body and secondary text.

After updating tokens, audit every page and all three slide artifacts for
regressions, and add the contrast requirement to the brand token documentation
so future tokens are validated.
```

---

## PHASE 6 — Documentation accuracy

The internal team deck materially misdescribes the codebase. Anyone onboarding from it will be misled.

```
Correct artifacts/seamxy-team-deck to match the actual codebase.

STACK SLIDE — currently wrong or incomplete:
- Describes a single app. It is a pnpm monorepo with six artifacts and
  TypeScript project references.
- Says "PostgreSQL via Supabase". Primary is Neon via
  @neondatabase/serverless.
- Says Express.js with a ~4,700 line routes.ts. It is Express 5 with 229
  route handlers.
- Omits entirely: the OpenAPI spec as source of truth, Orval codegen,
  WebSocket (ws), Pino logging, Zod validation.

NAV / PAGE MAP SLIDE:
- Lists /system, which does not exist in App.tsx.
- Omits real routes: /how-it-works and its three sub-pages, /custom-request,
  /my-requests, /maker-dashboard, /stylists/:handle, /creators,
  /creator/:handle, /for-creators, /shop, /makers, /gig.
- Guest access is much wider than the deck shows. /shop, /makers, /creators,
  /gig, /stylists/:handle and /inspo are all public.

SCHEMA SLIDE:
- Lists 8 tables. There are 90+. Either expand to the real groupings or
  reframe the slide as "core user domain" and say so.
- Describes ai_sessions + ai_messages as separate tables. The actual design
  is ai_chat_sessions with history stored as JSONB.

API SLIDE:
- Ends with "/api/v1/groups /api/v1/gig" and no endpoints. Expand, and add the
  missing domains: products, makers, custom-requests, stylists, supplier,
  admin, subscription-plans.

TRY-ON SLIDE:
- Share route is written /tryon/shared/:code. The codebase uses
  /try-on/shared/:shareCode. Correct the deck.

PERSONA SLIDE:
- Header says 9, list shows 8. Personas are DB-driven in ai_personas, so
  query the table and either list all of them or state the count dynamically
  rather than hard-coding a number that drifts.

FREE/PRO TABLE:
- "Closet (limited items)" is checked for both tiers while "Full Closet" is
  Pro-only. Pro should not show the limited row.

Also update the codebase reference doc itself where it is stale.
```

---

## PHASE 7 — Infrastructure gaps

Absences rather than errors. Sequence by what launch actually requires.

```
Confirm whether each of these exists. Implement what is missing.

1. Automated tests. At minimum: auth across all three tracks, Stripe webhook
   handling, and the AI generation endpoints.
2. CI running typecheck, build, and tests on push.
3. Error tracking and alerting (Sentry or equivalent). Pino gives structured
   logs but nothing is surfacing exceptions.
4. Database backup and restore procedure. Confirm what Neon provides on the
   current plan and whether the retention window is adequate.
5. Transactional email provider. The leads table and email capture flows
   imply one but none is configured.
6. Image pipeline: resize, convert to WebP/AVIF, serve via CDN. Currently S3
   presigned URLs with no processing. This is likely the main cause of the
   page-load issue tracked in the task queue, and it gets more expensive to
   retrofit as closet photo volume grows.
7. ai_chat_sessions stores full conversation history as JSONB in a single
   column. Row size grows unbounded, every message rewrite is a full-blob
   write, and cross-message querying is impossible. Assess whether to
   normalise into a messages table before volume makes migration painful.
8. Table naming is inconsistent: tryon_sessions, tryon_shares, tryon_results
   alongside try_on_models, try_on_closet, try_on_feedback. Standardise on one
   convention. Low urgency, but it causes real bugs when names are guessed.
```

---

## Not for Replit — handle separately

**Biometric data compliance.** The schema holds `user_try_on_photos`, `tryon_sessions` with pose landmark data, `tryon_results`, and body measurements. Across 90+ tables there is no consent record, retention policy, or deletion mechanism.

Illinois' BIPA carries a private right of action with statutory damages and applies based on where your users are, not where you are. Texas and Washington have analogous statutes. Whether MediaPipe pose landmarks constitute a biometric identifier is a genuine open question that depends on how the data is stored and what it can be used for — it is not something to resolve with an agent, and it is worth a few paid hours with a privacy attorney before try-on is publicly exposed. The exposure scales per user, which is why it is worth the spend now.

If consent turns out to be required, the engineering work is: explicit opt-in before photo upload, a stated retention period with automatic expiry, a user-initiated delete that purges both S3 objects and landmark rows, and a published policy.

---

## Working notes

**Orval codegen.** After any change to the OpenAPI spec, run `pnpm --filter @workspace/api-spec run codegen` before touching the frontend. Generated hooks and Zod types go stale silently otherwise. Include this in any prompt that touches the API contract.

**Port handling.** All Vite dev servers read `process.env.PORT`. Hard-coding a port breaks the preview proxy.

**Slide artifacts.** Several team-deck slides use `.map()` loops and are not click-to-edit in the slide editor. Phase 6 edits to those slides need to happen in source, not the editor.
