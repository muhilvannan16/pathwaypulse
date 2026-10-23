import os

from dotenv import load_dotenv
from supabase import Client, create_client

from app.models import Report, ReportCreate

load_dotenv()  # reads backend/.env into environment variables

_client: Client | None = None


def get_client() -> Client:
    """Create the Supabase client once, then reuse it."""
    global _client
    if _client is None:
        _client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])   # the two .env names
    return _client


def list_reports(include_pending: bool = False) -> list[Report]:
    query = get_client().table("reports").select("*")
    if not include_pending:
        query = query.neq("status", "Pending Review")
    response = query.order("created_at", desc=True).execute()
    return [Report(**row) for row in response.data]

def insert_report(data: ReportCreate) -> Report:
    response = get_client().table("reports").insert(data.model_dump()).execute()
    return Report(**response.data[0])
