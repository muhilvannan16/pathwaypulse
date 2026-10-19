# PathwayPulse backend: Milestone 1b
# ReportCreate = what a PUBLIC user is allowed to send when submitting a report.

from typing import Literal

from pydantic import BaseModel, Field

# The allowed category values. They must match frontend/src/constants.js exactly.
Category = Literal[
    "damaged_path",
    "blocked_path",
    "accessibility_barrier",
    "missing_connection",
]


class ReportCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)

    description: str = Field(..., min_length=10, max_length=1000)

    category: Category

    latitude: float = Field(..., ge=-90, le=90)

    
    longitude: float = Field(..., ge=-180, le=180)

    # Note: there is NO status, id, or created_at here. The server sets
    # those.