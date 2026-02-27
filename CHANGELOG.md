# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.7] - 2026-02-27

### Fixed

- **Release process**: Corrected git tagging sequence to ensure the package versions sync with `npm publish`.

## [0.1.6] - 2026-02-27

- Failed release due to tag mismatch.

## [0.1.5] - 2026-02-27

### Fixed

- **Package Structure**: Converted `bin` field from string to explicit object format to prevent npm publish warnings and ensure correct binary registration.
- **CI/CD**: Added `registry-url` to `actions/setup-node` in `publish.yml` for reliable npm authentication. Removed fragile manual `npm config set` auth hack.

## [0.1.4] - 2026-02-27

### Added

- **Admin Template**: Full Redux Toolkit store setup with `redux-logger` (dev only), `redux-thunk` (via RTK default middleware), typed `useAppDispatch`/`useAppSelector` hooks, and `StoreProvider` integrated into the root layout.
- **Web Template**: Added `redux-logger` middleware (dev only) and typed Redux hooks (`store/hooks.ts`) for use throughout the app.

### Fixed

- **Web Template**: Removed legacy `@types/react-redux` and `@types/redux-logger` devDependencies that caused package resolution conflicts.
- **Web Template**: Migrated `combineReducers` import from deprecated `redux` package to `@reduxjs/toolkit`.
- **Admin Template**: Fixed `tsconfig.json` path alias from `@/*: [./*]` to `@/*: [./src/*]` for correct module resolution.

## [0.1.3] - 2026-02-27

### Fixed

- **Template Dependencies**: Fixed ESM module resolution and missing "react-redux" errors in generated projects by switching hardcoded `next` and `eslint-config-next` versions to semantic version ranges (`^`), resolving peer dependency conflicts during initial `npm install`.

## [0.1.2] - 2026-02-27

### Added

- **Web Template**: Introduced environment-variable-backed generic SEO configuration (`seo.config.ts`, `metadata.ts`, `robots.ts`).
- **Web Template**: Added comprehensive configuration placeholders to `.env.example` to ease generic project bootstrapping.

### Changed

- **Web Template**: Refactored layout configurations by replacing hardcoded company/product details with dynamic environment variable placeholders, improving the starter kit's generic multi-project adaptability.
- **Admin**: Migrated the deprecated `images.domains` configuration to `images.remotePatterns` inside the `next.config.ts`.
- **Web Template**: Cleaned up duplicated CSS custom properties (`z-index` classes) in `globals.css` within the inline `@theme` configuration.

### Fixed

- **Tailwind v4 Setup**: Resolved intermittent missing modules / "Can't resolve 'tailwindcss'" build errors across the Next.js templates.
- **Tailwind v4 Setup**: Removed the undocumented and problematic `base: __dirname` workaround from `postcss.config.mjs` in both templates to align with the official standard Tailwind CSS v4 Best Practices.

## [0.1.1] - 2026-02-12

### Fixed

- **Core**: Resolved ESM module execution issues by renaming configuration to `vitest.config.mts`.
- **Web Template**: Implemented Redux Toolkit correctly to address initial state/dependency problems.
- **CI/CD**: Added explicit NPM authentication token configurations for reliable package publishing pipeline.

## [0.1.0] - 2026-02-11

### Added

- Initial release of `create-nextjs-stack` CLI
- Multi-template support: Web, Admin, and Full Stack
- Interactive CLI with template selection
- Non-interactive mode with `--template` flag
- Automatic environment variable setup (`.env.example` → `.env`)
- Smart package.json cleanup (removes CLI dependencies from generated projects)
- Templates:
  - **Web**: Next.js 16 Landing Page with Tailwind CSS 4, Redux Toolkit, Supabase, Cloudinary
  - **Admin**: Supabase Admin Panel with Next.js, authentication, and CRUD operations
  - **Full Stack**: Combined Web + Admin in separate subdirectories

### Features

- Turbopack for ultra-fast development
- Production-ready configurations
- SEO optimized templates
- Form validation with React Hook Form + Zod
- Multi-language ready structure

[unreleased]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.7...HEAD
[0.1.7]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/mburakaltiparmak/create-nextjs-stack/releases/tag/v0.1.0
