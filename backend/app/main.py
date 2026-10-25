# PathwayPulse backend: Milestone 1c

import os
import logging
import time

import secrets
from fastapi import Depends, FastAPI, Header, HTTPException, Request

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

MODERATOR_TOKEN = os.environ.get("MODERATOR_TOKEN", "")


def require_moderator(x_moderator_token: str | None = Header(default=None)) -> None:
    # Fail closed: if no token is configured, or none was sent, refuse.
    if not MODERATOR_TOKEN or not x_moderator_token:
        raise HTTPException(status_code=401, detail="Moderator access required.")
    # Compare as bytes: compare_digest raises an error on non-ASCII text.
    if not secrets.compare_digest(x_moderator_token.encode(), MODERATOR_TOKEN.encode()):
        raise HTTPException(status_code=401, detail="Moderator access required.")


def get_client_id(request: Request) -> str:
    # uvicorn already replaced the proxy's address with the real client's
    return request.client.host if request.client else "unknown"


@app.get("/moderation/reports", response_model=list[Report], dependencies=[Depends(require_moderator)])
def moderation_list():
    try:
        return db.list_pending()
    except Exception:
        logger.exception("Could not load moderation queue")
        raise HTTPException(status_code=503, detail="The moderation queue is not available right now.")


@app.post("/moderation/reports/{report_id}/verify", response_model=Report, dependencies=[Depends(require_moderator)])
def moderation_verify(report_id: int):
    try:
        report = db.verify_report(report_id)
        if report is None:
            raise HTTPException(status_code=404, detail="Report not found.")
        return report
    except HTTPException:
        raise
    except Exception:
        logger.exception("Could not verify report %s", report_id)
        raise HTTPException(status_code=503, detail="The report could not be verified right now.")


@app.delete("/moderation/reports/{report_id}", status_code=204, dependencies=[Depends(require_moderator)])
def moderation_reject(report_id: int):
    try:
        was_deleted = db.reject_report(report_id)
        if not was_deleted:
            raise HTTPException(status_code=404, detail="Report not found.")
    except HTTPException:
        raise
    except Exception:
        logger.exception("Could not reject report %s", report_id)
        raise HTTPException(status_code=503, detail="The report could not be rejected right now.")


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "X-Moderator-Token"],
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
