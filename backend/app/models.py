# PathwayPulse backend
# ReportCreate = what a PUBLIC user may send.  Report = what the SERVER stores and returns.

from datetime import datetime                      # NEW import, for created_at
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

Category = Literal["damaged_path", "blocked_path", "accessibility_barrier", "missing_connection"]

# NEW: the four statuses, defined next to Category
Status = Literal["Pending Review", "Verified", "Submitted to Agency", "Resolved"]


class ReportCreate(BaseModel):
    # Reject unknown fields instead of silently dropping them; trim spaces from text.
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    category: Category
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


# NEW: everything in ReportCreate, plus the fields only the server controls
class Report(ReportCreate):
    id: int
    status: Status = "Pending Review" 
    created_at: datetime