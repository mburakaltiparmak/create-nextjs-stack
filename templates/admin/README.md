# Supabase Admin Panel

A lightweight admin panel built with Next.js and Supabase for managing database content.

## 🚀 Features

- **Authentication**: Secure login with Supabase Auth
- **CRUD Operations**: Create, Read, Update, Delete database records
- **Responsive Design**: Works on desktop and mobile
- **TypeScript**: Full type safety
- **Modern Stack**: Next.js 16 + React 19 + Tailwind CSS 4

## 📋 Prerequisites

- Node.js 18+ and npm installed
- Supabase account (free tier available)

## 🛠 Setup

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the admin panel.

## 📁 Project Structure

```
admin/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/             # Utilities and helpers
├── public/          # Static assets
└── config/          # Configuration files
```

## 🔐 Authentication

The admin panel uses Supabase Auth. Make sure to:

1. Enable Email/Password authentication in your Supabase project
2. Configure the correct redirect URLs in Supabase Dashboard

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

---

**Built with ❤️ using Next.js and Supabase**
