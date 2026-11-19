# Contentful (website)

- Reads published content with the **Delivery API** (`CONTENTFUL_DELIVERY_TOKEN`); in draft mode (admin "Preview")
  it switches to the **Preview API** (`CONTENTFUL_PREVIEW_TOKEN`) and skips the cache.
- Results are cached per content type (`posts`, `pages`) for 5 minutes. With the webhook below, publishing
  refreshes them immediately:
  Contentful → Settings → Webhooks → `https://<site>/api/revalidate/contentful`,
  header `x-contentful-webhook-secret` = `CONTENTFUL_WEBHOOK_SECRET`, triggers Entry publish / unpublish / delete.
- The contact form stores each enquiry as an unpublished `lead` entry (`CONTENTFUL_LEAD_MANAGEMENT_TOKEN`, ideally a
  role that may only create `lead` entries).
- The content model is managed from the admin (`npm run contentful:setup`). `npm run contentful:types` generates
  TypeScript types for the raw entries if you need them.
