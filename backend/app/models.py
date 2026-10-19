# PathwayPulse backend: Milestone 1b
# ReportCreate = what a PUBLIC user is allowed to send when submitting a report.

from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

Category = Literal["damaged_path", "blocked_path", "accessibility_barrier", "missing_connection"]


class ReportCreate(BaseModel):
    # 2. Config goes at the TOP of the class, before the fields
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    category: Category
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    # No status, id or created_at: the server sets those.