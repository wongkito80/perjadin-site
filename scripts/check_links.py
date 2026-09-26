#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
from urllib import request, error
from urllib.parse import urlparse
import sys, time

FILES = [Path("index.html"), Path("en.html")]
SKIP_HOSTS = {
    "perjadin.dpr.go.id",
    "digitall.dpr.go.id",
}
SOFT_CODES = {401, 403, 429}
BROKEN_CODES = {404, 410}

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = set()
    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        href = dict(attrs).get("href", "")
        if href.startswith(("http://", "https://")):
            self.links.add(href)

def collect_links():
    links=set()
    for path in FILES:
        parser=LinkParser()
        parser.feed(path.read_text(encoding="utf-8"))
        links |= parser.links
    return sorted(links)

def check(url):
    host=urlparse(url).hostname or ""
    if host in SKIP_HOSTS:
        return "SKIP", "internal/authenticated endpoint"

    headers={"User-Agent":"Mozilla/5.0 (compatible; perjadin-link-check/1.1)"}

    # HEAD is only a fast hint. Some government/public servers reject HEAD
    # even when the same URL works normally in a browser, so never mark a
    # link broken from HEAD alone.
    try:
        req=request.Request(url, headers=headers, method="HEAD")
        with request.urlopen(req, timeout=20) as r:
            code=getattr(r,"status",200)
            if code < 400:
                return "OK", str(code)
    except Exception:
        pass

    # Confirm status with GET before declaring 404/410 as genuinely broken.
    req=request.Request(url, headers=headers, method="GET")
    try:
        with request.urlopen(req, timeout=25) as r:
            code=getattr(r,"status",200)
            return ("OK", str(code)) if code < 400 else ("WARN", str(code))
    except error.HTTPError as e:
        if e.code in BROKEN_CODES:
            return "BROKEN", str(e.code)
        if e.code in SOFT_CODES or e.code >= 500:
            return "WARN", str(e.code)
        return "WARN", str(e.code)
    except Exception as e:
        return "WARN", type(e).__name__

def main():
    broken=[]
    links=collect_links()
    print(f"Checking {len(links)} unique external links")
    for url in links:
        status,detail=check(url)
        print(f"[{status:6}] {detail:>18}  {url}")
        if status=="BROKEN":
            broken.append(url)
    print(f"\nSummary: {len(links)} checked, {len(broken)} confirmed broken.")
    if broken:
        sys.exit(1)

if __name__=="__main__":
    main()
