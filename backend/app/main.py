# PathwayPulse backend: Milestone 1a

from fastapi import FastAPI


app = FastAPI(title="PathwayPulse API")


@app.get("/health")
def health():
    return {"status": "ok"}