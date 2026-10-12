# WorkFlow

WorkFlow is a project management application built with the Next.js App Router,
React, TypeScript, Tailwind CSS, Supabase Auth, and PostgreSQL through Prisma.
The workspace displays projects in Ongoing, Pending, Completed, and Target
groups. Signed-in users can add projects with a description, dates, priority,
status, and progress.

## Getting started

Use Node.js 20.9 or newer.

```bash
npm install
Copy-Item .env.example .env
```

Fill in `.env` with the Supabase project URL, publishable key, site URL, pooled
database URL, and direct database URL. In the Supabase dashboard, enable email
authentication and allow the `/auth/callback` URL for local and deployed
sign-up confirmation.

Apply the initial database migration, then start the app:

```bash
npm run db:deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and add
projects in your workspace.

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
features/projects/           Workspace, project form, and project UI
lib/db/                      Server-only Prisma client and RLS transaction helper
lib/supabase/                Server-side Supabase Auth clients
prisma/schema.prisma         Project schema and status enums
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

New sign-ups currently create owner workspaces. A separate manager role and
manager dashboard are not implemented yet. Project progress is set when a
project is created; task-based progress can replace manual progress once tasks
are introduced.

Keep `.env` and real credentials out of version control. `.env.example`
contains placeholders only.
