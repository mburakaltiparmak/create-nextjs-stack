<div align="center">

# create-nextjs-stack

[![npm version](https://img.shields.io/npm/v/create-nextjs-stack.svg?style=flat-square)](https://www.npmjs.com/package/create-nextjs-stack)
[![npm downloads](https://img.shields.io/npm/dm/create-nextjs-stack.svg?style=flat-square)](https://www.npmjs.com/package/create-nextjs-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org/)

**A zero-config CLI to scaffold production-ready Next.js applications.**  
Choose between a marketing landing page, a Supabase admin panel, or both — in one command.

[Quick Start](#-quick-start) · [Templates](#-templates) · [Project Structure](#-project-structure) · [Environment Variables](#-environment-variables) · [Deployment](#-deployment) · [Contributing](#-contributing)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [CLI Reference](#-cli-reference)
- [Templates](#-templates)
  - [Web — Landing Page](#-web--landing-page)
  - [Admin — Supabase Panel](#-admin--supabase-admin-panel)
  - [Full Stack](#-full-stack)
- [Project Structure](#-project-structure)
  - [Web Template Structure](#web-template)
  - [Admin Template Structure](#admin-template)
- [Environment Variables](#-environment-variables)
  - [Web Template](#web-template-env)
  - [Admin Template](#admin-template-env)
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
- Copies `.env.example` to `.env` so credentials are ready to fill
- Sets the project name inside `package.json` automatically
- Prints exact next steps so you never have to guess

The result is a codebase that follows real-world best practices — App Router, TypeScript, Tailwind CSS 4, server-side Supabase auth, SEO metadata, and more — without any manual wiring.

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
    Admin Only (Supabase Admin)
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
Usage: create-nextjs-stack [project-directory] [options]

Arguments:
  project-directory     Target directory for the new project (optional, prompted if omitted)

Options:
  -t, --template <type>  Template to scaffold: web | admin | full-stack
  -v, --version          Print CLI version
  -h, --help             Show help
```

### Examples

```bash
# Interactive — prompts for name and template
npx create-nextjs-stack

# Named project, interactive template selection
npx create-nextjs-stack my-app

# Fully non-interactive
npx create-nextjs-stack my-app --template web
npx create-nextjs-stack my-app --template admin
npx create-nextjs-stack my-app --template full-stack
```

### Overwrite Behaviour

If the target directory already exists and is non-empty, the CLI will ask:

```
Directory my-app is not empty. Overwrite? (y/N)
```

If you confirm, the directory is emptied before scaffolding. If you decline, the process aborts safely.

---

## 📦 Templates

### 🌐 Web — Landing Page

A production-ready Next.js marketing website starter.

#### Tech Stack

| Layer            | Technology                                                                                      | Notes                        |
| ---------------- | ----------------------------------------------------------------------------------------------- | ---------------------------- |
| Framework        | [Next.js 16](https://nextjs.org/)                                                               | App Router, Turbopack        |
| Language         | TypeScript 5                                                                                    | Strict mode                  |
| Styling          | [Tailwind CSS 4](https://tailwindcss.com/)                                                      | `@tailwindcss/postcss`       |
| State Management | [Redux Toolkit](https://redux-toolkit.js.org/)                                                  | Typed slices + actions       |
| Database & Auth  | [Supabase](https://supabase.com/)                                                               | PostgreSQL + SSR auth        |
| Media            | [Cloudinary](https://cloudinary.com/) + `next-cloudinary`                                       | Optimized image delivery     |
| Email            | [Resend](https://resend.com/)                                                                   | Transactional emails         |
| Analytics        | [Google Analytics](https://analytics.google.com/)                                               | Via `@next/third-parties`    |
| Forms            | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)                       | Schema validation            |
| Animations       | [Framer Motion](https://www.framer.com/motion/)                                                 | Page & component transitions |
| Icons            | [Lucide React](https://lucide.dev/) + [React Icons](https://react-icons.github.io/react-icons/) |                              |

#### Feature Highlights

- **⚡ Turbopack** for sub-second dev rebuilds and faster production builds
- **🔍 Full SEO Suite** — dynamic `metadata` API, `sitemap.ts`, `robots.ts`, canonical URLs, and Open Graph tags all configurable from environment variables
- **🎯 Service Layer** — all external API calls go through `src/lib/services/`, keeping components clean
- **🗄 Supabase SSR** — server-side Supabase client with cookie-based session handling, compatible with Next.js App Router
- **🖼 Cloudinary Integration** — ready-to-use `CldImage` and `CldUploadWidget` components via `next-cloudinary`
- **📬 Email Service** — Resend integration with typed email helpers in the service layer
- **🔄 Redux Store** — fully typed store with actions, reducers, and providers already wired in
- **📱 Responsive** — mobile-first layout with Tailwind utilities
- **🌐 i18n Ready** — folder structure supports multi-language routing expansion

---

### 🛠 Admin — Supabase Admin Panel

A minimal, extensible admin dashboard for managing your Supabase data.

#### Tech Stack

| Layer           | Technology                                                  | Notes                     |
| --------------- | ----------------------------------------------------------- | ------------------------- |
| Framework       | [Next.js 16](https://nextjs.org/)                           | App Router                |
| Language        | TypeScript 5                                                |                           |
| Styling         | [Tailwind CSS 4](https://tailwindcss.com/)                  | `tailwind-merge` + `clsx` |
| Database & Auth | [Supabase](https://supabase.com/)                           | PostgreSQL + SSR auth     |
| Media           | [Cloudinary](https://cloudinary.com/)                       | Image uploads             |
| Forms           | [React Hook Form](https://react-hook-form.com/)             |                           |
| Notifications   | [React Toastify](https://fkhadra.github.io/react-toastify/) | Toast alerts              |
| Icons           | [Lucide React](https://lucide.dev/)                         |                           |
| Utilities       | `clsx`, `tailwind-merge`                                    | Class merging helpers     |

#### Feature Highlights

- **🔐 Server-side Auth** — Supabase SSR client; sessions stored in HTTP-only cookies
- **🛡 Route Protection** — `middleware.ts` guards all dashboard routes; unauthenticated users are redirected to `/login`
- **📊 Dashboard Layout** — sidebar + header shell with nested route groups `(auth)` and `(dashboard)`
- **⚙ Server Actions** — data mutations use Next.js Server Actions inside `app/actions/`, keeping client bundles small
- **🔔 Toast Notifications** — React Toastify integrated at the root layout for global alerts
- **📷 Cloudinary Uploads** — image upload utilities pre-configured
- **🧱 Component Library** — reusable admin-specific components in `components/admin/`

---

### 🏗 Full Stack

The `full-stack` template scaffolds both the Web and Admin templates into two independent subdirectories under a shared root:

```
my-app/
├── web/        ← Next.js landing page (port 3000)
└── admin/      ← Supabase admin panel (port 3001)
```

Each sub-project is **completely independent** — separate `package.json`, separate `.env`, separate `node_modules` and dev server. There is no shared monorepo config by design; this keeps the scaffold simple and avoids coupling.

> **Tip:** Run each project in a separate terminal with `npm run dev`. If ports conflict, pass `-- --port 3001` to the admin project.

---

## 📁 Project Structure

### Web Template

```
my-app/
├── public/
│   ├── og-image.png            # Default Open Graph image
│   └── favicon.ico
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout — fonts, providers, metadata
│   │   ├── page.tsx            # Homepage
│   │   ├── robots.ts           # Dynamic robots.txt generator
│   │   ├── sitemap.ts          # Dynamic XML sitemap generator
│   │   └── api/                # API route handlers
│   │
│   ├── components/             # Shared UI components
│   │
│   ├── hooks/                  # Custom React hooks
│   │
│   ├── lib/
│   │   ├── providers/
│   │   │   └── ReduxProvider.tsx   # Wraps app with Redux store
│   │   ├── seo/
│   │   │   ├── seo.config.ts       # Centralised SEO defaults
│   │   │   ├── metadata.ts         # Page metadata helpers
│   │   │   └── structured-data.ts  # JSON-LD schema helpers
│   │   ├── services/
│   │   │   ├── email.service.ts    # Resend email helpers
│   │   │   ├── storage.service.ts  # Cloudinary upload helpers
│   │   │   └── supabase.service.ts # Supabase query helpers
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   ├── server.ts           # Server Supabase client (SSR)
│   │   │   └── middleware.ts       # Session refresh helper
│   │   └── utils/                  # Shared utility functions
│   │
│   └── store/                  # Redux Toolkit store
│       ├── index.ts            # Store configuration
│       ├── actions/            # Action creators
│       ├── reducers/           # Slice reducers
│       └── types/              # Store-wide TypeScript types
│
├── .env.example                # All required env vars with descriptions
├── components.json             # shadcn/ui config (if used)
├── next.config.ts
├── postcss.config.mjs          # Tailwind CSS 4 PostCSS config
└── tsconfig.json
```

### Admin Template

```
my-admin/
├── public/
│
├── app/                        # Next.js App Router (no src/ wrapper)
│   ├── layout.tsx              # Root layout — Toastify provider
│   ├── page.tsx                # Redirects to /dashboard
│   ├── globals.css             # Tailwind CSS 4 imports + theme tokens
│   │
│   ├── (auth)/                 # Unauthenticated routes
│   │   └── login/
│   │       └── page.tsx        # Login page
│   │
│   ├── (dashboard)/            # Protected routes (guarded by middleware)
│   │   ├── layout.tsx          # Dashboard shell (sidebar + header)
│   │   ├── dashboard/          # Main dashboard page
│   │   ├── users/              # User management
│   │   ├── content/            # Content management
│   │   └── settings/           # App settings
│   │
│   └── actions/                # Next.js Server Actions
│       ├── auth.actions.ts     # Login / logout / session
│       └── data.actions.ts     # CRUD operations
│
├── components/
│   └── admin/                  # Admin-specific components
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── DataTable.tsx
│       └── ...
│
├── config/
│   └── navigation.ts           # Sidebar navigation config
│
├── hooks/                      # Custom hooks
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client (SSR)
│   └── utils/                  # Shared helpers (cn, formatters…)
│
├── middleware.ts                # Route protection — redirects to /login
├── .env.example
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

---

## 🔑 Environment Variables

The CLI automatically copies `.env.example` → `.env` during scaffolding. Open `.env` and replace the placeholder values with your real credentials.

### Web Template Env

```bash
# ─── Email (Resend) ────────────────────────────────────────────────────────────
# https://resend.com → API Keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
# The verified sender address configured in your Resend domain
RESEND_FROM_EMAIL=hello@yourdomain.com

# ─── Supabase ──────────────────────────────────────────────────────────────────
# https://supabase.com → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsIn...     # Never expose this client-side!

# Supabase project meta (used by Supabase CLI / migrations)
SUPABASE_PROJECT_ID=xxxxxxxxxxxx
SUPABASE_PROJECT_NAME=my-project
SUPABASE_DATABASE_PASSWORD=your-db-password

# Used to verify on-demand revalidation requests
REVALIDATION_SECRET=a-random-secret-string

# ─── Cloudinary ────────────────────────────────────────────────────────────────
# https://cloudinary.com → Dashboard
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=000000000000000
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDINARY_ID=your-cloud-name                   # Same as CLOUD_NAME, for SDK compat
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# ─── Site ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://yourdomain.com     # Used for canonical URLs & OG tags
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX                  # Google Analytics Measurement ID
```

### Admin Template Env

```bash
# ─── Supabase ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsIn...     # Server-side only

# ─── Cloudinary ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=000000000000000
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

> ⚠️ **Security:** Variables prefixed with `NEXT_PUBLIC_` are bundled into the client. Never prefix `SERVICE_ROLE_KEY` or `API_SECRET` with `NEXT_PUBLIC_`.

---

## 🛠 Development

### Prerequisites

| Tool    | Minimum Version |
| ------- | --------------- |
| Node.js | 18.x            |
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
| [Cloudinary](https://cloudinary.com)             | ✅ Yes    | Create account → copy cloud name and API credentials from **Dashboard** |
| [Resend](https://resend.com)                     | ✅ Yes    | Create account → add domain (or use sandbox) → create API key           |
| [Google Analytics](https://analytics.google.com) | ✅ Yes    | Create property → copy Measurement ID (`G-XXXXXXXXXX`)                  |

---

## 🚢 Deployment

### Vercel (Recommended)

The Web template is optimised for Vercel — App Router, Edge Middleware, and Supabase SSR all work without any additional configuration.

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

**Q: The CLI overwrote my directory, can I undo it?**  
A: The CLI asks for confirmation before overwriting. If you confirmed by mistake, restore from git or a backup — the CLI does not keep a copy.

**Q: How do I update to a newer template version?**  
A: Re-run the scaffold into a new directory and manually migrate your custom code. There is no in-place upgrade mechanism currently.

**Q: Why does `npm run dev` use Turbopack in Web but not in Admin?**  
A: The Web template targets higher-complexity landing pages where faster rebuilds matter most. The Admin template uses the standard Next.js dev server for broader compatibility. You can enable Turbopack in Admin by changing the `dev` script to `next dev --turbopack`.

**Q: Can I deploy the Full Stack template as a monorepo on Vercel?**  
A: Yes — create two separate Vercel projects pointing to the same repository, and set their **Root Directory** to `web` and `admin` respectively.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

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
