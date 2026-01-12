<div align="center">
  <img src="./public/logo.png" alt="YC Directory Logo" width="200" />
</div>

# YC Directory

A modern startup pitch and discovery platform built with Next.js, TypeScript, and Sanity CMS. Connect with entrepreneurs, submit ideas, vote on pitches, and get noticed in virtual competitions.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Key Components](#key-components)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [API Routes](#api-routes)
- [Deployment](#deployment)

## 🎯 Overview

YC Directory is a comprehensive platform designed for startup entrepreneurs and innovators to showcase their ideas, connect with like-minded individuals, and participate in virtual competitions. The platform provides seamless startup pitch submission, discovery, and community engagement features.

## ✨ Features

- **Startup Pitch Submission**: Submit innovative startup ideas with detailed descriptions, images, and markdown-formatted pitches
- **Advanced Search**: Find startups by title, category, or author with real-time search capabilities
- **User Authentication**: Secure authentication using NextAuth with session management
- **User Profiles**: Personalized user profiles with avatars and bio information
- **Startup Details**: Comprehensive startup pages with full pitch information and author details
- **View Tracking**: Track and display startup view counts
- **Category Organization**: Browse and filter startups by categories
- **Markdown Support**: Rich text editing support for detailed pitch descriptions
- **Responsive Design**: Mobile-first responsive UI with Tailwind CSS
- **Real-time Updates**: Live data updates using Sanity's real-time capabilities
- **Error Handling**: Comprehensive error tracking with Sentry integration
- **TypeScript Support**: Fully typed codebase for better development experience

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with custom animations
- **UI Components**: [Radix UI](https://www.radix-ui.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Markdown Editor**: [EasyMDE](https://easy-markdown-editor.tk)
- **Toast Notifications**: [Sonner](https://sonner.emilkowal.ski)

### Backend & Services

- **CMS**: [Sanity](https://www.sanity.io) - Headless CMS for content management
- **Authentication**: [NextAuth v5](https://authjs.dev)
- **Error Tracking**: [Sentry](https://sentry.io)
- **Font Loading**: Next.js Font Optimization with custom Work Sans font

### Developer Tools

- **Linting**: [ESLint](https://eslint.org)
- **CSS Processing**: [PostCSS](https://postcss.org) with Tailwind CSS
- **Build Tool**: Turbopack for faster builds

## 📁 Project Structure

```
yc_directory/
├── app/                          # Next.js App Router directory
│   ├── (root)/                   # Main application routes
│   │   ├── page.tsx              # Home page with startup list
│   │   ├── layout.tsx            # Root layout
│   │   ├── startup/
│   │   │   ├── [id]/             # Startup detail page
│   │   │   │   ├── page.tsx
│   │   │   │   └── getStartup.ts
│   │   │   └── create/           # Create startup page
│   │   │       └── page.tsx
│   │   └── user/
│   │       └── [id]/             # User profile page
│   │           └── page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth configuration
│   │   │   └── route.ts
│   │   └── sentry-example-api/   # Sentry example endpoint
│   │       └── route.ts
│   ├── studio/                   # Sanity Studio admin interface
│   ├── fonts/                    # Custom fonts
│   ├── globals.css               # Global styles
│   └── layout.tsx                # App layout wrapper
├── components/                   # Reusable React components
│   ├── Navbar.tsx               # Navigation bar
│   ├── SearchForm.tsx           # Search input component
│   ├── StartupCard.tsx          # Startup preview card
│   ├── StartupForm.tsx          # Startup creation form
│   ├── StartupList.tsx          # Startup list display
│   ├── View.tsx                 # View tracking component
│   ├── Ping.tsx                 # Ping animation component
│   └── ui/                      # Radix UI components
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── skeleton.tsx
│       └── textarea.tsx
├── lib/                         # Utility functions
│   ├── actions.ts              # Server actions
│   ├── utils.ts                # Helper utilities
│   └── validation.ts           # Input validation
├── sanity/                     # Sanity CMS configuration
│   ├── schemaTypes/
│   │   ├── startup.ts          # Startup schema definition
│   │   ├── author.ts           # Author/User schema
│   │   ├── playlist.ts         # Playlist schema
│   │   └── index.ts
│   ├── lib/
│   │   ├── client.ts           # Sanity client configuration
│   │   ├── live.ts             # Real-time data fetching
│   │   ├── queries.ts          # GROQ queries
│   │   └── write-client.tsx    # Sanity write client
│   ├── types/
│   │   └── startup.ts          # TypeScript types
│   ├── structure.ts            # Studio structure
│   └── env.ts                  # Sanity environment config
├── public/
│   └── logo.png               # App logo
├── auth.ts                    # NextAuth configuration
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm 11.6+
- Sanity account and project
- NextAuth provider credentials (GitHub, Google, etc.)

### Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd yc_directory
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```
   # Sanity Configuration
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_api_token

   # NextAuth Configuration
   AUTH_GITHUB_ID=your_github_oauth_id
   AUTH_GITHUB_SECRET=your_github_oauth_secret
   AUTH_SECRET=your_generated_secret

   # Sentry Configuration (Optional)
   SENTRY_AUTH_TOKEN=your_sentry_token

   # Other
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Generate Sanity types**
   ```bash
   npm run typegen
   ```

## 🏃 Getting Started

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page will auto-refresh as you edit files, thanks to Next.js fast refresh.

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Linting

```bash
npm run lint
```

## ⚙️ Configuration

### Next.js Configuration

See [next.config.ts](./next.config.ts) for Next.js settings including Sentry integration and image optimization.

### Tailwind CSS

Custom styles and animations are configured in [tailwind.config.ts](./tailwind.config.ts). The project includes:

- Custom colors and gradients
- Animation utilities
- Typography plugin for markdown rendering

### Authentication

NextAuth is configured in [auth.ts](./auth.ts) with:

- OAuth provider integration (GitHub recommended)
- Session management
- User profile storage in Sanity

### Sanity CMS

- **Project Configuration**: [sanity.config.ts](./sanity.config.ts)
- **Studio URL**: `/studio`
- **Schema Types**: Custom types for Startup, Author, and Playlist

## 🧩 Key Components

### StartupForm

Allows users to create and submit new startup pitches with:

- Title and description input
- Category selection
- Image URL upload
- Markdown pitch editor
- Form validation

### SearchForm

Real-time search component enabling users to find startups by:

- Startup title
- Category
- Author name

### StartupCard

Preview card displaying startup information:

- Startup image
- Title and description excerpt
- Author avatar and name
- Category badge
- View count
- Creation date

### Navbar

Navigation component featuring:

- Logo/branding link
- Authentication status
- Create startup link (authenticated users)
- User profile avatar and dropdown
- Logout functionality

### View

Server component that tracks startup views and updates count in real-time.

## 📊 Database Schema

### Startup Document

```typescript
{
  _type: "startup",
  title: string,
  slug: { current: string },
  author: reference (Author),
  views: number,
  description: text,
  category: string,
  image: url,
  pitch: markdown,
  _createdAt: datetime
}
```

### Author Document

```typescript
{
  _type: "author",
  name: string,
  bio: text,
  image: url,
  email: string,
  ...
}
```

### Playlist Document

```typescript
{
  _type: "playlist",
  title: string,
  slug: { current: string },
  startups: array (references to Startup)
}
```

## 🔐 Authentication

The application uses NextAuth v5 for authentication:

1. **Sign In Flow**
   - User clicks "Create" or "Sign In"
   - Redirected to OAuth provider
   - After authorization, user session is created

2. **Session Management**
   - Sessions stored in Sanity as Author documents
   - User info accessible via `auth()` server function
   - Protected server actions validate authentication

3. **User Profile**
   - Profiles stored with OAuth provider data
   - Avatar and name from provider
   - Editable bio and additional info

## 🔌 API Routes

### Authentication

- **`GET /api/auth/[...nextauth]`** - NextAuth handler for OAuth flow

### Examples

- **`GET /api/sentry-example-api`** - Sentry error tracking example

### Server Actions

- **`createPitch()`** - Create a new startup pitch
- **`getPitches()`** - Fetch startups with search
- **`increaseViews()`** - Increment startup view count

## 📤 Deployment

### Deploy on Vercel (Recommended)

1. **Push code to GitHub**

2. **Import project in Vercel**
   - Go to [vercel.com](https://vercel.com/new)
   - Select "Import Git Repository"
   - Choose your repository

3. **Set environment variables**
   - Add all `.env.local` variables in Vercel dashboard
   - Under Project Settings → Environment Variables

4. **Deploy**
   - Vercel automatically builds and deploys on push
   - Preview deployments for pull requests

### Other Deployment Options

- **Self-hosted**: Use `npm run build` and `npm start`
- **Docker**: Create Dockerfile for containerization
- **Railway, Render, etc**: Follow platform-specific guides

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [NextAuth Documentation](https://authjs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

## 📝 License

This project is public and for use by all parties.

## 🤝 Contributing

For contributing guidelines and pull request process, contact the project maintainer.

---

**Last Updated**: January 2026  
**Version**: 0.1.0
=======

## Author

- [@adrianhajdin](https://github.com/adrianhajdin)


