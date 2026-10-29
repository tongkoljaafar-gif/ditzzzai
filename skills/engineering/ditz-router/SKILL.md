---
name: ditz-router
description: Use to pick which ditz-* engineering skill fits the task.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [router, index, ditz]
    related_skills: [ditz-mission, ditz-code, ditz-review, ditz-bugfix]
---

# ditz-router - Pilih Skill yang Tepat

Semua skill `ditz-*` itu padat (2-4KB). Load `ditz-mission` dulu, lalu 1-2 dari tabel ini. Jangan load semuanya - itu boros token dan nggak nambah pemahaman.

## When to Use
- Bingung skill mana yang relevan buat tugas sekarang.

## Tabel routing

| Situasi | Skill |
|---|---|
| Mulai tugas koding apapun | `ditz-mission` (gerbang wajib) |
| Desain halaman / arah visual | `ditz-design` |
| Reference desain (palet, gaya, font, chart) | `ditz-design` bab 7 |
| Implementasi UI / komponen | `ditz-frontend` |
| State loading/empty/error, kontrol | `ditz-ui-state` |
| Mau kirim UI, cek dulu | `ditz-design-check` |
| Mau bilang "beres" | `ditz-nomistake` |
| Tugas panjang lintas sesi, butuh bukti | `ditz-ledger` |
| Nulis/ngubah kode | `ditz-code` |
| Review diff / PR / audit | `ditz-review` |
| Error, test merah, build rusak | `ditz-bugfix` |
| UI, komponen, desain | `ditz-frontend` |
| Route, service, worker, auth logic | `ditz-backend` |
| Schema, query lambat, migrasi | `ditz-db` |
| Nulis test / TDD | `ditz-tdd` |
| Mau deploy / rilis | `ditz-ship` |
| Coding pipeline, Docker, monitoring | `ditz-ops` |
| Lambat, bundle besar, leak memori | `ditz-perf` |
| Auth, secret, input user, audit keamanan | `ditz-secure` |
| Desain struktur / refactor besar | `ditz-arch` |
| Desain/review endpoint API | `ditz-api` |
| Paham repo asing | `ditz-map` |

## Rujukan dalam (load kalau butuh detail)

`clean-code`, `refactoring`, `refactoring-guru`, `code-complete`, `a-philosophy-of-software-design`, `the-pragmatic-programmer`, `clean-architecture`, `domain-driven-design` (+ distilled, implementing), `patterns-of-enterprise-application-architecture`, `designing-data-intensive-applications`, `working-effectively-with-legacy-code`, `release-it`, `systematic-debugging`, `test-driven-development`, `requesting-code-review`, `simplify-code`.

Masing-masing bawa `references/*.nano.md` (ringkas) dan `.mini.md` (lengkap). Default: baca `.nano.md` dulu.

## Aturan hemat
1. `ditz-mission` + maksimal 2 skill domain. Lebih dari itu = overthinking.
2. Rujukan buku cuma kalau skill padat kurang detail.
3. Nggak perlu ngulang isi skill ke user; pakai aja.
