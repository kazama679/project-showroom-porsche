# Frontend scripts

## Active

| Script | Purpose |
|--------|---------|
| `phase-e-imports.mjs` | Bulk import path rewriter used during Phase E (reference only) |
| `extract.ts` | Dev-only: merge legacy `translations.ts` into `src/messages/*.json` |

Run extract: `npx tsx scripts/extract.ts` (not used in CI).

## Legacy (`_legacy/`)

One-off migration tools from earlier phases. **Do not run** unless you know you need them.

| Script | Notes |
|--------|-------|
| `_legacy/fix-imports.js` | i18n navigation import migration |
| `_legacy/refactor-admin-pages.js` | `useLanguage` → `next-intl` |
| `_legacy/translations.ts` | Old flat dictionary for `extract.ts` only |
