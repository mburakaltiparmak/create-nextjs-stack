# Contentful Setup — Admin

This admin panel writes to Contentful through the Content Management API (CMA)
and authenticates with Auth.js credentials.

## 1. Create a space and a management token

1. Create a space at [app.contentful.com](https://app.contentful.com).
2. **Settings → API keys → Content management tokens → Generate personal token**.
3. Fill in `CONTENTFUL_SPACE_ID` and `CONTENTFUL_MANAGEMENT_TOKEN` in `.env`.

## 2. Create the content model

```bash
npm run contentful:setup
```

Creates `categories`, `clients`, `products` and `projects` — the same shape as the
Supabase schema of this starter. If the web app is part of the same project, run
this **once** from either side; both share the space.

## 3. Set up the admin login

```bash
npx auth secret                      # → AUTH_SECRET
npm run auth:hash -- "your-password" # → ADMIN_PASSWORD_HASH
```

Put both in `.env` along with `ADMIN_EMAIL`, then delete the plaintext
`ADMIN_PASSWORD` line (it exists only as a local-dev fallback).

There is no user table in Contentful, so the panel ships with a single
env-configured administrator. To move to multiple users, change the body of
`authorize()` in `auth.ts` — look the user up wherever you like and return the
same user object. Nothing else in the app needs to change.

## Auth layout

```
auth.config.ts   edge-safe config (pages, session, authorized callback)
auth.ts          NextAuth instance + credentials provider (Node runtime)
middleware.ts    route protection, built from auth.config.ts
app/api/auth/[...nextauth]/route.ts
```

The split exists because middleware runs on the Edge runtime while bcrypt needs
Node — this is the pattern Auth.js documents.

## Data layer

`lib/services/base.service.ts` keeps the same public API as the Supabase variant
(`getAll` / `getById` / `create` / `update` / `delete` / `getOptions` / `count`),
so `app/actions/resources.ts`, `useResource` and the form components are unchanged.

It handles two conversions:

| Contentful | Admin panel |
| --- | --- |
| `{ title: { "en-US": "x" } }` | `{ title: "x" }` |
| `{ sys: { type: "Link", id } }` | `"id"` |

Which fields are references is derived from the `relation` key in
`config/resources.ts` — add a relation there and the service layer follows.

Entries are **published automatically** on create and update. `published` is also a
real boolean field (mirroring the Supabase column) that the web app filters on, so
unticking it hides an entry from the site without deleting it.

## What lives in Contentful, not here

`products` and `projects` have a `body` Rich Text field. Rich text editing belongs
in the Contentful web app, so the admin form does not show it; the web app renders
it with `<RichText document={item.body} />`.

## Images

Uploads still go to Cloudinary (`app/actions/upload.ts`) and the resulting URL is
stored in a plain text field — same as the Supabase variant. Contentful Assets are
not used, so `ImageUpload` works unchanged.
