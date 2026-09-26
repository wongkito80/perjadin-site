#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
import re, sys

FILES={"id":Path("index.html"),"en":Path("en.html")}

def read(p): return p.read_text(encoding="utf-8")

def count(html, pattern):
    return len(re.findall(pattern, html, flags=re.I))

def hrefs(html):
    # Compare only actual anchor destinations. Canonical, favicon, stylesheet,
    # and language-specific head links are intentionally different between pages.
    return sorted(set(re.findall(r'<a\b[^>]*\bhref="(https?://[^"]+)"', html, flags=re.I)))

def section_ids(html):
    return re.findall(r'<section[^>]+id="([^"]+)"', html, flags=re.I)

def modal_ids(html):
    return re.findall(r'<div class="modal-overlay" id="([^"]+)"', html)

def stages(html):
    return re.findall(r'<span class="ecosystem-card-stage">([^<]+)</span>', html)

def status_count(html):
    # Status badges carry modifier classes, e.g.
    # class="ecosystem-card-status status-active".
    return count(html, r'class="ecosystem-card-status(?:\s+[^"]*)?"')

def main():
    data={k:read(v) for k,v in FILES.items()}
    checks=[]

    for pattern,label in [
        (r'class="regulasi-item"',"regulation cards"),
        (r'class="faq-item',"FAQ items"),
        (r'class="modal-overlay"',"modals"),
        (r'class="ecosystem-card-stage"',"ecosystem cards"),
        (r'class="digital-history-card',"digital-history cards"),
    ]:
        a,b=count(data["id"],pattern),count(data["en"],pattern)
        checks.append((a==b,f"{label}: ID={a}, EN={b}"))

    checks.append((section_ids(data["id"])==section_ids(data["en"]),
                   f"section IDs: {section_ids(data['id'])} vs {section_ids(data['en'])}"))
    checks.append((modal_ids(data["id"])==modal_ids(data["en"]),
                   f"modal IDs: ID={len(modal_ids(data['id']))}, EN={len(modal_ids(data['en']))}"))
    id_links, en_links = hrefs(data["id"]), hrefs(data["en"])
    checks.append((id_links==en_links,
                   f"external anchor link sets match: ID={len(id_links)}, EN={len(en_links)}"))
    checks.append((status_count(data["id"])==6 and status_count(data["en"])==6,
                   f"ecosystem statuses: ID={status_count(data['id'])}, EN={status_count(data['en'])}"))
    checks.append((count(data["id"],r'\sonclick=')==0 and count(data["en"],r'\sonclick=')==0,
                   "no inline onclick handlers"))
    checks.append((count(data["id"],r'\sonkeydown=')==0 and count(data["en"],r'\sonkeydown=')==0,
                   "no inline onkeydown handlers"))

    failed=[msg for ok,msg in checks if not ok]
    for ok,msg in checks:
        print(("[OK] " if ok else "[FAIL] ")+msg)
    if failed:
        print(f"\n{len(failed)} parity check(s) failed.")
        sys.exit(1)
    print("\nBilingual structural parity checks passed.")

if __name__=="__main__":
    main()
