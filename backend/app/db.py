import os

from dotenv import load_dotenv
from supabase import Client, create_client

from datetime import datetime, timedelta, timezone
from app.models import Report, ReportCreate

load_dotenv()  # reads backend/.env into environment variables

_client: Client | None = None


def get_client() -> Client:
    """Create the Supabase client once, then reuse it."""
    global _client
    if _client is None:
        _client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])   # the two .env names
    return _client

def list_pending() -> list[Report]:
    response = (
        get_client().table("reports").select("*")
        .eq("status", "Pending Review")
        .order("created_at", desc=False)      # oldest first
        .execute()
    )
    return [Report(**row) for row in response.data]


def verify_report(report_id: int) -> Report | None:
    response = (
        get_client().table("reports")
        .update({"status": "Verified", "reviewed_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", report_id)
        .eq("status", "Pending Review")
        .execute()
    )
    return Report(**response.data[0]) if response.data else None


def reject_report(report_id: int) -> bool:
    response = (
        get_client().table("reports").delete()
        .eq("id", report_id)
        .eq("status", "Pending Review")
        .execute()
    )
    return bool(response.data)

def find_recent_duplicate(data: ReportCreate, minutes: int = 10) -> Report | None:
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=minutes)).isoformat()
    response = (
        get_client()
        .table("reports")
        .select("*")
        .eq("title", data.title)
        .eq("latitude", data.latitude)
        .eq("longitude", data.longitude)
        .gte("created_at", cutoff)
        .limit(1)
        .execute()
    )
    return Report(**response.data[0]) if response.data else None

def list_reports(include_pending: bool = False) -> list[Report]:
    query = get_client().table("reports").select("*")
    if not include_pending:
        query = query.neq("status", "Pending Review")
    response = query.order("created_at", desc=True).execute()
    return [Report(**row) for row in response.data]

def insert_report(data: ReportCreate) -> Report:
    response = get_client().table("reports").insert(data.model_dump()).execute()
    return Report(**response.data[0])
