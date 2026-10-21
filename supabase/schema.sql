-- PathwayPulse database schema (Supabase / PostgreSQL)
--
-- HOW TO USE: Supabase dashboard -> SQL Editor -> New query -> paste this
-- whole file -> Run. It is safe to run again: every statement is written so
-- that running it twice changes nothing the second time.
--
-- NOTE: if you later change a CHECK rule below, editing this file will NOT
-- update a table that already exists ("create table if not exists" skips it).
-- Use a separate ALTER TABLE statement (or a new migration file) for that.

-- ---------------------------------------------------------------------------
-- 1. The reports table
-- ---------------------------------------------------------------------------
-- Field names and allowed values match the backend (backend/app/models.py)
-- and the frontend (frontend/src/constants.js). Change one, change all three.
create table if not exists public.reports (
    id          bigint generated always as identity primary key,

    -- btrim() ignores leading/trailing spaces, so "     " is not a valid title.
    title       text not null
                constraint reports_title_length
                check (char_length(btrim(title)) between 5 and 100),

    description text not null
                constraint reports_description_length
                check (char_length(btrim(description)) between 10 and 1000),

    category    text not null
                constraint reports_category_allowed
                check (category in (
                    'damaged_path',
                    'blocked_path',
                    'accessibility_barrier',
                    'missing_connection'
                )),

    -- Only the valid range of the globe is checked here. The "must be inside
    -- Rochester Hills" rule lives in the backend, not in the database.
    latitude    double precision not null
                constraint reports_latitude_range
                check (latitude between -90 and 90),

    longitude   double precision not null
                constraint reports_longitude_range
                check (longitude between -180 and 180),

    -- New reports always start as 'Pending Review'. Only the server may change it.
    status      text not null default 'Pending Review'
                constraint reports_status_allowed
                check (status in (
                    'Pending Review',
                    'Verified',
                    'Submitted to Agency',
                    'Resolved'
                )),

    created_at  timestamptz not null default now(),

    -- Not used yet (photo uploads come later): a reference to a stored file.
    photo_path  text,

    -- Set when a moderator reviews the report. Empty until then.
    reviewed_at timestamptz
);

comment on table public.reports is
    'Community-observed pathway concerns. Unverified until status says otherwise. Accessed only by the backend server.';

-- ---------------------------------------------------------------------------
-- 2. Indexes (speed up filtering by status and "newest first" lists)
-- ---------------------------------------------------------------------------
create index if not exists reports_status_idx
    on public.reports (status);

create index if not exists reports_created_at_idx
    on public.reports (created_at desc);

-- ---------------------------------------------------------------------------
-- 3. Security: ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------------
-- IMPORTANT - READ THIS BEFORE CHANGING ANYTHING BELOW.
--
-- Supabase publishes every table in the "public" schema through a web API
-- that browsers can call with a PUBLIC key (the "anon" key, which anyone can
-- copy out of a website's code). RLS is the lock that decides what that
-- public key may do.
--
-- We turn RLS ON and then deliberately create NO POLICIES at all.
-- With RLS on and zero policies, the "anon" and "authenticated" roles
-- (everyone using a public key) can read nothing, insert nothing, change
-- nothing, and delete nothing.
--
-- The only thing that can reach this table is our FastAPI backend, which
-- connects with the SERVICE key. The service role bypasses RLS by design.
-- That means the backend is the single gatekeeper: it validates input, forces
-- new reports to 'Pending Review', and (later) decides who may moderate.
-- The browser never talks to this database directly.
--
-- DO NOT add policies such as "anyone can insert" or "anyone can select".
-- A public insert policy would let anyone send a row with status 'Verified'.
alter table public.reports enable row level security;

-- Belt and braces: also remove the table permissions Supabase normally hands
-- to the public roles. Even if RLS were switched off by mistake, or someone
-- added a policy later, these roles would still be refused.
revoke all on table public.reports from anon, authenticated;
revoke all on sequence public.reports_id_seq from anon, authenticated;
