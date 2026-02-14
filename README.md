# Company Payroll & Expense Manager

Internal dashboard for payroll, salary tracking, and office expenses. Built with Next.js, Supabase (auth + DB), React Query, and shadcn/ui.

## Tech stack

- **Next.js 16** (App Router)
- **Supabase** – auth and database
- **React Query** – server state and caching
- **shadcn/ui** – UI components and charts

## Getting started

### 1. Supabase project

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **Authentication → Providers**, enable **Email** (and optionally **Confirm email** off for local dev).
3. In **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Database schema

In the Supabase **SQL Editor**, run the migration:

- `supabase/migrations/00001_profiles.sql`

This creates the `profiles` table (with `role`: admin / finance / viewer) and the trigger that creates a profile on signup. To make the first user an admin, run:

```sql
update public.profiles set role = 'admin' where id = 'your-user-uuid';
```

(Get the UUID from **Authentication → Users** after signing up.)

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You’ll be redirected to **/login**. Use **Sign up** to create an account, then you’ll land on the dashboard.

## Project structure

- `app/(auth)/` – login, signup (public)
- `app/dashboard/` – main app (protected), dashboard home, employees, salary, expenses, reports, settings
- `app/providers.tsx` – React Query + TooltipProvider
- `components/ui/` – shadcn components
- `components/layout/` – AppSidebar
- `lib/supabase/` – browser and server Supabase clients
- `lib/auth.ts` – getCurrentUser, getProfile
- `middleware.ts` – session refresh and route protection
- `supabase/migrations/` – SQL migrations
- `types/` – shared TypeScript types

## Next steps

- **Employees** – CRUD, filters, department
- **Salary** – monthly records, status (Pending/Paid/Deferred), receipts
- **Expenses** – fixed assets and day-to-day expenses
- **Reports** – filters, CSV/PDF export
- **Settings** – admin email for salary reminder
- **Email reminder** – cron (e.g. Vercel Cron) + Supabase or Resend

## Deploy

Set the same env vars in your host (Vercel, etc.). For cron-based salary reminders, add a serverless route or use Supabase Edge Functions.
