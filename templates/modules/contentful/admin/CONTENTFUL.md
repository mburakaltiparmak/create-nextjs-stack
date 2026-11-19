# Contentful (admin)

1. Create a space and a **personal access token** (Account settings → CMA tokens, starts with `CFPAT-`).
   Put `CONTENTFUL_SPACE_ID` and `CONTENTFUL_MANAGEMENT_TOKEN` in `.env`.
2. `npm run contentful:setup` — applies `contentful/migrations/NN-*.cjs` in order. Already applied
   migrations are skipped, so it is safe to re-run after adding a new one.
3. `npm run contentful:seed` — optional sample posts and pages for an empty space.

**Languages are fields, not Contentful locales** (`title`, `title_tr` …), so the space needs a single locale.
If its default locale is not `en-US`, set `CONTENTFUL_LOCALE` in the admin and the website.

**Publishing:** saving updates the entry as a draft; publishing makes it visible to the Delivery API. An entry that
was edited after publishing shows "Changes pending".

**Media:** images live in the Contentful media library (`/assets`): upload, crop / rotate (save as copy or replace),
copy the asset ID, delete when unused.

**Leads:** the website writes unpublished `lead` entries (migration 02). Give the website a token whose role can only
create and edit `lead` entries (`CONTENTFUL_LEAD_MANAGEMENT_TOKEN`).

**Instant updates on the website:** add a webhook in Contentful → Settings → Webhooks:
`https://<site>/api/revalidate/contentful`, header `x-contentful-webhook-secret` = the website's
`CONTENTFUL_WEBHOOK_SECRET`, triggers: Entry publish / unpublish / delete.
