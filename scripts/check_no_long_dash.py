#!/usr/bin/env python3
"""Fail CI when committed text contains long dash punctuation or HTML entities."""
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
BAD_GLYPHS = (chr(0x2013), chr(0x2014), chr(0x2015))
BAD_ENTITIES = re.compile(r"&(?:mdash|ndash);|&#(?:8211|8212);|&#x(?:2013|2014);", re.I)


def main():
    paths = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).split(b"\0")
    errors = []
    inspected = 0
    for raw_path in paths:
        if not raw_path:
            continue
        relative = raw_path.decode("utf-8", errors="surrogateescape")
        path = ROOT / relative
        if not path.is_file():
            continue
        data = path.read_bytes()
        if b"\0" in data:
            continue
        try:
            content = data.decode("utf-8")
        except UnicodeDecodeError:
            continue  # binary assets or non-UTF-8 imports
        inspected += 1
        for line_no, line in enumerate(content.splitlines(), 1):
            if any(ch in line for ch in BAD_GLYPHS) or BAD_ENTITIES.search(line):
                errors.append(f"{relative}:{line_no}")
    if errors:
        print("Long dash punctuation is not permitted in ACF content or source text.")
        print("Replace with a normal hyphen, comma, colon, semicolon or full stop.")
        print("\n".join(errors[:120]))
        if len(errors) > 120:
            print(f"... plus {len(errors) - 120} additional lines")
        return 1
    print(f"Copy punctuation check passed: {inspected} UTF-8 text files inspected.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
