"""Build the public review feed from GitHub issues. Never execute issue content."""
import json
import os
import re
import unicodedata
from pathlib import Path
from urllib.request import Request, urlopen

def normalize(value):
    return unicodedata.normalize("NFKC", value).casefold()

def clean(value):
    return not any(unicodedata.category(c) in ("Cc", "Cf") for c in value if c not in "\n\t")

# Conservative baseline: threats, common slurs, links, and contact details.
DEFAULT = [
    r"\b(?:kill yourself|go die|kys|i will kill you|i'll kill you|i will hurt you|doxx? you)\b",
    r"\b(?:nigg(?:er|a)s?|fagg?ots?|trann(?:y|ies)|kikes?)\b",
    r"(?:https?://|www\.|discord\.gg/|t\.me/)",
    r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
    r"(?<!\d)(?:\+?1[ .-]?)?(?:\(\d{3}\)|\d{3})[ .-]?\d{3}[ .-]?\d{4}(?!\d)",
]
custom = [normalize(x.strip()) for x in os.environ.get("REVIEW_BLOCKLIST", "").splitlines() if x.strip()]
words = [x for x in custom if not x.startswith("user:")]
users = {x[5:].strip().lstrip("@") for x in custom if x.startswith("user:")}
patterns = [re.compile(x, re.I) for x in DEFAULT]
def blocked(name, body, login):
    combined = normalize(name + "\n" + body)
    return (normalize(login) in users
            or any(w in combined for w in words)
            or any(p.search(combined) for p in patterns)
            or not clean(combined))

def parse(issue):
    if "pull_request" in issue or not issue.get("title", "").startswith("Portfolio review: "):
        return None
    if any(x.get("name", "").casefold() in {"review-blocked", "rejected", "spam"} for x in issue.get("labels", [])):
        return None
    raw = (issue.get("body") or "").replace("\r\n", "\n").strip()
    match = re.fullmatch(r"Rating: ([1-5])/5\nDisplay name: ([^\n]+)\n\n(.+)\n\nSubmitted for owner approval\. I understand this GitHub issue is public\.", raw, re.S)
    if not match:
        return None
    rating, name, body = match.groups()
    name, body = name.strip(), body.strip()
    login = (issue.get("user") or {}).get("login", "")
    if not login or not 1 <= len(name) <= 40 or not 10 <= len(body) <= 600 or blocked(name, body, login):
        return None
    return {"name": name, "rating": int(rating), "text": body}

def main():
    repo = os.environ["GITHUB_REPOSITORY"]
    token = os.environ["GH_TOKEN"]
    rows, seen = [], set()
    # One published review per GitHub account, newest eligible submission first.
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/issues?state=all&sort=created&direction=desc&per_page=100&page={page}"
        req = Request(url, headers={"Authorization": "Bearer " + token, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "portfolio-review-filter"})
        with urlopen(req, timeout=30) as response:
            issues = json.load(response)
        if not isinstance(issues, list):
            raise ValueError("Unexpected issue response")
        for issue in issues:
            review = parse(issue)
            login = normalize((issue.get("user") or {}).get("login", ""))
            if review and login not in seen:
                rows.append(review)
                seen.add(login)
        if len(issues) < 100:
            break
        page += 1
    path = Path("_site/assets/approved-reviews.json")
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Published {len(rows)} filtered reviews.")

if __name__ == "__main__":
    main()
