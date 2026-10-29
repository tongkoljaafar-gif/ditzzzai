---
name: ditz-review
description: Use when reviewing a diff or PR before merge or delivery.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [code-review, security, quality]
    related_skills: [ditz-code, ditz-ship, requesting-code-review]
---

# ditz-review - Review Diff / PR

## When to Use
- Sebelum commit/merge/ngasih hasil ke user.
- User minta "review", "cek PR", "audit kode".
- Habis agent/kamu nulis kode dan mau pass kedua.

## Urutan review (kerjain dari atas, jangan lompat)

**0. Konteks:** apa masalah yang diselesaikan? Apa file yang berubah dan kenapa? Ada test? Diff dulu: `git diff --stat` → `git diff`. Jangan review file yang nggak berubah.

**1. Kebenaran (blocker kalau gagal)**
- Logika sesuai requirement? Edge case: kosong, null, 0, negatif, besar, unicode, duplikat.
- Error path: apa yang terjadi kalau DB down, HTTP 500, timeout, input invalid?
- Async: ada race, await kelewat, promise nggak di-handle?
- State: mutasi di luar tempatnya, shared mutable state, stale cache?

**2. Keamanan (blocker kalau gagal)**
- [ ] Secret/API key/token nggak masuk kode/git
- [ ] Query parameterized - nggak ada string concat ke SQL/shell
- [ ] Auth ada di semua route privat; otorisasi per objek (IDOR) dicek, bukan cuma "udah login"
- [ ] Output di-encode (XSS); `dangerouslySetInnerHTML`/`innerHTML` beralasan
- [ ] CSRF buat cookie-based state change
- [ ] Input divalidasi di boundary + ukuran/limit (DoS)
- [ ] Upload: tipe, ukuran, path traversal (`../`)
- [ ] Dependency baru: masih dirawat, lisensi OK, nggak duplikat yang udah ada

**3. Data & migrasi**
- Migrasi nambah-kolom aman buat deploy zero-downtime (expand-contract)?
- Ada rollback plan? Index dibutuhin buat query baru?
- Nggak ada `ALTER`/`DROP` destruktif tanpa backup+konfirmasi.

**4. Kinerja**
- N+1 query? Loop manggil DB/HTTP?
- Payload besar tanpa pagination? Gambar/bundle tanpa batas ukuran?
- Kerja berat di request handler → pindah ke background/queue?

**5. Kualitas**
- Ikut `ditz-code`: nama, ukuran fungsi, error handling, nggak ada TODO/kode mati.
- Diff minimal? Nggak ada perubahan tak terkait, format massal, rename yang nggak diminta?

**6. Test**
- Ada test buat perilaku baru? Test-nya beneran gagal kalau fix dicabut?
- Jalankan sendiri: `npm test` / `pytest` / `go test ./...` - kutip hasilnya.

## Format laporan

```
VERDICT: BLOCK | FIX-THEN-SHIP | SHIP

BLOCKER
  [file:line] <masalah> - <dampak nyata> - <fix konkret>
HIGH
  [file:line] ...
NIT
  [file:line] ...

Cek dijalankan: <test/lint/build + hasil>
```

Aturan laporan:
- Tunjuk `file:line`. Tanpa lokasi = bukan temuan, cuma opini.
- Jelasin dampak, bukan cuma "ini jelek".
- Kasih fix konkret dalam 1-2 baris kode, bukan "pertimbangkan untuk memperbaiki".
- Nggak ada pujian pembuka. Mulai dari verdict.
- Kalau nggak ada blocker, bilang `SHIP` dan sebutin yang belum dites.

## Mode audit repo penuh
Kalau yang direview bukan diff tapi seluruh repo: mulai dari entry point → route/handler → service → data layer, catat hot path, baru cek 6 poin di atas per jalur. Batasi temuan ke yang bisa dibuktikan dari kode.
