# mezmur-lyrics

Ethiopian Orthodox Tewahedo Hymn (Mezmur) lyrics management system with a Supabase backend and Next.js frontend.

## Prerequisites

- Node.js 20+
- npm
- A Supabase project

## Environment variables

Create `.env.local` in the repository root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database setup (Supabase)

1. Open your Supabase project SQL Editor.
2. Run `supabase/schema.sql`.
3. Seed at least one admin role in `public.user_roles` using the Supabase user UUID:

```sql
insert into public.user_roles (user_id, role)
values ('<auth_user_uuid>', 'admin');
```

## Run locally

```bash
npm install
npm run dev
```

App routes:
- `/` public approved mezmur library
- `/submit` public mezmur submission form
- `/admin` protected review dashboard for admin/moderator

## Validation

```bash
npm run lint
npm run build
```
