#!/usr/bin/env python3
"""
Build Taj Al Sukn approval deck v1.

Pipeline:
1. Render the feedback-template.html into a feedback PDF per page (Chrome).
2. Merge each page PDF + its feedback PDF using pypdf.
3. Build a combined master deck (cover + per-page sections).

Run from /Users/surender/Downloads/Taj Al Sukn/website/approvals/
"""
import os
import subprocess
import shutil
import datetime
from pathlib import Path

import pypdf

ROOT = Path(__file__).parent.resolve()
V1   = ROOT / "v1"
PAGES_DIR    = V1 / "pages"
FEEDBACK_DIR = V1 / "feedback"
FINAL_DIR    = V1 / "final"
FEEDBACK_DIR.mkdir(parents=True, exist_ok=True)
FINAL_DIR.mkdir(parents=True, exist_ok=True)

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TEMPLATE = (ROOT / "feedback-template.html").read_text(encoding="utf-8")

# slug, human title, section
PAGES = [
    ("index",                "Home Page",                 "Public Website"),
    ("about",                "About Page",                "Public Website"),
    ("services",             "Services Menu",             "Public Website"),
    ("gallery",              "Gallery",                   "Public Website"),
    ("membership",           "Membership",                "Public Website"),
    ("contact",              "Contact",                   "Public Website"),
    ("booking",              "Online Booking",            "Public Website"),
    ("admin-overview",       "Admin · Overview",          "Admin Console"),
    ("admin-bookings",       "Admin · Bookings",          "Admin Console"),
    ("admin-members",        "Admin · Members",           "Admin Console"),
    ("admin-calendar",       "Admin · Calendar",          "Admin Console"),
    ("admin-reports",        "Admin · Reports",           "Admin Console"),
    ("admin-settings",       "Admin · Settings",          "Admin Console"),
    ("admin-new-booking",    "Admin · New Booking",       "Admin Console"),
    ("admin-new-member",     "Admin · New Member",        "Admin Console"),
    ("admin-booking-detail", "Admin · Booking Detail",    "Admin Console"),
    ("admin-member-detail",  "Admin · Member Detail",     "Admin Console"),
    ("admin-invoice",        "Admin · Invoice / Receipt", "Admin Console"),
]

VERSION = "Version 1.0"
TODAY   = datetime.date.today().strftime("%d %B %Y")


def render_feedback_pdf(slug: str, title: str):
    """Render the feedback-template.html with placeholders replaced."""
    html = (TEMPLATE
            .replace("{{PAGE_TITLE}}", title)
            .replace("{{VERSION}}", VERSION)
            .replace("{{DATE}}", TODAY))
    tmp_html = FEEDBACK_DIR / f"{slug}.html"
    tmp_pdf  = FEEDBACK_DIR / f"{slug}.pdf"
    tmp_html.write_text(html, encoding="utf-8")
    subprocess.run([
        CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--no-pdf-header-footer",
        "--virtual-time-budget=4000",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={tmp_pdf}",
        f"file://{tmp_html}"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return tmp_pdf


def merge_page_and_feedback(slug: str, page_pdf: Path, fb_pdf: Path) -> Path:
    """Concatenate page PDF + feedback PDF -> final/<slug>.pdf"""
    out = FINAL_DIR / f"{slug}.pdf"
    writer = pypdf.PdfWriter()
    for src in (page_pdf, fb_pdf):
        if not src.exists():
            print(f"  ! missing {src.name}, skipping")
            continue
        try:
            r = pypdf.PdfReader(str(src))
            for p in r.pages:
                writer.add_page(p)
        except Exception as e:
            print(f"  ! error reading {src.name}: {e}")
    with open(out, "wb") as fh:
        writer.write(fh)
    return out


def build_combined_deck():
    """Build one combined deck of every page + its feedback, in order."""
    out = V1 / "Taj-Al-Sukn-Approval-Deck-v1.pdf"
    writer = pypdf.PdfWriter()
    for slug, title, section in PAGES:
        final = FINAL_DIR / f"{slug}.pdf"
        if not final.exists():
            print(f"  ! skipping {slug}, no final PDF")
            continue
        r = pypdf.PdfReader(str(final))
        start_page = len(writer.pages)
        for p in r.pages:
            writer.add_page(p)
        # Bookmark at the first page of each section
        try:
            writer.add_outline_item(title, start_page)
        except Exception:
            pass
    with open(out, "wb") as fh:
        writer.write(fh)
    return out


def main():
    print(f"Building approval deck {VERSION} for {TODAY}")
    print(f"Pages root: {PAGES_DIR}")
    print(f"Feedback:   {FEEDBACK_DIR}")
    print(f"Final:      {FINAL_DIR}")

    for slug, title, _section in PAGES:
        page_pdf = PAGES_DIR / f"{slug}.pdf"
        if not page_pdf.exists():
            print(f"  ! {slug}: page PDF missing — skipping")
            continue
        print(f"-> {slug}: rendering feedback…")
        fb_pdf = render_feedback_pdf(slug, title)
        print(f"   merging…")
        merge_page_and_feedback(slug, page_pdf, fb_pdf)

    print("Building combined master deck…")
    combined = build_combined_deck()
    print(f"Done. Combined deck: {combined}")
    print(f"Size: {combined.stat().st_size / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
