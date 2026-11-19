<div align="center">

# create-nextjs-stack

[![npm version](https://img.shields.io/npm/v/create-nextjs-stack.svg?style=flat-square)](https://www.npmjs.com/package/create-nextjs-stack)
[![npm downloads](https://img.shields.io/npm/dm/create-nextjs-stack.svg?style=flat-square)](https://www.npmjs.com/package/create-nextjs-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen?style=flat-square)](https://nodejs.org/)

**A zero-config CLI for production-ready Next.js applications.**

Scaffold a web app, an admin panel, or both — backed by Supabase or Contentful.

[Quick Start](#-quick-start) · [Templates](#-templates) · [Project Structure](#-project-structure) · [Environment Variables](#-environment-variables) · [Deployment](#-deployment) · [Contributing](#-contributing)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [CLI Reference](#-cli-reference)
- [Templates](#-templates)
  - [Web — Landing Page](#-web--landing-page)
  - [Admin — CMS Panel](#-admin--cms-panel)
  - [Full Stack](#-full-stack)
- [Project Structure](#-project-structure)
  - [Web Template Structure](#web-template)
  - [Admin Template Structure](#admin-template)
- [Environment Variables](#-environment-variables)
  - [Supabase Web Template](#supabase-web-template-env)
  - [Supabase Admin Template](#supabase-admin-template-env)
  - [Contentful Projects](#contentful-projects)
- [Development](#-development)
- [Deployment](#-deployment)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [Changelog](#-changelog)
- [License](#-license)

---

## 🔍 Overview

**`create-nextjs-stack`** handles the tedious setup so that you can start building immediately. In a single command it:

- Scaffolds a fully configured Next.js 16 application
- Lets you choose Supabase or Contentful, the admin sign-in method and the admin language
- Copies `.env.example` to `.env` so credentials are ready to fill
- Sets the project name inside `package.json` automatically
- Prints exact next steps so you never have to guess

The result follows real-world practices — App Router, TypeScript, Tailwind CSS 4,
a model-driven admin with drafts, preview, media and leads, role-based sign-in,
SEO metadata, and more — without manual wiring.

---

## ⚡ Quick Start

```bash
# Using npx (no install required)
npx create-nextjs-stack@latest my-app

# Using npm
npm create nextjs-stack@latest my-app

# Global install (optional)
npm install -g create-nextjs-stack
create-nextjs-stack my-app
```

The interactive CLI will guide you:

```
? What is your project named? › my-app
? Which template would you like to generate?
  ❯ Full Stack (Web + Admin)
    Web Only (Next.js Landing)
    Admin Only (Admin Panel)
? Where should your content live?
  ❯ Supabase (Postgres)
    Contentful (Headless CMS)
? How should editors sign in to the admin panel?
  ❯ Credentials (single admin)
    Auth0 (roles + invitations)
    Supabase Auth
? Which language should the admin interface use?
  ❯ English
    Türkçe
```

After scaffolding:

```bash
cd my-app
npm install       # install dependencies

# Open .env and fill in your credentials, then:
npm run dev       # start development server at http://localhost:3000
```

---

## 🖥 CLI Reference

```
create-nextjs-stack [project-directory] [options]

Options:
  -t, --template <type>   web | admin | full-stack
  -c, --cms <type>        supabase | contentful               (default: supabase)
  -a, --auth <type>       credentials | auth0 | supabase      (admin sign-in, default: credentials)
  -l, --lang <code>       en | tr                             (admin interface language, default: en)
  -v, --version           Output the current version
  -h, --help              Display help
```

`--auth` and `--lang` only affect the admin panel. `--auth supabase` requires `--cms supabase`.

### Examples

```bash
# Interactive — prompts for name, template, data source, sign-in and language
npx create-nextjs-stack@latest

# Fully non-interactive
npx create-nextjs-stack@latest my-app --template full-stack --cms supabase --auth credentials --lang en

# Contentful + Auth0 roles, Turkish admin interface
npx create-nextjs-stack@latest my-app -t full-stack -c contentful -a auth0 -l tr
```

### Data Sources (`--cms`)

| | Supabase | Contentful |
|---|---|---|
| Content | `posts`, `pages` tables (`admin/supabase/schema.sql`) | `posts`, `pages` content types (`admin/contentful/migrations`) |
| Drafts | `status` column (`draft` / `published`) | Contentful publish state, incl. "changes pending" |
| Images | Uploaded to Cloudinary from the form | Contentful media library (`/assets`): upload, crop, in-use protection |
| Site cache | Admin calls the site's `/api/revalidate` after publishing | Contentful webhook → `/api/revalidate/contentful` |
| Leads | `leads` table | unpublished `lead` entries |

### Admin Sign-in (`--auth`)

| | What you get |
|---|---|
| `credentials` | Auth.js, one administrator from `.env` (`ADMIN_EMAIL` + bcrypt `ADMIN_PASSWORD_HASH`). Simplest setup. |
| `auth0` | Editor / publisher / administrator roles, per-site access, email invitations (Resend), user management and optional MFA. See `admin/AUTH0.md`. |
| `supabase` | Supabase Auth email + password; only addresses in `ADMIN_EMAILS` can open the panel. Supabase data source only. |

### Overwrite Behaviour

If the target directory exists and is not empty, the CLI asks before emptying it. Nothing is deleted without confirmation.

---

## 📦 Templates

### 🌐 Web — Website

Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript.

- Home page with the latest posts, `/blog`, `/blog/[slug]`, `/[slug]` for stand-alone pages, `/contact`
- One content service (`src/lib/content/service.ts`) — Supabase or Contentful behind the same functions
- Contact form → lead stored in the data source **and** email via Resend (either is enough)
- Draft preview through a short-lived HMAC token signed by the admin (`/api/preview`)
- Tag-based caching, `/api/revalidate`, sitemap and robots

### 🛠 Admin — Content Panel

Next.js 16, React 19, shadcn/ui (Radix), Tailwind CSS 4, Zod, Vitest.

- **Model-driven forms** — content types and fields are declared once in `src/lib/models/site.ts`; forms, validation, lists and storage mapping are generated from it. Field kinds: text, textarea, markdown, slug (live availability check), url, link, number, date, select, boolean, image, reference, list; per-language fields via `localized: true`.
- **Drafts and publishing** — saving creates a draft; publish / unpublish / delete from the list or the edit page; optimistic locking against concurrent edits.
- **Preview** — opens the draft on the website in draft mode.
- **Leads** — contact form enquiries with status, internal notes and a GDPR retention period (nightly Vercel cron).
- **Shell** — sidebar with one entry per content type, breadcrumbs, `Ctrl K` command menu, light / dark theme.
- **Server actions only** — every action re-checks authorization, validates with Zod, is rate-limited and audit-logged.
- **Interface language** — all text lives in `src/lib/i18n/{en,tr}.ts`.

### 🏗 Full Stack

Creates `web/` (port 3000) and `admin/` (port 3001) side by side. Deploy them as two projects (e.g. two Vercel projects with Root Directory `web` and `admin`).

---

## 📁 Project Structure

### Admin

```
admin/
├── src/
│   ├── app/
│   │   ├── (auth)/login/          sign-in (credentials, Supabase Auth)
│   │   ├── (panel)/               dashboard, content, leads (+ assets, users, account per module)
│   │   ├── api/cron/              lead retention
│   │   ├── actions.ts             content + lead server actions
│   │   └── media-actions.ts       image upload / media library
│   ├── components/                ContentForm, ActionForm, shell/, content/, leads/, ui/ (shadcn)
│   ├── lib/
│   │   ├── models/site.ts         ← your content model
│   │   ├── content-store.ts       data-source adapter (Supabase or Contentful)
│   │   ├── content-validation.ts  Zod schemas generated from the model
│   │   ├── authorization.ts       requirePrincipal / can (per sign-in method)
│   │   └── i18n/                  en.ts, tr.ts
│   └── proxy.ts                   route protection (Next 16 proxy)
├── supabase/ or contentful/       schema / migrations, seed
└── scripts/                       verify-config (npm run config:check), hash-password
```

### Web

```
web/src/
├── app/                page.tsx, blog/, [slug]/, contact/, api/{contact,preview,revalidate}
├── components/         SiteHeader, SiteFooter, PostCard, Markdown, ContactForm
└── lib/
    ├── content/        service.ts (data source), types.ts
    ├── leads.ts        stores contact enquiries
    └── preview-token.ts
```

### Adding a content type

1. Add a table (`admin/supabase/schema.sql`, same columns pattern) or a migration (`admin/contentful/migrations/03-….cjs`, then `npm run contentful:setup`).
2. Add the type to `admin/src/lib/models/site.ts` — it appears in the sidebar with list, form and validation.
3. Read it on the website in `web/src/lib/content/service.ts`.

---

## 🔑 Environment Variables

Every generated app ships a commented `.env.example` (copied to `.env`). `npm run config:check` in the admin lists anything missing for production.

| App | Supabase | Contentful |
|---|---|---|
| Web | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `CONTENTFUL_SPACE_ID`, `CONTENTFUL_DELIVERY_TOKEN`, `CONTENTFUL_PREVIEW_TOKEN`, `CONTENTFUL_WEBHOOK_SECRET`, `CONTENTFUL_LEAD_MANAGEMENT_TOKEN` |
| Admin | same Supabase keys + `CLOUDINARY_*` | `CONTENTFUL_SPACE_ID`, `CONTENTFUL_MANAGEMENT_TOKEN` |
| Both | `PREVIEW_SECRET` (same value), `REVALIDATION_SECRET` (Supabase), `RESEND_*` / `CONTACT_EMAIL` (web), `CRON_SECRET` (admin) | |

Sign-in: `AUTH_SECRET`, `AUTH_TRUST_HOST`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (credentials) · `AUTH0_*`, `APP_BASE_URL`, `RESEND_*` (auth0) · `ADMIN_EMAILS` (supabase).

> **Outside Vercel** (`next start`, Docker, Railway, Netlify) keep `AUTH_TRUST_HOST=true` or set `AUTH_URL` — otherwise Auth.js rejects every sign-in with `UntrustedHost`.

---

## 🛠 Development

### Prerequisites

| Tool    | Minimum Version |
| ------- | --------------- |
| Node.js | 20.x            |
| npm     | 9.x             |

### Available Scripts

Both templates share the same script interface:

```bash
npm run dev      # Start dev server (Web uses Turbopack: next dev --turbopack)
npm run build    # Compile for production
npm run start    # Serve the production build
npm run lint     # Run ESLint across the project
```

### Third-party Account Setup

| Service                                          | Free Tier | Setup Steps                                                             |
| ------------------------------------------------ | --------- | ----------------------------------------------------------------------- |
| [Supabase](https://supabase.com)                 | ✅ Yes    | Create project → copy URL and anon key from **Project Settings → API**  |
| [Contentful](https://www.contentful.com/)         | ✅ Yes    | Create a space → add API and management tokens → run the setup script  |
| [Cloudinary](https://cloudinary.com)             | ✅ Yes    | Create account → copy cloud name and API credentials from **Dashboard** |
| [Resend](https://resend.com)                     | ✅ Yes    | Create account → add domain (or use sandbox) → create API key           |
| [Google Analytics](https://analytics.google.com) | ✅ Yes    | Create property → copy Measurement ID (`G-XXXXXXXXXX`)                  |

---

## 🚢 Deployment

### Vercel (Recommended)

The Web template is optimised for Vercel — App Router, Edge Middleware,
Supabase SSR, and Contentful preview/revalidation routes work with standard
environment-variable configuration.

1. Push your project to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Add all environment variables from your `.env` file via the **Environment Variables** panel.
4. Click **Deploy**.

> **Full Stack:** Deploy `web/` and `admin/` as **separate Vercel projects** pointing to different subdirectories. In each project's settings, set the **Root Directory** to `web` or `admin` respectively.

### Netlify

```bash
# Build command
npm run build

# Publish directory
.next
```

Add a `netlify.toml` at the project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Railway / Render / Other Node hosts

These platforms detect Next.js automatically. Ensure your environment variables are configured in the platform's dashboard, then connect your repository and deploy.

> **Contentful admin outside Vercel:** keep `AUTH_TRUST_HOST=true` (or set `AUTH_URL` to the panel's public URL). Without it Auth.js rejects every sign-in with `UntrustedHost`. This also applies to Netlify and Docker.

### Docker (Self-hosted)

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> Enable `output: 'standalone'` in `next.config.ts` when using Docker.

---

## ❓ FAQ

**Q: Can I use JavaScript instead of TypeScript?**  
A: Not yet — TypeScript only for now. A `--javascript` flag is planned for a future release. See [ROADMAP.md](./ROADMAP.md).

**Q: Can I use a different CSS framework?**  
A: The templates are designed around Tailwind CSS 4. Swapping it out is possible but requires manual work. Additional styling options are on the roadmap.

**Q: Can I switch between Supabase and Contentful later?**

A: Pages and components only talk to `content-store.ts` (admin) and `lib/content/service.ts` (web), so the
switch is contained in those adapters, but the CLI applies the selected data-source files during scaffolding.
Create a fresh project with the other `--cms` value and migrate custom code when
you need to switch an existing application.

**Q: The CLI overwrote my directory, can I undo it?**  
A: The CLI asks for confirmation before overwriting. If you confirmed by mistake, restore from git or a backup — the CLI does not keep a copy.

**Q: How do I update to a newer template version?**  
A: Re-run the scaffold into a new directory and manually migrate your custom code. There is no in-place upgrade mechanism currently.

**Q: How do I add another admin language?**  
A: Copy `admin/src/lib/i18n/en.ts` to a new file, translate the values (the type keeps the keys in sync) and export it from `src/lib/i18n/index.ts`.

**Q: Can I deploy the Full Stack template as a monorepo on Vercel?**  
A: Yes — create two separate Vercel projects pointing to the same repository, and set their **Root Directory** to `web` and `admin` respectively.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

1. [Open an issue](https://github.com/mburakaltiparmak/create-nextjs-stack/issues) to discuss what you'd like to change.
2. Fork the repository and create a feature branch:

   ```bash
   git clone https://github.com/mburakaltiparmak/create-nextjs-stack.git
   cd create-nextjs-stack
   npm install
   ```

3. Make your changes, run the tests:

   ```bash
   npm test
   ```

4. Submit a pull request with a clear description of the change.

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages (`feat:`, `fix:`, `docs:`, `chore:`).

---

## 📋 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a full history of changes.

---

## 📝 License

[MIT](./LICENSE) © [Mehmet Burak Altıparmak](https://github.com/mburakaltiparmak)
