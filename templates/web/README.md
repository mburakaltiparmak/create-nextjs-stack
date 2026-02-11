# Next.js Project Template

A production-ready Next.js template with modern tech stack and best practices for building corporate websites and web applications.

## 🚀 Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router & Turbopack
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Media Management**: [Cloudinary](https://cloudinary.com/)
- **Email**: [Resend](https://resend.com/)
- **Analytics**: Google Analytics (via `@next/third-parties`)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Lucide React, React Icons, Framer Motion
- **TypeScript**: Full type safety

## ✨ Features

- ⚡️ **Turbopack** for ultra-fast dev & build
- 🎨 **Modern UI** with Tailwind CSS 4 and premium animations
- 📱 **Fully Responsive** design
- 🔐 **Supabase Integration** for database and authentication
- 🖼️ **Cloudinary Integration** for media optimization
- 📬 **Email Service** with Resend
- 🔍 **SEO Optimized** (metadata, sitemap, robots.txt, Schema.org)
- 📊 **Google Analytics** integration
- 🗂️ **Service Layer Architecture** for clean code organization
- 🎯 **Redux Store** with TypeScript support
- ✅ **Form Validation** with React Hook Form & Zod
- 🌐 **Multi-language Ready** structure

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm installed
- Supabase account (free tier available)
- Cloudinary account (free tier available)
- Resend account (free tier available)

### Installation

1. **Copy this template to your new project:**

   ```bash
   cp -r /path/to/nextjs-template /path/to/your-new-project
   cd /path/to/your-new-project
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Then fill in your actual values in `.env`

4. **Run development server:**

   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
nextjs-template/
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── layout.tsx     # Root layout with metadata
│   │   ├── page.tsx       # Home page
│   │   ├── robots.ts      # Robots.txt generation
│   │   └── sitemap.ts     # Sitemap generation
│   ├── components/        # Reusable UI components
│   ├── data/             # Static data and types
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and services
│   │   ├── providers/    # Context providers (Redux, etc.)
│   │   ├── seo/          # SEO utilities
│   │   ├── services/     # Service layer (API calls)
│   │   ├── supabase/     # Supabase client & utilities
│   │   └── utils/        # Helper functions
│   └── store/            # Redux store
│       ├── actions/      # Redux actions
│       ├── reducers/     # Redux reducers
│       └── types/        # Redux types
├── .env.example          # Environment variables template
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## 📜 Available Scripts

```bash
# Development with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

---

**Happy coding! 🎉**
