# Authentication with NextAuth with GitHub Provider

## Overview

This documentation covers the implementation of authentication in the YC Directory application using NextAuth with GitHub as the OAuth provider. This setup enables secure user authentication through GitHub credentials while managing user data in Sanity CMS.

## Table of Contents

1. [Architecture](#architecture)
2. [Setup and Configuration](#setup-and-configuration)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Usage Examples](#usage-examples)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

## Architecture

### Components

The authentication system consists of several key components:

```
NextAuth → GitHub OAuth Provider → User Session
    ↓
Sanity CMS → Author Schema → User Data Storage
    ↓
Next.js API Routes → Protected Resources
```

### Key Files

- **`auth.ts`** - Main NextAuth configuration with callbacks
- **`app/api/auth/[...nextauth]/route.ts`** - NextAuth API route handler
- **`sanity/schemaTypes/author.ts`** - Author schema definition
- **`sanity/lib/queries.ts`** - Sanity queries for user data
- **`sanity/lib/write-client.tsx`** - Sanity write client for creating/updating users

## Setup and Configuration

### Prerequisites

Before implementing authentication, ensure you have:

- A Next.js project (v16.0 or higher in this case)
- A Sanity CMS project
- GitHub OAuth application credentials

### Step 1: Install Dependencies

```bash
npm install next-auth@5.0.0-beta.29
```

### Step 2: Create GitHub OAuth Application

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set **Authorization callback URL** to: `http://localhost:3000/api/auth/callback/github` (for development)
4. Copy your **Client ID** and **Client Secret**

### Step 3: Environment Variables

Create a `.env.local` file:

```env
# GitHub OAuth
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# NextAuth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your_generated_secret
```

### Step 4: Sanity Author Schema

Define the author schema in `sanity/schemaTypes/author.ts`:

```typescript
export default {
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    {
      name: "id",
      title: "GitHub ID",
      type: "number",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "username",
      title: "GitHub Username",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "email",
      title: "Email",
      type: "string",
    },
    {
      name: "image",
      title: "Avatar",
      type: "image",
    },
    {
      name: "bio",
      title: "Bio",
      type: "text",
    },
  ],
};
```

### Step 5: NextAuth Configuration

Configure NextAuth in `auth.ts`:

```typescript
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { client } from "./sanity/lib/client";
import { AUTHOR_BY_GITHUB_ID_QUERY } from "./sanity/lib/queries";
import { writeClient } from "./sanity/lib/write-client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    // Handle sign-in callback
    // Handle JWT callback
    // Handle session callback
  },
});
```

## Authentication Flow

### Step-by-Step Flow

1. **User Initiates Login**
   - User clicks "Sign in with GitHub"
   - Browser redirects to `/api/auth/signin`

2. **GitHub Authentication**
   - NextAuth redirects to GitHub OAuth endpoint
   - User logs in with GitHub credentials
   - GitHub redirects back with authorization code

3. **Token Exchange**
   - NextAuth exchanges code for access token
   - GitHub returns user profile data

4. **SignIn Callback**
   - Function is called with user data from GitHub
   - Checks if user exists in Sanity database
   - If not, creates new author document
   - Returns `true` to allow sign-in

5. **JWT Callback**
   - Called after sign-in
   - Fetches user's Sanity document ID
   - Adds user ID to JWT token

6. **Session Callback**
   - Called when session is accessed
   - Attaches user ID from JWT to session
   - Session is now available to components

### Code Flow Diagram

```
GitHub Login
    ↓
Authorization Code
    ↓
Token Exchange
    ↓
signIn Callback → Check if user exists → Create if needed
    ↓
jwt Callback → Fetch Sanity user ID → Add to token
    ↓
session Callback → Attach user ID to session
    ↓
Session Ready for Use
```

## API Endpoints

### Authentication Routes

NextAuth automatically creates the following endpoints at `/api/auth/`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/signin` | GET | Display sign-in page |
| `/api/auth/signin` | POST | Handle sign-in POST |
| `/api/auth/callback/github` | GET | GitHub callback handler |
| `/api/auth/signout` | GET | Display sign-out confirmation |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/csrf` | GET | Get CSRF token |

### Example: Get Current Session

```typescript
import { auth } from "@/auth";

const session = await auth();
console.log(session.user.id); // Sanity user ID
```

## Database Schema

### Author Document Structure in Sanity

```json
{
  "_id": "a1b2c3d4e5f6g7h8",
  "_type": "author",
  "id": 12345678,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "image": {
    "_type": "image",
    "asset": {
      "_ref": "image-xyz123"
    }
  },
  "bio": "Full-stack developer"
}
```

### Key Fields

- **`id`** - GitHub user ID (unique identifier from GitHub)
- **`_id`** - Sanity document ID (auto-generated)
- **`name`** - User's display name
- **`username`** - GitHub username
- **`email`** - User's email address
- **`image`** - Avatar/profile picture
- **`bio`** - User biography

## Usage Examples

### Protect a Server Component

```typescript
// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
    </div>
  );
}
```

### Create Sign-In Button Component

```typescript
// components/SignInButton.tsx
import { signIn } from "@/auth";

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <button type="submit">Sign in with GitHub</button>
    </form>
  );
}
```

### Create Sign-Out Button Component

```typescript
// components/SignOutButton.tsx
import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button type="submit">Sign Out</button>
    </form>
  );
}
```

### Fetch Current User Data

```typescript
// lib/user.ts
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";

export async function getCurrentUser() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await client.fetch(`*[_id == $id][0]`, {
    id: session.user.id,
  });

  return user;
}
```

### Protect API Routes

```typescript
// app/api/user/profile/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: session.user,
  });
}
```

## Security Considerations

### 1. Environment Variables

- **Never commit `.env.local`** to version control
- Use `.env.local` for local development only
- Set environment variables in your hosting platform (Vercel, etc.)

### 2. CSRF Protection

- NextAuth automatically handles CSRF tokens
- Always use server actions for authentication operations
- Never expose sensitive operations to client-side code

### 3. Session Security

- Sessions are encrypted and signed
- Use `AUTH_SECRET` - a strong, random 32+ character string
- Generate with: `openssl rand -base64 32`

### 4. Token Validation

- Validate tokens server-side only
- Never trust client-side claims
- Always fetch fresh session data for sensitive operations

### 5. Database Security

- Use Sanity's authentication for database access
- Use separate read and write clients:
  - **Read Client** - Public, can be cached
  - **Write Client** - Private, server-only
- Implement proper role-based access control in Sanity

### 6. HTTPS in Production

- Always use HTTPS in production
- GitHub OAuth requires HTTPS for production URLs
- Set production callback URL correctly

## Troubleshooting

### Issue: "Invalid OAuth Configuration"

**Solution:**
- Verify GitHub Client ID and Secret are correct
- Check environment variables are properly set
- Restart development server after changing `.env.local`

### Issue: "User exists but not found in session"

**Solution:**
- Check JWT callback is properly fetching user ID
- Verify Sanity query is correct
- Check Sanity write client has proper authentication

### Issue: "Callback URL mismatch"

**Solution:**
- Ensure GitHub OAuth app callback URL matches:
  - Development: `http://localhost:3000/api/auth/callback/github`
  - Production: `https://yourdomain.com/api/auth/callback/github`

### Issue: "Session undefined on client side"

**Solution:**
- Use `await auth()` in server components only
- For client components, fetch session from `/api/auth/session`
- Use `useSession` hook if available in your setup

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Sanity CMS Documentation](https://www.sanity.io/docs)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication-and-authorization)

## Related Files

- [auth.ts](../auth.ts) - Main authentication configuration
- [app/api/auth/[...nextauth]/route.ts](../app/api/auth/[...nextauth]/route.ts) - API handler
- [sanity/lib/queries.ts](../sanity/lib/queries.ts) - Sanity queries
- [sanity/schemaTypes/author.ts](../sanity/schemaTypes/author.ts) - Author schema
