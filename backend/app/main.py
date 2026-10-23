# PathwayPulse backend: Milestone 1c

import os
import logging
import time

from fastapi import FastAPI, HTTPException, Request

from app.ratelimit import is_allowed
from fastapi.middleware.cors import CORSMiddleware

from app import db
from app.models import Report, ReportCreate

logger = logging.getLogger("pathwaypulse")

app = FastAPI(title="PathwayPulse API")

# Comma-separated list of allowed frontend origins. Local default; production sets this on Render.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]

def get_client_id(request: Request) -> str:
    # uvicorn already replaced the proxy's address with the real client's
    return request.client.host if request.client else "unknown"


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],                 
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/reports", response_model=list[Report])
def list_reports():
    try:
        return db.list_reports()
    except Exception:
        logger.exception("Could not load reports")
        raise HTTPException(status_code=503, detail="The reports database is not available right now.")


@app.post("/reports", response_model=Report, status_code=201)
def create_report(data: ReportCreate, request: Request):
    client_id = get_client_id(request)

    if not is_allowed(client_id, time.time()):
        raise HTTPException(
            status_code=429,
            detail="Too many reports from this connection. Please try again later.",
        )

    try:
        existing = db.find_recent_duplicate(data)
        if existing:
            return existing
        return db.insert_report(data)
    except Exception:
        logger.exception("Could not save report")
        raise HTTPException(
            status_code=503,
            detail="Your report could not be saved right now. Please try again.",
        )
