# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/mburakaltiparmak/create-nextjs-stack/releases/tag/v0.1.0
