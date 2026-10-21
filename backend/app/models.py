# PathwayPulse backend
# ReportCreate = what a PUBLIC user may send.  Report = what the SERVER stores and returns.

from datetime import datetime
from typing import Literal, Self
from pydantic import BaseModel, ConfigDict, Field, model_validator

Category = Literal["damaged_path", "blocked_path", "accessibility_barrier", "missing_connection"]

Status = Literal["Pending Review", "Verified", "Submitted to Agency", "Resolved"]

MIN_LAT = 42.55
MAX_LAT = 42.78
MIN_LON = -83.30   # negative: west of Greenwich
MAX_LON = -83.00


class ReportCreate(BaseModel):
    # Reject unknown fields instead of silently dropping them; trim spaces from text.
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    category: Category
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

    @model_validator(mode="after")
    def check_service_area(self) -> Self:
        inside = (
            MIN_LAT <= self.latitude <= MAX_LAT
            and MIN_LON <= self.longitude <= MAX_LON
        )
        if not inside:
            raise ValueError("Location must be within the Rochester Hills area")
        return self                                  # an "after" validator must return self


class Report(ReportCreate):
    id: int
    status: Status = "Pending Review"
    created_at: datetime
    photo_path: str | None = None
    reviewed_at: datetime | None = None