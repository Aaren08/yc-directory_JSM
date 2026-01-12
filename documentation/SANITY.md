# Sanity CMS Documentation

## Table of Contents

1. [Overview](#overview)
2. [What is Sanity?](#what-is-sanity)
3. [Project Setup & Configuration](#project-setup--configuration)
4. [Content Schema](#content-schema)
5. [Content Queries](#content-queries)
6. [Sanity Studio](#sanity-studio)
7. [Integration with Next.js](#integration-with-nextjs)
8. [Data Management](#data-management)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This YC Directory project uses **Sanity** as its headless CMS (Content Management System) to manage startup submissions, author profiles, and editorial playlists. Sanity provides a structured content platform that decouples content management from content presentation, allowing the Next.js frontend to fetch data on-demand.

### Key Features Used

- **Structured Content Management**: Define content types with Sanity schemas
- **Real-time API**: Query content via GROQ
- **Studio Interface**: Web-based editor for managing content
- **Type Safety**: Auto-generated TypeScript types from GROQ queries
- **References**: Link between documents (e.g., Startups → Authors)
- **Rich Media**: Support for URLs, markdown, and metadata

---

## What is Sanity?

### Definition

Sanity is a **headless CMS** platform that separates content management from presentation. Unlike traditional CMS platforms (WordPress, Drupal), Sanity provides:

- **Structured Content**: Define precise data shapes with validation
- **Flexible APIs**: Query content via GROQ
- **Developer-Friendly**: TypeScript-first, version control integration
- **Scalable**: Content is stored as JSON documents
- **Real-time Collaboration**: Multiple editors can work simultaneously

### Architecture

```
┌─────────────────┐
│  Sanity Studio  │  (Web UI for content editors)
└────────┬────────┘
         │
    ┌────▼────────────────────┐
    │   Sanity Cloud Hosting  │  (Content storage & API)
    └────┬────────────────────┘
         │
┌────────▼──────────────┐
│  Next.js Frontend     │  (Content consumption)
└───────────────────────┘
```

---

## Project Setup & Configuration

### Environment Variables

Sanity configuration requires these environment variables (in `.env.local` or similar):

```env
# Sanity Project Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-10-18

# Write Operations (Server-side only)
SANITY_WRITE_TOKEN=your_write_token
```

### Configuration Files

#### [sanity/env.ts](sanity/env.ts)

Centralizes environment variable management with validation:

```typescript
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-18";
export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "..."
);
export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "..."
);
export const token = process.env.SANITY_WRITE_TOKEN;
```

**Purpose**:

- Validates required environment variables at startup
- Exports constants for use across the application
- Provides API version management

#### [sanity.config.ts](sanity.config.ts)

Main Sanity configuration for the Studio:

```typescript
export default defineConfig({
  basePath: "/studio", // Studio mounted at /studio route
  projectId,
  dataset,
  schema, // Content schema definitions
  plugins: [
    structureTool({ structure }), // Studio navigation structure
    visionTool(), // GROQ query builder
    markdownSchema(), // Markdown support for pitch field
  ],
});
```

**Features Configured**:

- **Studio Path**: Accessible at `/app/studio/[[...tool]]/page.tsx`
- **Schema**: Defines all content types (Startup, Author, Playlist)
- **Plugins**: Enhance studio functionality

---

## Content Schema

### Schema Overview

The project defines three main content types:

| Type         | Purpose             | Key Fields                                                      |
| ------------ | ------------------- | --------------------------------------------------------------- |
| **Author**   | User profiles       | name, username, email, image, bio, id                           |
| **Startup**  | Submission entries  | title, slug, author, description, category, image, pitch, views |
| **Playlist** | Curated collections | title, slug, select (array of startups)                         |

### Detailed Schema Definitions

#### 1. Author Schema

**File**: [sanity/schemaTypes/author.ts](sanity/schemaTypes/author.ts)

```typescript
export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: "UserIcon",
  fields: [
    defineField({
      name: "id", // GitHub user ID (for authentication linking)
      type: "number",
    }),
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "username",
      type: "string",
    }),
    defineField({
      name: "email",
      type: "string",
    }),
    defineField({
      name: "image", // Profile photo URL
      type: "url",
    }),
    defineField({
      name: "bio", // User biography
      type: "text",
    }),
  ],
  preview: {
    select: {
      title: "name", // Shows name in list view
    },
  },
});
```

**Key Points**:

- **id**: Maps to GitHub user ID for OAuth integration
- **preview**: Configures how documents appear in the studio list
- No validation rules (all fields optional)

---

#### 2. Startup Schema

**File**: [sanity/schemaTypes/startup.ts](sanity/schemaTypes/startup.ts)

```typescript
export const startup = defineType({
  name: "startup",
  title: "Startup",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "slug", // URL-friendly identifier
      type: "slug",
      options: {
        source: "title", // Auto-generated from title
      },
    }),
    defineField({
      name: "author", // Reference to Author document
      type: "reference",
      to: { type: "author" },
    }),
    defineField({
      name: "views", // View counter (for ranking)
      type: "number",
    }),
    defineField({
      name: "description",
      type: "text",
    }),
    defineField({
      name: "category",
      type: "string",
      validation: (Rule) =>
        Rule.min(1).max(20).required().error("Category is required"),
    }),
    defineField({
      name: "image", // Hero image URL
      type: "url",
      validation: (Rule) => Rule.required().error("Image is required"),
    }),
    defineField({
      name: "pitch", // Main content (supports markdown)
      type: "markdown",
    }),
  ],
});
```

**Key Points**:

- **slug**: Auto-generates from title, used in URLs (`/startup/[slug]`)
- **author**: Document reference creates relationship to Author
- **validation**: Enforces required fields and constraints
- **markdown**: Rich text support via `sanity-plugin-markdown`

---

#### 3. Playlist Schema

**File**: [sanity/schemaTypes/playlist.ts](sanity/schemaTypes/playlist.ts)

```typescript
export const playlist = defineType({
  name: "playlist",
  title: "Playlists",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
    }),
    defineField({
      name: "select", // Array of Startup references
      type: "array",
      of: [{ type: "reference", to: [{ type: "startup" }] }],
    }),
  ],
});
```

**Key Points**:

- **select**: Array of references allows curating multiple startups
- Used for editorial collections (e.g., "Startup of the Day")

### Schema Registration

**File**: [sanity/schemaTypes/index.ts](sanity/schemaTypes/index.ts)

```typescript
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [author, startup, playlist],
};
```

All schema types must be exported here and registered in `sanity.config.ts`.

---

## Content Queries

### Query Strategy

The project uses **GROQ** (Graph-Relational Object Queries) to fetch data. Queries are:

- Defined in [sanity/lib/queries.ts](sanity/lib/queries.ts)
- Type-safe via `defineQuery()` helper
- Auto-typed with TypeScript (via Sanity TypeGen)

### Query Execution Flow

```
┌─────────────────────────────┐
│  GROQ Query Strings         │
│  (sanity/lib/queries.ts)    │
└────────────┬────────────────┘
             │
      ┌──────▼───────────────┐
      │  defineQuery()       │  (Type-safety wrapper)
      └──────┬───────────────┘
             │
      ┌──────▼─────────────────────────────┐
      │  client.fetch(QUERY, { params })   │
      │  (sanity/lib/client.ts)            │
      └──────┬─────────────────────────────┘
             │
      ┌──────▼──────────────────────────────────┐
      │  Sanity API (GROQ Execution)            │
      │  Returns JSON matching TypeScript types │
      └──────┬──────────────────────────────────┘
             │
      ┌──────▼────────────────────────────────┐
      │  Typed Result                         │
      │  (sanity.types.ts auto-generated)     │
      └───────────────────────────────────────┘
```

### All Available Queries

#### 1. STARTUPS_QUERY

**Purpose**: Fetch all startups with optional search filtering

```typescript
export const STARTUPS_QUERY = defineQuery(`
  *[_type == "startup" && defined(slug.current) 
    && !defined($search) 
    || title match $search
    || category match $search 
    || author->name match $search ] 
  | order(_createdAt desc) {
    _id, 
    title,
    _createdAt,
    slug, 
    category,
    description,
    image,
    author -> {
      _id, name, image, bio
    },
    views
  }
`);
```

**Parameters**:

- `$search` (optional): Search term to filter by title, category, or author name

**Returns**: `STARTUPS_QUERYResult[]` - Array of startup documents

**Usage Example**:

```typescript
// No search - all startups
const allStartups = await client.fetch(STARTUPS_QUERY);

// With search
const results = await client.fetch(STARTUPS_QUERY, { search: "AI" });
```

**Location Used**: [app/(root)/page.tsx](<app/(root)/page.tsx>) - Homepage startup listing

---

#### 2. STARTUP_BY_ID_QUERY

**Purpose**: Fetch a single startup with full details

```typescript
export const STARTUP_BY_ID_QUERY = defineQuery(`
  *[_type == "startup" && _id == $id][0] {
    _id,
    title,
    _createdAt,
    slug, 
    category,
    description,
    image,
    author -> {
      _id, name, username, image, bio
    },
    views,
    pitch                    // Full markdown content
  }
`);
```

**Parameters**:

- `$id` (required): Sanity document ID

**Returns**: `STARTUP_BY_ID_QUERYResult` - Single startup or null

**Usage Example**:

```typescript
const startup = await client.fetch(STARTUP_BY_ID_QUERY, { id: "xyz123" });
```

**Location Used**: [app/(root)/startup/[id]/getStartup.ts](<app/(root)/startup/[id]/getStartup.ts>) - Individual startup page

---

#### 3. STARTUP_VIEWS_QUERY

**Purpose**: Fetch view count (lightweight for incrementing views)

```typescript
export const STARTUP_VIEWS_QUERY = defineQuery(`
  *[_type == "startup" && _id == $id][0] {
    _id, views
  }
`);
```

**Parameters**:

- `$id` (required): Sanity document ID

**Returns**: `STARTUP_VIEWS_QUERYResult` - ID and views count or null

**Usage Example**:

```typescript
const viewData = await client.fetch(STARTUP_VIEWS_QUERY, { id: "xyz123" });
```

**Location Used**: [components/View.tsx](components/View.tsx) - Incrementing view counts

---

#### 4. AUTHOR_BY_GITHUB_ID_QUERY

**Purpose**: Find author by GitHub ID (for OAuth integration)

```typescript
export const AUTHOR_BY_GITHUB_ID_QUERY = defineQuery(`
  *[_type == "author" && id == $id][0] {
    _id,
    id,
    name,
    username,
    email,
    image,
    bio
  }
`);
```

**Parameters**:

- `$id` (required): GitHub user ID

**Returns**: `AUTHOR_BY_GITHUB_ID_QUERYResult` - Author document or null

**Usage Example**:

```typescript
const author = await client.fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id: 12345 });
```

**Location Used**: [lib/actions.ts](lib/actions.ts) - User authentication/creation

---

#### 5. AUTHOR_BY_ID_QUERY

**Purpose**: Fetch author by Sanity document ID

```typescript
export const AUTHOR_BY_ID_QUERY = defineQuery(`
  *[_type == "author" && _id == $id][0] {
    _id,
    id,
    name,
    username,
    email,
    image,
    bio
  }
`);
```

**Parameters**:

- `$id` (required): Sanity document ID

**Returns**: `AUTHOR_BY_ID_QUERYResult` - Author document or null

**Usage Example**:

```typescript
const author = await client.fetch(AUTHOR_BY_ID_QUERY, { id: "xyz123" });
```

**Location Used**: [app/(root)/user/[id]/page.tsx](<app/(root)/user/[id]/page.tsx>) - User profile page

---

#### 6. STARTUPS_BY_AUTHOR_QUERY

**Purpose**: Fetch all startups by a specific author

```typescript
export const STARTUPS_BY_AUTHOR_QUERY = defineQuery(`
  *[_type == "startup" && author._ref == $id] 
  | order(_createdAt desc) {
    _id, 
    title,
    _createdAt,
    slug, 
    category,
    description,
    image,
    author -> {
      _id, name, image, bio
    },
    views
  }
`);
```

**Parameters**:

- `$id` (required): Author's Sanity document ID

**Returns**: `STARTUPS_BY_AUTHOR_QUERYResult[]` - Array of startup documents

**Usage Example**:

```typescript
const authorStartups = await client.fetch(STARTUPS_BY_AUTHOR_QUERY, {
  id: "xyz123",
});
```

**Location Used**: [components/StartupList.tsx](components/StartupList.tsx) - List startups for specific user

---

#### 7. PLAYLIST_BY_SLUG_QUERY

**Purpose**: Fetch a playlist with all referenced startups

```typescript
export const PLAYLIST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "playlist" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    select[]-> {
      _id,
      title,
      _createdAt,
      slug,
      author -> {
        _id, name, image, bio, slug
      },
      description,
      image,
      category,
      views,
      pitch
    }
  }
`);
```

**Special Syntax**:

- `select[]->`: Array follow operator - "dereference all references in the select array"

**Parameters**:

- `$slug` (required): Playlist slug

**Returns**: `PLAYLIST_BY_SLUG_QUERYResult` - Playlist document or null

**Usage Example**:

```typescript
const playlist = await client.fetch(PLAYLIST_BY_SLUG_QUERY, {
  slug: "startup-of-the-day",
});
```

**Location Used**: [app/(root)/startup/[id]/page.tsx](<app/(root)/startup/[id]/page.tsx>) - Show related startups

---

### GROQ Query Syntax Explained

Key GROQ operators used in queries:

| Operator     | Purpose                              | Example                                           |
| ------------ | ------------------------------------ | ------------------------------------------------- |
| `*[...]`     | Select all documents matching filter | `*[_type == "startup"]`                           |
| `&&`         | Logical AND                          | `_type == "startup" && views > 100`               |
| `\|\|`       | Logical OR                           | `title match $search \|\| category match $search` |
| `\|`         | Pipe operator                        | `*[...] \| order(_createdAt desc)`                |
| `->`         | Dereference reference                | `author->name`                                    |
| `->[]`       | Array follow operator                | `select[]->` (all items in array)                 |
| `[0]`        | Get first item                       | `*[...][0]`                                       |
| `match`      | Text search                          | `title match $search`                             |
| `order()`    | Sort results                         | `\| order(_createdAt desc)`                       |
| `defined()`  | Check field exists                   | `defined(slug.current)`                           |
| `!defined()` | Check field missing                  | `!defined($search)`                               |

---

## Sanity Studio

### What is the Studio?

The **Sanity Studio** is a web-based interface for content editors to:

- Create and edit documents
- Upload images and media
- Preview changes in real-time
- Manage document relationships
- Validate data against schemas

### Accessing the Studio

In development:

```bash
npm run dev
# Navigate to http://localhost:3000/studio
```

### Studio Configuration

**File**: [sanity/structure.ts](sanity/structure.ts)

```typescript
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("author").title("Authors"),
      S.documentTypeListItem("startup").title("Startups"),
    ]);
```

**Configuration Details**:

- Defines navigation structure in the studio sidebar
- Currently shows: Authors and Startups sections
- Playlists are accessible but not prominently featured

### Studio Features in This Project

#### 1. Markdown Editor (for pitch field)

```typescript
// Via sanity-plugin-markdown
defineField({
  name: "pitch",
  type: "markdown",
});
```

Features:

- Rich text editing (bold, italic, lists, code blocks)
- Live preview
- Source editing option

#### 2. Slug Auto-generation

```typescript
defineField({
  name: "slug",
  type: "slug",
  options: {
    source: "title", // Auto-generates from title
  },
});
```

- Clicking "Generate" creates URL-friendly slug from title
- Manual editing allowed
- Used in URLs: `/startup/[slug]`

#### 3. Reference Fields

```typescript
defineField({
  name: "author",
  type: "reference",
  to: { type: "author" },
});
```

- Studio interface for selecting linked documents
- Shows preview of referenced author
- Validates reference exists

---

## Integration with Next.js

### Clients Overview

Two separate Sanity clients handle different operations:

#### 1. Read Client (Public)

**File**: [sanity/lib/client.ts](sanity/lib/client.ts)

```typescript
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Caching enabled for reads
});
```

**Characteristics**:

- No authentication required
- Uses CDN for faster responses
- Safe to use on frontend and backend
- Read-only operations

**Usage**:

```typescript
// In any file (client or server)
import { client } from "@/sanity/lib/client";

const data = await client.fetch(QUERY, { params });
```

---

#### 2. Write Client (Authenticated)

**File**: [sanity/lib/write-client.tsx](sanity/lib/write-client.tsx)

```typescript
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // No caching for writes
  token: SANITY_WRITE_TOKEN, // Requires write token
});

if (!writeClient.config().token) {
  throw new Error("Write token not found.");
}
```

**Characteristics**:

- Requires `SANITY_WRITE_TOKEN` environment variable
- Server-side only (marked with `"use server"`)
- No CDN to ensure latest writes
- Protected by token validation

**Usage**:

```typescript
// In server actions only
import { writeClient } from "@/sanity/lib/write-client";

const result = await writeClient.create({
  _type: "startup",
  title: "My Startup",
  // ... more fields
});
```

---

### Server-Side Data Fetching

#### Page-Level Fetching

**File**: [app/(root)/startup/[id]/page.tsx](<app/(root)/startup/[id]/page.tsx>)

```typescript
// In async Server Component
const startup = await client.fetch(STARTUP_BY_ID_QUERY, { id });

if (!startup) {
  return notFound();  // 404 page
}

// Use data in JSX
<h1>{startup.title}</h1>
```

**Benefits**:

- Data fetched at request time
- Type-safe (TypeScript inference)
- Server-side by default (no JS sent to client)

#### Parallel Fetching

**File**: [app/(root)/startup/[id]/page.tsx](<app/(root)/startup/[id]/page.tsx>)

```typescript
// Start independent fetches in parallel
const startupPromise = getStartup(id);
const playlistPromise = client.fetch(PLAYLIST_BY_SLUG_QUERY, {
  slug: "startup-of-the-day",
});

const post = use(startupPromise);
const playlistResult = use(playlistPromise);
```

**Benefits**:

- Faster loading (parallel execution)
- Uses React's `use()` hook for promise integration
- Fallback UI can show while loading

---

### Suspense & Streaming

**File**: [app/(root)/user/[id]/page.tsx](<app/(root)/user/[id]/page.tsx>)

```typescript
<Suspense fallback={<StartupCardSkeleton />}>
  <StartupList id={id} />
</Suspense>
```

**Pattern**:

1. Component with async data fetching wrapped in `<Suspense>`
2. Fallback UI shows while data loads
3. Component renders when data arrives

**Streaming Benefit**: Users see fallback immediately, then content streams in.

---

### Creating Content (Write Operations)

**File**: [lib/actions.ts](lib/actions.ts)

```typescript
"use server"; // Server Action

export const createPitch = async (
  state: any,
  form: FormData,
  pitch: string
) => {
  const session = await auth();

  if (!session) {
    return parseServerActionResponse({
      error: "Unauthorized",
      status: "ERROR",
    });
  }

  // Extract form data
  const { title, description, category, link } = Object.fromEntries(
    Array.from(form).filter(([key]) => key !== "pitch")
  );
  const slug = slugify(title as string, { lower: true, strict: true });

  try {
    const startup = {
      title,
      description,
      category,
      image: link,
      slug: {
        _type: "slug",
        current: slug,
      },
      author: {
        _type: "reference",
        _ref: session?.user?.id,
      },
      pitch,
    };

    // Write to Sanity
    const result = await writeClient.create({
      _type: "startup",
      ...startup,
    });

    return parseServerActionResponse({
      ...result,
      status: "SUCCESS",
    });
  } catch (error) {
    // Handle error
    return parseServerActionResponse({
      error: error?.message,
      status: "ERROR",
    });
  }
};
```

**Key Patterns**:

- `"use server"`: Ensures code runs only on server
- Authentication check: Verify user is logged in
- Data transformation: Convert FormData to Sanity document format
- Error handling: Try-catch with proper error responses
- Reference creation: `{ _type: "reference", _ref: userId }`

---

## Data Management

### Document Structure

All Sanity documents include system fields:

```typescript
{
  _id: "unique-document-id",        // Unique identifier
  _type: "startup",                 // Document type
  _createdAt: "2024-01-15T10:30Z", // Timestamp
  _updatedAt: "2024-01-15T14:45Z", // Last update
  _rev: "abc123xyz",                // Revision/version

  // Custom fields
  title: "My Startup",
  slug: { current: "my-startup", _type: "slug" },
  // ...
}
```

### References Between Documents

**Example**: Startup references Author

```typescript
// In Startup document
{
  _type: "startup",
  author: {
    _type: "reference",
    _ref: "author-doc-id"
  }
}

// In Query - Dereference with ->
author-> {
  _id,
  name,
  image,
  bio
}

// Result - Full author object
{
  author: {
    _id: "author-doc-id",
    name: "John Doe",
    image: "https://...",
    bio: "..."
  }
}
```

### View Counting Pattern

**File**: [components/View.tsx](components/View.tsx)

```typescript
// Get current views
const viewData = await client.fetch(STARTUP_VIEWS_QUERY, { id });

// Increment views in Sanity
await writeClient.patch(id).inc({ views: 1 }).commit();
```

**Pattern**:

1. Fetch current view count (read-only, can be cached)
2. Use `patch()` to increment counter on server-side
3. `.inc()` atomic increment operation
4. `.commit()` applies changes

---

## Best Practices

### 1. Query Organization

✅ **DO**: Keep queries in dedicated file

```typescript
// sanity/lib/queries.ts
export const STARTUP_BY_ID_QUERY = defineQuery(`...`);
```

❌ **DON'T**: Inline queries in components

```typescript
// Bad - in component
const data = await client.fetch(`*[_type == "startup"]...`);
```

---

### 2. Type Safety

✅ **DO**: Use `defineQuery()` wrapper for auto-typing

```typescript
const QUERY = defineQuery(`*[_type == "startup"][0] {...}`);
const result = await client.fetch(QUERY); // Typed!
```

❌ **DON'T**: Use raw strings without types

```typescript
const result = await client.fetch(`*[...]`); // Any type
```

---

### 3. Authentication for Writes

✅ **DO**: Always check auth before write operations

```typescript
"use server";

const session = await auth();
if (!session?.user?.id) {
  return { error: "Unauthorized" };
}

await writeClient.create({...});
```

❌ **DON'T**: Allow unauthenticated writes

```typescript
// Dangerous - no auth check
await writeClient.create({...});
```

---

### 4. Slug Generation

✅ **DO**: Use consistent slug generation

```typescript
const slug = slugify(title, { lower: true, strict: true });
```

✅ **DO**: Store in proper format

```typescript
slug: {
  _type: "slug",
  current: slug,
}
```

---

### 5. Performance

✅ **DO**: Use read client for queries (has CDN)

```typescript
export const client = createClient({
  // ...
  useCdn: true, // Enables caching
});
```

✅ **DO**: Fetch only needed fields in GROQ

```typescript
// Good - minimal fields
*[_type == "startup"][0] {
  _id,
  title,
  slug
}

// Bad - unnecessary fields
*[_type == "startup"][0] {
  *[include all available fields]
}
```

---

### 6. Error Handling

✅ **DO**: Validate schema requirements in code

```typescript
const title = form.get("title");
if (!title) {
  return { error: "Title is required" };
}
```

✅ **DO**: Implement proper error responses

```typescript
try {
  const result = await writeClient.create({...});
  return { success: true, result };
} catch (error) {
  return { error: error.message };
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Missing environment variable" error

**Problem**:

```
Error: Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID
```

**Solution**:

- Check `.env.local` file exists
- Verify all three required variables are set:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `NEXT_PUBLIC_SANITY_API_VERSION`
- Restart development server after adding vars

---

#### 2. "Write token not found" error

**Problem**:

```
Error: Write token not found.
```

**Solution**:

- Ensure `SANITY_WRITE_TOKEN` is set in `.env.local`
- Token should start with `sanity_` prefix
- Must have appropriate write permissions in Sanity project
- Token not needed for read-only operations

---

#### 3. Null results from queries

**Problem**: Query returns `null` when expecting data

**Causes**:

- Document doesn't exist
- Wrong `_id` or `slug` value
- Field being queried is optional and missing
- Reference not properly linked

**Debug Steps**:

1. Use Sanity Vision tool to test query manually
2. Check document exists in studio
3. Verify query parameters match document
4. Check if field is optional in schema

---

#### 4. Type mismatch errors

**Problem**: TypeScript error with query result

**Solution**:

- Run `sanity typegen generate` to regenerate types
- Check `sanity.types.ts` for correct type exports
- Query result types auto-generated - don't edit manually
- Regenerate after changing queries

---

#### 5. Slug conflicts

**Problem**: Can't create startup due to slug conflict

**Causes**:

- Two startups with identical slug
- Slug contains special characters not handled by `slugify`

**Solution**:

```typescript
// Manual slug generation with uniqueness handling
let slug = slugify(title, { lower: true, strict: true });
const existing = await client.fetch(
  `*[_type == "startup" && slug.current == $slug]`,
  { slug }
);
if (existing.length > 0) {
  slug = `${slug}-${Date.now()}`; // Add timestamp for uniqueness
}
```

---

#### 6. Image URL validation failures

**Problem**: "Image is required" validation error

**Cause**: Image field expects valid URL string

**Solution**:

```typescript
// Must be valid URL
image: "https://example.com/image.jpg",  // ✓ Correct

// Not valid
image: "/local/path.jpg",  // ✗ Wrong - use full URL
image: null,               // ✗ Wrong - field is required
```

---

### Debugging Tools

#### 1. Sanity Vision

Access at `/studio` → Vision icon

```groq
// Test queries here
*[_type == "startup"] { _id, title }
```

#### 2. Console Logging

```typescript
console.log("Query result:", result);
console.log("Error:", error);
```

#### 3. Network Inspector

In browser DevTools:

- Check Network tab for API requests
- Look for `/query` endpoints
- Verify response data shape

---

## File Reference Summary

| File                                                             | Purpose                             |
| ---------------------------------------------------------------- | ----------------------------------- |
| [sanity.config.ts](sanity.config.ts)                             | Main Sanity configuration           |
| [sanity/env.ts](sanity/env.ts)                                   | Environment variable management     |
| [sanity/lib/client.ts](sanity/lib/client.ts)                     | Read-only Sanity client             |
| [sanity/lib/write-client.tsx](sanity/lib/write-client.tsx)       | Authenticated write client          |
| [sanity/lib/queries.ts](sanity/lib/queries.ts)                   | GROQ query definitions              |
| [sanity/schemaTypes/startup.ts](sanity/schemaTypes/startup.ts)   | Startup schema definition           |
| [sanity/schemaTypes/author.ts](sanity/schemaTypes/author.ts)     | Author schema definition            |
| [sanity/schemaTypes/playlist.ts](sanity/schemaTypes/playlist.ts) | Playlist schema definition          |
| [sanity/structure.ts](sanity/structure.ts)                       | Studio UI structure                 |
| [lib/actions.ts](lib/actions.ts)                                 | Server actions for content creation |

---

## Additional Resources

- [Sanity Official Docs](https://www.sanity.io/docs)
- [GROQ Query Language Docs](https://www.sanity.io/docs/groq)
- [Next.js + Sanity Integration](https://www.sanity.io/guides/next-js-getting-started)
- [Schema Definition Guide](https://www.sanity.io/docs/schema-types)
- [Content APIs](https://www.sanity.io/docs/apis-and-architecture)
