#!/usr/bin/env python3
"""Fail when local HTML references point to missing website files."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
ATTRS = {"a": "href", "img": "src", "script": "src", "link": "href", "source": "src", "video": "poster"}


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        wanted = ATTRS.get(tag)
        if not wanted:
            return
        values = dict(attrs)
        if values.get(wanted):
            self.references.append(values[wanted])


def resolve_reference(page: Path, value: str):
    parsed = urlparse(value)
    if parsed.scheme or parsed.netloc or value.startswith(("#", "mailto:", "tel:", "data:", "javascript:")):
        return None
    clean = unquote(parsed.path)
    if not clean:
        return None
    target = ROOT / clean.lstrip("/") if clean.startswith("/") else page.parent / clean
    target = target.resolve()
    if target.is_dir():
        target = target / "index.html"
    return target


def main():
    errors = []
    html_files = list(ROOT.glob("*.html"))
    for page in html_files:
        parser = ReferenceParser()
        parser.feed(page.read_text(encoding="utf-8"))
        for reference in parser.references:
            target = resolve_reference(page, reference)
            if target and not target.exists():
                errors.append(f"{page.name} -> {reference}")

    for name in ["index.html", "robots.txt", "sitemap.xml", "netlify.toml"]:
        if not (ROOT / name).exists():
            errors.append(f"Missing required file: {name}")

    if errors:
        print("Website checks failed:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)

    print(f"Website checks passed: {len(html_files)} HTML pages inspected.")


if __name__ == "__main__":
    main()
