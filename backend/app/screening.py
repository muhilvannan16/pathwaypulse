import re

EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE = re.compile(r"(?<!\d)(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)")
LINK = re.compile(r"https?://|www\.", re.IGNORECASE)
REPEATS = re.compile(r"(.)\1{5,}")          # the same character six or more times in a row


def screen_report(title: str, description: str) -> list[str]:
    text = f"{title} {description}"
    flags: list[str] = []
    if EMAIL.search(text):
        flags.append("Contains an email address")
    if PHONE.search(text):
        flags.append("Contains a phone number")
    if LINK.search(text):
        flags.append("Contains a link")
    if REPEATS.search(text):
        flags.append("Has repeated characters")
    letters = [c for c in text if c.isalpha()]
    if len(letters) >= 20 and sum(c.isupper() for c in letters) / len(letters) > 0.7:
        flags.append("Mostly capital letters")
    return flags