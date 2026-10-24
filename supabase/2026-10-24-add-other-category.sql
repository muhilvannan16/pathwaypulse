-- PathwayPulse: allow the "other" category on an EXISTING database.
--
-- WHY THIS FILE EXISTS: supabase/schema.sql uses "create table if not exists",
-- so editing its CHECK list does not change a table that already exists.
-- Run THIS file once in the Supabase dashboard (SQL Editor -> New query ->
-- paste -> Run) to update the live table. It does not touch any rows.
--
-- Order matters when deploying: run this first, then deploy the backend
-- (backend/app/models.py must also allow "other"), then deploy the frontend.

alter table public.reports
    drop constraint if exists reports_category_allowed;

alter table public.reports
    add constraint reports_category_allowed
    check (category in (
        'damaged_path',
        'blocked_path',
        'accessibility_barrier',
        'missing_connection',
        'other'
    ));
