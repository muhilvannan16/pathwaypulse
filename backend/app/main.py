# PathwayPulse backend: Milestone 1c

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import db
from app.models import Report, ReportCreate

logger = logging.getLogger("pathwaypulse")

app = FastAPI(title="PathwayPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
def create_report(data: ReportCreate):
    try:
        return db.insert_report(data)
    except Exception:
        logger.exception("Could not save report")
        raise HTTPException(status_code=503, detail="Your report could not be saved right now. Please try again.")
