# WorkFlow

WorkFlow is a project management application built with the Next.js App Router,
React, TypeScript, Tailwind CSS, Supabase Auth, and PostgreSQL through Prisma.
The workspace displays projects in Ongoing, Pending, Completed, and Target
groups. Its schedule calendar lets signed-in users mark dates with personal
reminders and optional notes.

## Getting started

Use Node.js 20.9 or newer.

```bash
npm install
Copy-Item .env.example .env
```

Fill in `.env` with the Supabase project URL, publishable key, site URL, pooled
database URL, and direct database URL. In the Supabase dashboard, enable email
authentication and allow the `/auth/callback` URL for local and deployed
sign-up confirmation. Set `WORKFLOW_MANAGER_EMAIL` to the email address of the
manager account. Manager sign-up is restricted to this email address.

Apply the database migrations, then start the app:

```bash
npm run db:deploy
npm run dev
```

Users have separate sign-in and sign-up pages at `/sign-in` and `/sign-up`.
The configured manager can sign up at `/manager/sign-up`, sign in at
`/manager/sign-in`, and view all project and reminder details, including owner
emails, at `/manager`. The manager portal is read-only; other signed-in users
are redirected back to their own workspace.

Open [http://localhost:3000](http://localhost:3000), create an account, and add
projects or reminders in your workspace.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Project structure

```text
app/                        App Router routes and server actions
features/auth/              Sign-in and sign-up UI
features/projects/           Workspace, schedule calendar, and project UI
features/manager/            Read-only manager overview
lib/db/                      Server-only Prisma client and RLS transaction helper
lib/supabase/                Server-side Supabase Auth clients
prisma/schema.prisma         Project and reminder schemas
prisma/migrations/           PostgreSQL schema and row-level security migration
components/ui/               Shared UI components
schemas/                     Runtime validation schemas
types/                       Shared TypeScript types
utils/                       Shared utility functions
```

The existing root-level `app/` directory is retained rather than moved into
`src/`; Next.js supports either layout, and keeping the generated structure
avoids unnecessary file and import changes.

## Database and access control

The app uses the Supabase transaction pooler for normal requests and the direct
database connection for Prisma migrations. The database migration enables
PostgreSQL row-level security. Each server-side project operation verifies the
Supabase user, sets that user as the database request identity inside a
transaction, and only reads or writes rows owned by that user.

User sign-ups create owner workspaces. Manager-wide reads are permitted only
when the authenticated server session identifies the configured manager email,
and database row-level security grants that session read-only access across
projects and reminders. Project progress is set when a project is created;
task-based progress can replace manual progress once tasks are introduced.

Keep `.env` and real credentials out of version control. `.env.example`
contains placeholders only.
