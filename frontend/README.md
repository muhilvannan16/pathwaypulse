# PathwayPulse frontend

React + Vite app. Run it from this folder:

```powershell
npm install
npm run dev      # http://localhost:5173
npm run build    # production build check
npm run lint
```

## Where the data comes from

All data goes through `src/api/reports.js`. Two modes, chosen with environment
variables (copy `.env.example` to `.env.local` to change them):

| Variable | Values | Default |
| --- | --- | --- |
| `VITE_DATA_SOURCE` | `api` (FastAPI backend) or `sample` (made-up local data) | `api` |
| `VITE_API_URL` | address of the backend | `http://localhost:8000` |

For `api` mode, start the backend first (see `backend/`). With
`VITE_DATA_SOURCE=sample` no backend is needed.

Developer test hooks (both modes): add `?demo=error` or `?demo=empty` to the
URL to see the error and empty states.

The full project README (setup, Supabase, deployment) comes in a later stage.
