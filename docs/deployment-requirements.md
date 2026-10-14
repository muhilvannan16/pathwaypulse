# PathwayPulse — Updated Deployment and Public Launch Requirements

## 1. Project Goal

PathwayPulse is a community-powered pathway reporting web app for Rochester Hills, Michigan. It helps residents report and explore community-observed problems affecting walking and biking pathways through an interactive map.

This project is being developed for the Congressional App Challenge, but the long-term goal is to publish a working public website that people can continue using after the competition.

**Do not build a native iOS or Android app.** Build one responsive web app that works well on desktop computers, tablets, and mobile phones.

## 2. Technology Stack

Use the following planned stack:

- **Frontend:** React, Vite, JavaScript, and CSS
- **Interactive map:** Leaflet with OpenStreetMap tiles and appropriate attribution
- **Backend:** Python 3.12+ with FastAPI
- **Database:** Supabase PostgreSQL
- **Source control:** Git and GitHub
- **Frontend hosting:** Vercel, or another suitable static frontend host
- **Python API hosting:** Render, or another suitable Python-compatible hosting provider

Before choosing final deployment configurations, check current hosting requirements, free-tier limitations, usage restrictions, and potential costs. Do not assume that every service will remain free or that free-tier instances will always be available.

Keep the frontend, backend, and database responsibilities clearly separated.

## 3. Public Website Requirements

The deployed application must:

- Have a public URL accessible to people outside the development environment.
- Work in modern desktop and mobile browsers.
- Adapt its layout to smaller screens.
- Allow users to explore the map, view reports, submit reports, and filter results.
- Store reports persistently in the production database.
- Display understandable loading, success, empty, and error states.
- Avoid exposing development tools, secrets, or administrative functions to ordinary visitors.
- Include a clear description of the app's purpose and limitations.

Do not treat a successful local development run as proof that the public website is ready.

## 4. Public Deployment Architecture

Use this architecture:

1. Vercel hosts the React frontend.
2. The frontend sends API requests over HTTPS to the deployed FastAPI backend.
3. FastAPI validates requests, applies business rules, and accesses Supabase PostgreSQL securely.
4. The API returns the requested report information to the frontend.
5. The frontend updates the map, report list, report details, or statistics.

Configure the production frontend URL in the backend's CORS settings. Do not allow unrestricted origins in production.

Store secrets in the hosting providers' environment-variable settings. Never commit credentials to GitHub or expose a Supabase service-role key in frontend code.

Use appropriate database access policies, server-side authorization, and least-privilege access. Ordinary users must not be able to change moderation statuses or access administrative operations without authorization.

## 5. Public-Use Safety and Privacy

PathwayPulse is an independent student project, not an official City of Rochester Hills service.

Make that clear in the interface. Do not imply that reports are automatically sent to the city or that the app guarantees a path is safe or accessible.

Implement these safeguards before accepting real public reports:

- Validate report fields and geographic coordinates on the server.
- Limit and validate uploaded file types and sizes if photo uploads are supported.
- Protect against spam and inappropriate submissions with reasonable rate limits and moderation.
- Avoid collecting unnecessary personal information.
- Warn users not to upload identifiable people, license plates, or private information in photos.
- Clearly label new or unverified community observations.
- Allow inappropriate reports to be flagged