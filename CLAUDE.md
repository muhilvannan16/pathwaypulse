PathwayPulse — Congressional App Challenge 2026
Project overview
Build PathwayPulse, a responsive, accessible web application that helps residents of Rochester Hills, Michigan, discover and report community-observed walking and biking pathway barriers.
Tagline: Better paths. Stronger communities.
Mission: Make pathway accessibility concerns easier to document, explore, and communicate by displaying community observations on an interactive map.
Competition: Congressional App Challenge 2026.
Deadline: October 26, 2026, at noon Eastern Time. Prioritize a reliable MVP and reserve time for testing and the submission demonstration.
1. Problem statement
Rochester Hills has an established pathway network and existing public pathway information. PathwayPulse investigates whether community members need a more useful way to identify specific barriers, document observations, and understand recurring accessibility concerns.
Potential issue categories include:
Damaged pathway surfaces.
Blocked pathways.
Accessibility barriers.
Missing pathway or sidewalk connections.
These are candidate problems to investigate, not assumptions about their prevalence.
The app must complement existing public resources rather than pretend to replace official government reporting systems.
2. Target audience
Residents of Rochester Hills.
Students who walk or bike.
People with mobility needs.
Community members interested in pathway accessibility.
Community organizers who want to understand recurring concerns.
Design for mobile and desktop. Follow accessible web-design practices, including keyboard navigation, readable contrast, semantic HTML, and labeled form controls.
3. Technology stack
Use:

Frontend — React + Vite
Handles the interface, report forms, filters, and dashboard.

Backend — Python + FastAPI
Validates reports, handles API requests, calculates community statistics, and applies business rules before data is saved.

Maps — Leaflet + OpenStreetMap
Displays pathways, report markers, and selected report locations.

Database — Supabase PostgreSQL
Stores reports, timestamps, categories, coordinates, and review statuses.

Version control — GitHub
Supports collaboration between you and your friend.

Choose simple, well-supported solutions. Avoid unnecessary frameworks, microservices, complex state-management libraries, or paid services.
If Supabase credentials are not configured, implement a clearly identified local demo mode with sample data and explain how persistent storage can be configured. Never claim demo data is live community data.
4. Core features — implement in this order
Feature A: Explore dashboard
Create a polished home page with:
PathwayPulse branding.
A short mission statement.
An interactive map centered on Rochester Hills.
Markers for eligible community reports.
A recent reports list.
Counts for total reports, reports pending review, and resolved reports.
Filters for issue category and status.
Responsive layout for phones, tablets, and desktops.
Counts must reflect the actual loaded dataset. Clearly distinguish sample data from submitted community reports.
Feature B: Interactive map
Implement:
Pan and zoom.
Markers for reports with valid coordinates.
Popups showing issue title, category, and review status.
Clicking a report in the list should highlight its marker and center the map on it.
A location picker that lets contributors select a report location by clicking the map.
Coordinate validation and a clear indication of the selected location.
Do not invent official pathway geometries or actual hazards. Start with a small number of clearly labeled sample reports, and document their illustrative nature.
Feature C: Submit a report
Create a form containing:
Issue title, required.
Issue category, required.
Location selected using the map, required.
Description, required.
Optional photo attachment.
Validate required fields, text lengths, coordinates, file types, and file sizes.
After submission, show a confirmation only after the save operation succeeds. New reports should be visible according to their actual review status and the app's access rules.
Do not require public users to submit their name, phone number, or email address.
Feature D: Report details
Each report should display:
Title and category.
Description.
Map location.
Submission date.
Current review status.
Optional photo, if available and permitted.
Use clear statuses:
Pending Review.
Verified.
Submitted to Agency.
Resolved.
Do not allow an ordinary public contributor to assign a verified, submitted, or resolved status to their own report.
A report must only be marked Submitted to Agency after actual submission has been confirmed. Mark reports Resolved only when there is credible evidence of resolution.
Feature E: Community insights
Display basic, useful statistics:
Total community reports.
Reports awaiting review.
Reports by category.
Verified and resolved counts.
Optional trends over time, if sufficient data exists.
Calculate statistics from real stored records. When the dataset is too small, display an informative empty state instead of misleading charts.
Feature F: Moderation and trust
Implement a simple, secure review process:
New public submissions start as Pending Review.
Only authorized moderators can change verification or resolution statuses.
Public visitors can read only reports permitted by the publication rules.
Prevent duplicate submissions where practical.
Provide basic validation and safe rendering of user-generated text.
Do not render user input as trusted HTML.
Include a way to report inappropriate content or document how moderation is handled.
If authentication or moderator controls cannot be completed in the available time, do not expose privileged controls to ordinary visitors. Clearly document what is and is not implemented.
5. Database and security
Create a Supabase reports table with fields equivalent to:
id: unique identifier.
title: text.
description: text.
category: constrained category value.
latitude: validated numeric coordinate.
longitude: validated numeric coordinate.
status: constrained status value.
created_at: timestamp.
photo_path: optional storage reference.
reviewed_at: optional timestamp.
Use migrations or documented SQL setup instructions.
Apply row-level security and least-privilege policies. Public users must not be able to modify verification statuses, access private account data, or bypass moderator permissions.
Never place a Supabase service-role key or other server secret in frontend code. Use only appropriate public client configuration in the browser. Validate data on the server or database, not only in the user interface.
If photos are supported, restrict uploads by file type and size, avoid public exposure of private files, and use controlled access where appropriate.
Avoid collecting precise contributor identity or unnecessary personal data.
6. Privacy, accuracy, and safety
Do not publish contributor contact information.
Warn contributors not to include faces, license plates, home addresses, or other personal information in photographs or descriptions.
Provide a way to remove or moderate inappropriate content.
Clearly identify community observations as unverified unless reviewed.
Do not label an unreported pathway safe or accessible.
Do not imply that PathwayPulse is an official city application.
Do not imply that submitting a report sends it to the city.
Where appropriate, link to the official reporting channel for the relevant jurisdiction.
Do not automatically identify hazards using AI or claim that accessibility has been certified.
Include OpenStreetMap attribution and respect map tile usage rules.
7. Design direction
Create a modern civic-technology interface.
Visual direction:
Deep navy text.
Teal or green primary actions.
White cards and a light neutral background.
Clear spacing and readable typography.
Consistent buttons, forms, cards, map markers, and status indicators.
Accessible color contrast.
Subtle borders and restrained shadows.
Responsive navigation and mobile-friendly report forms.
Avoid clutter, excessive animation, oversized decorative elements, and generic placeholder sections.
Build reusable components for the header, map, report card, filter controls, report form, statistics, and empty/error/loading states.
8. Testing requirements
Test the following:
The application starts successfully.
The map loads or displays a useful fallback if the map service is unavailable.
Reports with valid coordinates appear on the map.
Clicking a report opens its details.
Filters return the correct reports.
Form validation prevents invalid submissions.
A successful submission is saved.
Reports persist after refresh when the database is configured.
Public users cannot change privileged statuses.
Failed network requests show understandable errors.
Empty datasets display useful messages.
The layout works on mobile and desktop.
Keyboard navigation and form labels work correctly.
User-generated content is rendered safely.
Run available tests and build checks. Fix errors before claiming the application is complete.
9. Project workflow
Work in small, understandable stages.
First:
Inspect the existing repository and identify its current files and technology.
Summarize the implementation plan.
Identify missing configuration or credentials.
Preserve useful existing work.
Then implement in this order:
Project setup and dashboard layout.
Interactive map with illustrative sample reports.
Report list, details, and filters.
Report submission and map-based location selection.
Persistent database storage and security.
Moderation and status management.
Responsive design and accessibility improvements.
Testing, deployment instructions, and documentation.
After each stage:
Explain what changed.
List files created or modified.
Run the relevant tests or build checks.
Identify any remaining issues.
Give concise instructions for the next step.
Do not stop at a static mockup. Deliver a functioning application. Do not claim features are complete when they are only placeholders.
10. Documentation and competition preparation
Create a README with:
The community problem and intended users.
Features and technology stack.
Setup and run instructions.
Environment variable configuration.
Supabase schema and security setup.
Testing instructions.
Deployment instructions.
Known limitations.
Clear disclosure of sample data and the app's non-governmental status.
Also create a concise demo plan showing:
The community problem.
Exploring reports on the map.
Submitting a report.
Filtering reports and viewing details.
How moderation protects accuracy.
The app's potential community impact.
Do not invent user statistics, community survey results, endorsements, or claims of real-world impact.
11. Scope and deadline
The deadline is October 26, 2026, at noon Eastern Time.
Prioritize a small, polished, working application over an ambitious unfinished system.
If time becomes limited, preserve:
A working interactive map.
A working report form.
Clear report details and filters.
Secure data handling.
A reliable demonstration.
Defer complex routing, AI features, live government integrations, push notifications, and other nonessential features.
Start by inspecting the repository, then propose the implementation steps and begin with the first stage. Ask only for configuration or decisions that are genuinely necessary. Explain the work clearly so the developers(me and my friend) can understand, test, and maintain their project.

## How we work (Muhil + Claude)
- Muhil writes ALL Python/FastAPI code in backend/. Do not create or
  edit Python files in backend/ unless he explicitly asks or says
  he's stuck. For Python: explain the concept, give one milestone-
  sized task, review his code. Inspect installed package source or
  official docs before guiding on any library API (FastAPI,
  Pydantic v2, supabase-py).
- Claude builds everything else (React + Vite frontend in frontend/,
  Leaflet map, CSS/accessibility, Supabase SQL and RLS in supabase/,
  README, demo plan) and explains what it did and why in plain
  language. Muhil is intermediate in JS/HTML/CSS.
- After each stage, write a short "what we did and why" note that
  Muhil can forward to his friend.
- The friend is very busy. Never make any task depend on him.
- Environment: Windows, PowerShell, VS Code, Python 3.13, Node 24.
  Repo: github.com/muhilvannan16/pathwaypulse.

## Deployment addendum
The full deployment and public-launch requirements are in
docs/deployment-requirements.md. The deadline-critical parts are a
controlled test deployment (Vercel + Render + Supabase), server-side
validation, rate limiting, moderator-only status changes, and a
flagging mechanism. The full public launch, maintenance plan, and PWA
are post-competition.
