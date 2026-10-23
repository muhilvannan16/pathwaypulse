# PathwayPulse

**Better paths. Stronger communities.**

PathwayPulse is a community-powered web app for exploring and reporting walking and biking pathway barriers in Rochester Hills, Michigan. It is being built for the Congressional App Challenge 2026.

> **PathwayPulse is an independent student project. It is not an official City of Rochester Hills service.** Submitting a report here does not send it to the city. For official reports, use the city's own channels.

> **Current status: test version, work in progress.** Reports are saved to a test database and may be cleared at any time. New reports are meant to appear on the map only after a review. Please don't include personal information. If the app is run in sample mode (see [Sample data and test views](#sample-data-and-test-views)), it shows clearly labeled made-up reports instead. See [Project status](#project-status) for what works today.

## The problem

Rochester Hills already has a pathway network and public pathway information. PathwayPulse explores whether residents would benefit from an easier way to document specific barriers, such as:

- damaged pathway surfaces
- blocked pathways
- accessibility barriers
- missing pathway or sidewalk connections

These are problems to investigate, not claims about how common they are. PathwayPulse is meant to complement official resources, not replace them. It never labels a pathway "safe" or "accessible": a map with no reports on a route does not mean the route has no barriers.

## Who it is for

Residents, students who walk or bike, people with mobility needs, and community members or organizers who want to understand recurring concerns.

## Project status

| Area | Status |
| --- | --- |
| Explore page: map, filters, counts, report list | Working |
| Accessibility basics: skip link, labeled controls, visible keyboard focus, keyboard-pannable map | Working, being refined |
| Loading, empty, and error states | Working |
| FastAPI backend (validation, list and create reports) | Working |
| Report submission form with map location picker | Working |
| Supabase test database | Connected; schema and security setup in `supabase/schema.sql` |
| Moderation and status management | Not started |
| Deployment | Not started |

This table will be kept up to date as features are completed.

## Tech stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Map:** Leaflet and react-leaflet with OpenStreetMap tiles
- **Backend:** Python and FastAPI
- **Database:** Supabase PostgreSQL
- **Hosting (planned):** Vercel for the frontend, Render for the API

## Run the frontend locally

You need Node.js 18 or newer.

```bash
cd frontend
npm install
npm run dev
```

Then open the address Vite prints, usually <http://localhost:5173>.

Other commands:

```bash
npm run build     # production build, output in frontend/dist
npm run preview   # serve the production build locally
npm run lint      # run the linter
```

### Sample data and test views

By default the app loads and saves reports through the backend (`VITE_DATA_SOURCE=api`, see `frontend/.env.example`). With `VITE_DATA_SOURCE=sample` no backend is needed: the app reads made-up reports from `frontend/src/data/sampleReports.js`, a "Sample data" badge appears on the page, and each report is tagged as a sample. These URL switches work in both modes and let you check the other states:

- `/?demo=error` shows the "couldn't load reports" state
- `/?demo=empty` shows the "no reports yet" state
- `/?demo=slow` makes requests take about 6 seconds, to show the "test server is waking up" message
- `/?demo=timeout` shows that message, then the "server didn't respond in time" state with a Retry button
- `/?demo=ratelimit` makes submitting a report fail like the server's "too many reports" (HTTP 429) answer

## How the code is organized

```
backend/    Python / FastAPI API (in progress)
frontend/   React + Vite app
  src/api/reports.js      the only file that fetches data
  src/components/         header, map, filters, report cards, counts, notices
  src/pages/              the Explore page
  src/data/               sample reports
  src/constants.js        categories and statuses shared with the backend
docs/       project documents
CLAUDE.md   project spec and working notes
```

All data access goes through `frontend/src/api/reports.js`. When the backend is ready, only that file needs to change.

### Data model

Each report has: `id`, `title`, `description`, `category`, `latitude`, `longitude`, `status`, `created_at`, `photo_path` (optional), and `reviewed_at` (optional).

- **Categories:** `damaged_path`, `blocked_path`, `accessibility_barrier`, `missing_connection`
- **Statuses:** Pending Review, Verified, Submitted to Agency, Resolved

Planned rules: new public reports always start as Pending Review. Only authorized moderators can change a status. "Submitted to Agency" will be used only after a report was actually submitted, and "Resolved" only with credible evidence.

## Deploying

The planned setup is **Vercel** (frontend), **Render** (Python API), and **Supabase** (database). Set the variables below in each host's dashboard. **Never commit real values**; the placeholders here are examples only. See [docs/deployment-requirements.md](docs/deployment-requirements.md) for the full requirements.

### Render (backend API)

| Variable | What to put there | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | Your Supabase project URL | Supabase dashboard, Project Settings, API |
| `SUPABASE_SERVICE_KEY` | Your Supabase **service_role** key | **Secret.** Full database access. Server only; never in the frontend |
| `ALLOWED_ORIGINS` | The frontend's web address, e.g. `https://YOUR-APP.vercel.app` | Several addresses separated by commas, **no spaces and no trailing slash** |
| `PYTHON_VERSION` | The Python version Render should use | Match the one you develop with (3.13); check Render's docs for the accepted format |

Typical service settings (confirm against Render's current docs): root directory `backend`, build command `pip install -r requirements.txt`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

### Vercel (frontend)

| Variable | What to put there | Notes |
| --- | --- | --- |
| `VITE_API_URL` | The public address of the Render service, e.g. `https://YOUR-API.onrender.com` | **Public**: it is baked into the site at build time, so redeploy after changing it |

Typical project settings: root directory `frontend`, build command `npm run build`, output directory `dist`. Leave `VITE_DATA_SOURCE` unset so the app uses the real API (it defaults to `api`). The site uses `#/` links for its two pages, so no rewrite rules are needed.

### Order of setup

1. Deploy the backend on Render and copy its address.
2. Put that address in `VITE_API_URL` on Vercel and deploy the frontend.
3. Put the Vercel address in `ALLOWED_ORIGINS` on Render and redeploy the backend. Until you do, the browser blocks the frontend from calling the API.

### Free-tier "waking up" delay

Render's free plan puts the API to sleep after about 15 minutes without traffic, and the first request afterwards can take around a minute. The app handles this: after about 4 seconds it shows "The test server is waking up. This can take up to a minute." and keeps waiting, then stops after about 75 seconds with a Retry button. If submitting a report times out, the form says it cannot tell whether the report was saved and asks people to check the list before sending it again.

## Privacy and accuracy

- Contributors will not be asked for a name, email, or phone number.
- Photos and descriptions should not include faces, license plates, home addresses, or other personal information.
- Community observations are unverified unless their status says otherwise.
- Map data is from [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## Known limitations

- This is a test version: reports are saved to a test database and may be cleared at any time.
- **The "appears after a review" promise is not enforced yet.** The site tells people new reports appear after a review, but the backend's `GET /reports` still returns every report, including ones that are Pending Review. It must return only reviewed reports before the site is shown to the public.
- There is no moderation tool yet. Until there is one, a developer has to change a report's status by hand in the Supabase dashboard, so every new report stays Pending Review.
- Photo uploads are not supported yet.

## Contributing and contact

This is a student project built by two developers. Ideas and bug reports are welcome through GitHub Issues.

## License

No license has been chosen yet. Until one is added, all rights are reserved by the authors.
