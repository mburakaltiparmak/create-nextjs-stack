# Contentful Setup — Web

This project reads its content from Contentful through the Content Delivery API.

## 1. Create a space and tokens

1. Create a space at [app.contentful.com](https://app.contentful.com).
2. **Settings → API keys → Add API key** → copy the Space ID, the Content Delivery
   token and the Content Preview token.
3. **Settings → API keys → Content management tokens → Generate personal token** —
   this one is only used by the setup and codegen scripts.
4. Fill in `.env` (already created for you from `.env.example`).

## 2. Create the content model

```bash
npm run contentful:setup
```

This creates four content types — `categories`, `clients`, `products`, `projects` —
mirroring the Supabase schema of this starter, so pages and components work the
same whichever data source you picked.

The script is **not** idempotent. To change the model later, add a new file under
`contentful/migrations/` and run it with `contentful-migration`.

## 3. Optional: generate TypeScript types

```bash
npm run contentful:types   # → src/lib/contentful/generated/
```

Hand-written flat row types live in `src/lib/contentful/types.ts`. The generated
files describe the raw Contentful entry shape (`sys` + locale-keyed `fields`);
the service layer converts one into the other.

## Data layer

```
src/lib/contentful/
  client.ts      delivery + preview clients, query helper, cache wrapper
  constants.ts   content type IDs, cache tags and TTLs
  mappers.ts     Contentful entry → flat row (Supabase-shaped)
  preview.ts     draft mode detection
  types.ts       flat row types
src/lib/services/
  *.service.ts   same public API as the Supabase variant (getAll / getBySlug)
```

Field IDs are deliberately `snake_case` (`featured_image_url`, `category_id`) so
they match the Supabase column names one to one.

Reference fields are flattened the way a Supabase join would be:

```ts
const product = await ProductService.getBySlug("my-product");
product.category_id;      // "6xK..."
product.categories.title; // "Panels"
```

## Caching and revalidation

The Contentful SDK does not go through Next's `fetch` cache, so results are wrapped
in `unstable_cache` and tagged with the content type ID. Cache TTLs live in
`src/lib/contentful/constants.ts`.

Point a Contentful webhook at the app to revalidate on publish:

- **Contentful → Settings → Webhooks → Add Webhook**
- URL: `https://<your-site>/api/revalidate/contentful`
- Triggers: Entry — publish, unpublish, delete
- Headers: `x-contentful-webhook-secret` = your `CONTENTFUL_WEBHOOK_SECRET`
- Payload: leave as Default

The generic `/api/revalidate` route (secret + `{ tag, path }` body) is still there
for manual invalidation.

## Draft mode (preview)

- **Contentful → Settings → Content preview → Add content preview**
- URL: `https://<your-site>/api/preview?secret=<CONTENTFUL_PREVIEW_SECRET>&slug=/products/{entry.fields.slug}`

While draft mode is on, services hit the Preview API and skip the cache entirely.
Turn it off at `/api/preview/disable`.

## Rich text

`products` and `projects` carry a `body` Rich Text field, edited in the Contentful
web app (the admin panel does not expose it). Render it with:

```tsx
import RichText from "@/components/contentful/RichText";

<RichText document={product.body} />
```

## Publishing model

`published` is a real boolean field on the content types, mirroring the Supabase
column — the services filter on `fields.published: true`. An entry must be both
**published in Contentful** and have `published = true` to appear on the site.
