# PathwayPulse database, in plain language

The database is Supabase (PostgreSQL). Its setup lives in
[`supabase/schema.sql`](../supabase/schema.sql).

> **Status:** the backend saves reports to a Supabase **test database**, and
> the data may be cleared at any time. The notes below describe the design.
> Before any public launch, re-check the security settings described here
> (row-level security on, no policies) in the Supabase dashboard.

## The `reports` table

One row = one community report. The columns match the data contract used by
the backend and the frontend.

| Column | What it holds | Rules the database enforces |
| --- | --- | --- |
| `id` | Unique number | Assigned automatically; nobody can choose it |
| `title` | Short summary | 5–100 characters (spaces at the ends don't count) |
| `description` | Details | 10–1000 characters |
| `category` | Type of problem | One of `damaged_path`, `blocked_path`, `accessibility_barrier`, `missing_connection` |
| `latitude`, `longitude` | Where it is | Latitude −90 to 90, longitude −180 to 180 |
| `status` | Review stage | One of `Pending Review`, `Verified`, `Submitted to Agency`, `Resolved`; starts as `Pending Review` |
| `created_at` | When it was saved | Filled in automatically |
| `photo_path` | Link to a photo file | Optional, unused so far |
| `reviewed_at` | When a moderator reviewed it | Optional, empty until reviewed |

There is deliberately **no** name, email, phone number, or account column. We
don't collect personal information about the people who report.

The "inside Rochester Hills" rule is checked by the backend only. The database
only checks that coordinates are valid places on Earth. The backend, the
database, and `frontend/src/constants.js` must agree on categories, statuses,
and text lengths, so change them together.

Two indexes (on `status` and on `created_at`, newest first) keep filtering and
"recent reports" fast as the table grows.

## Row-level security (RLS), the lock on the table

Supabase automatically publishes tables through a web address that a browser
can call using a **public key**. That key is not secret: anyone can find it by
viewing a website's code. **Row-level security** is the rule set that decides
what a public key is allowed to do with each row.

For `reports` we switch RLS **on** and create **no rules at all**. With no
rules, a public key can't read, add, change, or delete anything. We also
remove the table permissions Supabase would normally give the public roles, as a
second lock.

Only our backend can use the table, because it connects with the **service
key**, which skips RLS. That is intentional, and it means:

- the service key is extremely powerful. It lives only in `backend/.env` and in
  the hosting provider's secret settings, never in frontend code, never in
  GitHub (`.env` files are git-ignored; only `backend/.env.example` with
  placeholders is committed);
- the backend is the single gatekeeper, so its checks really matter.

## Why the browser never talks to the database directly

1. **Public keys are public.** To let the browser insert reports, we'd have to
   write a rule allowing public inserts. Then anyone could send a row saying
   `status: "Verified"` and skip moderation.
2. **Rules belong on the server.** The backend validates every field, forces
   new reports to `Pending Review`, checks the location is in the service area,
   and is where rate limiting, duplicate checks, and moderator-only status
   changes will go. A browser can be edited by anyone; the server can't.
3. **One door is easier to protect** than two. All access goes
   browser → FastAPI → database, so there is one place to review and fix.

## How to set it up (when you're ready)

1. Create a free Supabase project.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
   It is safe to run again.
3. Check: **Table Editor** shows `reports` marked as RLS enabled, and
   **Authentication → Policies** shows no policies on it. That's correct.
4. Copy `backend/.env.example` to `backend/.env` and fill in the project URL
   and the **service_role** key from **Project Settings → API**.

## Known limits

- If the service key leaks, the whole table is exposed. Rotate it in Supabase
  immediately if that happens.
- Changing a rule in `schema.sql` won't update an existing table. Use an
  `ALTER TABLE` statement or a new migration file.
- Moderator accounts, photo storage, and public read rules are not designed
  here yet.
