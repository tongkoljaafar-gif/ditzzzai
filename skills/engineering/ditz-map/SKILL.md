---
name: ditz-map
description: Use when you need to understand an unfamiliar codebase fast.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [codebase, onboarding, architecture-map]
    related_skills: [codebase-inspection, ditz-arch]
---

# ditz-map - Peta Codebase Asing

## When to Use
- Masuk repo baru, harus ngubah sesuatu.
- User nanya "ini repo apa, jalan dari mana?".
- Repo besar dan kamu bingung mulai dari mana.

## Proses (cepat, hemat token)

**1. Fakta permukaan (tanpa baca isi file)**
```bash
ls -la; cat README.md 2>/dev/null | head -60
cat package.json pyproject.toml go.mod Cargo.toml 2>/dev/null | head -60
find . -maxdepth 2 -name "*.json" -o -maxdepth 2 -name "*.toml" -o -maxdepth 2 -name "*.yaml" | grep -v node_modules | head -20
git log --oneline -10
```
Catat: bahasa, framework, package manager, entry point, cara jalan (`npm run dev` / `uvicorn ...` / `go run .`), test runner.

**2. Struktur**
```bash
find . -type d -name node_modules -prune -o -type d -name .git -prune -o -type d -print | head -40
find . -name "*" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l
```

**3. Entry point → jalur utama**
Ikuti satu alur dari pintu masuk: route/handler → service → data. Itu ngasih 80% pemahaman.

**4. Bikin peta (simpel, tanpa diagram kalau nggak perlu)**
```
Stack: <framework + db + deploy>
Jalan: <command>
Test: <command>
Pintu masuk: <file>
Alur utama: <route> → <service> → <table>
Config: <env var yang wajib>
Hotspot: <file yang paling sering berubah: git log --format= --name-only | sort | uniq -c | sort -rn | head>
```

**5. Simpan** di `.ditz-map.md` di root repo kalau user bakal sering balik ke sini. Kalau sekali pakai, cukup lapor di chat.

## Jangan
- Baca semua file "biar paham" - itu boros dan nggak perlu.
- Tebak arsitektur dari nama folder doang; verifikasi di satu alur nyata.
- Nulis dokumen panjang; peta 15 baris lebih berguna dari 3 halaman.
