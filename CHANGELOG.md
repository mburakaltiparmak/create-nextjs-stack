# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/mburakaltiparmak/create-nextjs-stack/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/mburakaltiparmak/create-nextjs-stack/releases/tag/v0.1.0
