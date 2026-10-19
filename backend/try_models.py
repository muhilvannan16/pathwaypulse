from pydantic import ValidationError

from app.models import ReportCreate   # use app.model if you didn't rename it

good = dict(
    title="Cracked sidewalk",
    description="Large crack near the corner.",
    category="damaged_path",
    latitude=42.658,
    longitude=-83.15,
)


def try_it(label, **changes):
    print(f"\n=== {label}")
    try:
        report = ReportCreate(**{**good, **changes})
        print("OK:", report)
    except ValidationError as e:
        print("REJECTED:")
        print(e)


try_it("valid")
try_it("title too short", title="Hi")
try_it("bad category", category="potholes")
try_it("latitude out of range", latitude=200)
try_it("extra status field", status="Resolved")
try_it("blank title", title="      ")     # <-- NEW LINE goes here, at the bottom