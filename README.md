# Create Next.js Stack

[![npm version](https://img.shields.io/npm/v/create-nextjs-stack.svg)](https://www.npmjs.com/package/create-nextjs-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/create-nextjs-stack.svg)](https://www.npmjs.com/package/create-nextjs-stack)

A powerful CLI tool to scaffold production-ready Next.js applications and Supabase Admin panels.

## 🚀 Features

- **Multi-Template Support**: Choose between Web, Admin, or Full Stack.
- **Production Ready**: Includes Tailwind CSS 4, Redux Toolkit, Supabase, Cloudinary, and Resend.
- **Smart Scaffolding**: Automatically handles environment variables and cleans up dependencies.

## 📦 Usage

You can use this tool directly with `npx`:

```bash
npx create-nextjs-stack my-app
```

### Interactive Mode

The CLI will ask you:

1.  **Project Name**: What to call your new project.
2.  **Template Type**:
    - `Full Stack`: Creates both `web` and `admin` projects.
    - `Web Only`: Creates the Next.js Landing website.
    - `Admin Only`: Creates the Supabase Admin Panel.

### Command Line Arguments

You can also bypass prompts:

```bash
# Create a full stack project
npx create-nextjs-stack my-app --template full-stack

# Create just the web app
npx create-nextjs-stack my-web-app --template web

# Create just the admin panel
npx create-nextjs-stack my-admin --template admin
```

## 🛠 Project Structure

After running the command, your project will look like this (for full-stack):

```
my-app/
├── web/            # Next.js Landing Page (App Router, Tailwind 4, Redux)
└── admin/          # Supabase Admin Panel (React, Vite, Tailwind)
```

## 📝 License

MIT
