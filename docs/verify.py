#!/usr/bin/env python3
"""Cek isi repo skill: frontmatter, nama folder, panjang deskripsi, link, karakter terlarang.

Jalanin dari akar repo: python3 docs/verify.py
Exit 0 kalau bersih, exit 1 kalau ada yang gagal.
"""
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAX_DESC = 60
errors = []


def check_frontmatter(path):
    text = open(path, encoding="utf-8").read()
    if not text.startswith("---\n"):
        errors.append(f"{path}: tidak diawali frontmatter")
        return
    try:
        fm = text.split("---")[1]
    except IndexError:
        errors.append(f"{path}: frontmatter tidak ditutup")
        return
    name = re.search(r"^name:\s*(\S+)\s*$", fm, re.M)
    desc = re.search(r"^description:\s*(.+?)\s*$", fm, re.M)
    if not name:
        errors.append(f"{path}: tidak ada name")
    elif name.group(1) != os.path.basename(os.path.dirname(path)):
        errors.append(f"{path}: name '{name.group(1)}' beda dengan nama folder")
    if not desc:
        errors.append(f"{path}: tidak ada description")
    elif len(desc.group(1).strip().strip('"')) > MAX_DESC:
        errors.append(f"{path}: description {len(desc.group(1))} karakter, batas {MAX_DESC}")


def check_links_and_chars():
    for path in glob.glob(os.path.join(ROOT, "**", "*.md"), recursive=True):
        text = open(path, encoding="utf-8").read()
        if "\u2014" in text or "\u2013" in text:
            errors.append(f"{path}: ada em-dash atau en-dash")
        for target in re.findall(r"\]\(([^)#]+\.md)\)", text):
            full = os.path.normpath(os.path.join(os.path.dirname(path), target))
            if not os.path.isfile(full):
                errors.append(f"{path}: link rusak -> {target}")


def main():
    skills = glob.glob(os.path.join(ROOT, "skills", "*", "*", "SKILL.md"))
    if not skills:
        print("tidak ada skill ditemukan")
        return 1
    for path in skills:
        check_frontmatter(path)
    check_links_and_chars()
    if errors:
        print(f"GAGAL: {len(errors)} masalah")
        for e in errors:
            print(" -", e)
        return 1
    print(f"OK: {len(skills)} skill lolos semua cek")
    return 0


if __name__ == "__main__":
    sys.exit(main())
