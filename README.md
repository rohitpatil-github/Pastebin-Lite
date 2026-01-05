# Pastebin Lite

A secure, ephemeral pastebin application built with Next.js (App Router) and Supabase (PostgreSQL).

## Features

- **Create Pastes**: Securely store text snippets.
- **Ephemeral Storage**: Set Time-to-Live (TTL) for auto-expiration logic.
- **View Limits**: Set a maximum number of views before the paste creates self-destructs.
- **Atomic Operations**: Uses PostgreSQL Stored Procedures (`RPC`) to ensure strict enforcement of view limits even under high concurrency.
- **Fast & Serverless**: Designed for Vercel deployment.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

1. Node.js 18+
2. A Supabase project. Create one at [supabase.com](https://supabase.com/).

### Database Setup

1. Go to your Supabase Dashboard -> **SQL Editor**.
2. Run the contents of `supabase_schema.sql` (found in this repo) to create the table and atomic function.

### Local Setup

1. **Clone the repository** (if applicable) or navigate to project root.

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Found in Project Settings -> API.
   - `SUPABASE_SERVICE_ROLE_KEY`: Found in Project Settings -> API -> Service Role (secret).

   > **Note**: We use the Service Role Key server-side to manage the `view_count` atomically without complex RLS policies for this demo.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Design Decisions

- **Persistence**: Supabase was chosen for relational data integrity and ease of use.
- **Atomic Counters**: To prevent race conditions, we use a PostgreSQL Stored Procedure (`get_paste_atomic`). This procedure locks the row, checks all constraints (expiry, max views), increments the counter, and returns the data in a single transaction.
- **Testing**: Deterministic testing for time-based expiry is supported via `x-test-now-ms` header when `TEST_MODE=1` is set.

## API Endpoints

### `GET /api/healthz`
Health check. Returns `{"ok": true}` if Supabase is reachable.

### `POST /api/pastes`
Create a paste.
```json
{
  "content": "Hello World",
  "ttl_seconds": 60,
  "max_views": 5
}
```

### `GET /api/pastes/:id`
Fetch a paste (increments view count).
```json
{
  "content": "Hello World",
  "remaining_views": 4,
  "expires_at": "2023-..."
}
```
