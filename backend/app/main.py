# PathwayPulse backend: Milestone 1c
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import Report

app = FastAPI(title="PathwayPulse API")

# NEW: tell browsers which website is allowed to read this API's responses.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],                 
    allow_headers=["Content-Type"],
)

# Temporary "database": a plain list that resets when the server restarts.
# Supabase replaces this later.
reports: list[Report] = [
    Report(
        id=1,
        title="Cracked sidewalk",                     # at least 5 characters
        description="Large crack near the corner.",               # at least 10 characters
        category="damaged_path",                  # one of the four categories
        latitude=42.65,                     # Rochester Hills is near 42.65, -83.14
        longitude=-83.14,
        status="Pending Review",
        created_at="2026-10-10T14:30:00",   # a string is fine; Pydantic converts it
    ),
    Report(
        id=2,
        title="Blocked path",
        description="Path is blocked by debris.",
        category="blocked_path",                  # use a different category from report 1
        latitude=42.66,
        longitude=-83.15,
        status="Verified",                    # NOT "Pending Review" this time
        created_at="2026-10-11T09:00:00",
    ),
]


@app.get("/health")
def health():
    return {"status": "ok"}


# response_model tells FastAPI to check the return value against Report
# and turn it into JSON.
@app.get("/reports", response_model=list[Report])
def list_reports():
    return reports