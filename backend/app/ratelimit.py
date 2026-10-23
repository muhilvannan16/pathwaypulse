# backend/app/ratelimit.py

MAX_REQUESTS = 5            
WINDOW_SECONDS = 3600

# client_id -> list of timestamps of that client's recent allowed requests
_recent: dict[str, list[float]] = {}


def is_allowed(client_id: str, now: float) -> bool:
    # 1. Get this client's list (an empty list if we've never seen them).
    timestamps = _recent.setdefault(client_id, [])

    # 2. Keep only timestamps that are still inside the window.
    timestamps[:] = [t for t in timestamps if now - t < WINDOW_SECONDS]

    # 3. If they've already used up their allowance, reject.
    if len(timestamps) >= MAX_REQUESTS:
        return False

    # 4. Otherwise record this request and allow it.
    timestamps.append(now)
    return True