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
- Allow inappropriate reports to be flagged for review.
- Restrict moderation actions to authorized moderators.
- Only display a report as officially submitted to an agency if that submission actually occurred.
- Only mark reports resolved when there is reasonable supporting evidence.
- Provide clear instructions for contacting the appropriate authority directly when a user needs to make an official report.

Use fictional, clearly labeled sample reports during development. Do not present invented observations or statistics as real community data.

## 6. Real-User Testing Plan

Before inviting the wider public, conduct a small usability test with a few volunteers, such as classmates, family members, or other willing testers.

Ask them to try tasks such as:

1. Open the public website on a phone or computer.
2. Find and open an existing report.
3. Filter reports by category or status.
4. Submit a test report.
5. Refresh the page and check whether the report remains available.
6. Explain what a report's status means.

Record actual problems, confusion, and suggestions. Fix important issues and repeat the relevant tests.

Use test data or a controlled test environment for early testing. Do not ask volunteers to submit fake reports to public community data. If production testing is necessary, clearly mark test submissions and remove them afterward in accordance with the app's policies.

Do not claim a certain number of testers, successful tests, or user improvements unless those results were actually recorded.

## 7. Production Readiness Checklist

Before announcing the public launch, verify:

- The frontend loads through its public HTTPS URL.
- The API is reachable and correctly configured.
- The frontend communicates with the production API.
- Database records persist across refreshes and new sessions.
- Invalid inputs are rejected with useful error messages.
- Unauthorized users cannot perform moderator actions.
- Database policies and credentials have been reviewed.
- API errors, loading states, and unavailable services are handled gracefully.
- The app is usable on mobile screens and with keyboard navigation.
- Map attribution and hosting terms are respected.
- Photo upload validation is tested if photos are supported.
- No secrets, debug credentials, or sensitive information are committed to the repository.
- The README explains setup, configuration, deployment, testing, and known limitations.

Only call the app production-ready after the relevant checks have passed. If a required security feature is incomplete, explain the limitation and fix it before opening that functionality to the public.

## 8. Maintenance After Launch

Plan for continued use after the competition:

- Document how to deploy updates.
- Keep dependencies reasonably up to date.
- Monitor application errors and hosting usage.
- Review and moderate community submissions.
- Document how to back up and recover important data where supported.
- Keep track of hosting limits and costs.
- Identify who will maintain the app and manage its accounts after launch.
- Provide a way for users to report technical problems or inappropriate content.

Do not promise permanent uptime or free hosting.

## 9. Optional Future Feature

Consider making the website installable as a Progressive Web App (PWA) after the main app is working and deployed. This could allow users to add it to their phone's home screen.

This is optional. Do not delay the essential reporting, database, security, or deployment work to implement it.

## 10. Development Workflow

Work incrementally rather than generating the entire application at once.

First inspect the repository and summarize the existing files, current implementation, and missing pieces. Preserve existing work and avoid overwriting files unnecessarily.

Then propose a phased implementation plan:

1. Build the responsive frontend and interactive map.
2. Implement report creation, listing, details, and filtering.
3. Build the Python FastAPI backend and validation.
4. Connect the database and verify persistence.
5. Implement moderation, permissions, and security controls.
6. Test the application locally and with automated tests.
7. Deploy a controlled test version.
8. Conduct small-group usability testing and fix issues.
9. Deploy the public production version.
10. Update the README and prepare the Congressional App Challenge demonstration.

For each phase, explain what was implemented, which files changed, how to run and test it, and what remains unfinished.

Do not claim a deployment or test succeeded without verifying the result. Do not invent hosting credentials, environment variables, domains, or external service configuration.

## Final Objective

Deliver a secure, usable, responsive, publicly accessible PathwayPulse web app that works on desktop and mobile browsers, uses Python meaningfully in its backend, stores real reports persistently, and has been tested with a small group before wider public use.

The result must be suitable for a Congressional App Challenge demonstration and designed for responsible continued use after the competition.