---
name: ditz-tdd
description: Use when adding tests or fixing bugs test-first.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [testing, tdd, coverage]
    related_skills: [test-driven-development, ditz-bugfix]
---

# ditz-tdd - Test yang Beneran Ngejaga

## When to Use
- Nambah fitur baru yang punya logika.
- Fix bug (test dulu, wajib).
- Ngeluhin "test suite nggak nangkep apa-apa".

## Siklus

```
RED: tulis test yang gagal karena fitur belum ada
GREEN: kode paling minimal yang bikin lulus
REFACTOR: rapihin, test tetap hijau
```

Jalankan test setelah RED (harus gagal, dan gagal karena alasan yang benar) dan setelah GREEN. Kalau test langsung lulus sebelum kode ditulis - test-nya nggak nguji apa-apa, benerin dulu.

## Apa yang dites

| Level | Test | Jangan |
|---|---|---|
| Unit | logika murni, edge case, error path | mock semua dependency sampai nggak nguji apa-apa |
| Integrasi | handler + DB asli (sqlite/testcontainer/temp schema) | DB produksi |
| E2E | 1-3 jalur penting (login, checkout) | semua kombinasi UI |

Prioritas kasus: happy path → batas (0, 1, maks, kosong) → error (timeout, 4xx/5xx, input invalid) → konkurensi kalau ada state bareng.

## Aturan test

1. **Satu test satu perilaku.** Nama = perilaku: `rejects_expired_token`, bukan `test_auth_2`.
2. **Deterministik.** Nggak ada `sleep` buat nunggu; pakai fake timer/await event. Nggak ada test yang bergantung urutan.
3. **Isolasi.** Tiap test bersih-bersih state sendiri (transaction rollback / fresh fixture).
4. **Test harus bisa gagal.** Assertion konkret (`expect(x).toBe(3)`), bukan `toBeTruthy()` buat nilai yang seharusnya persis.
5. **Mock di boundary aja.** HTTP keluar, waktu, random, filesystem. Jangan mock modul internal yang lagi diuji.
6. **Snapshot cuma buat output stabil** (HTML statis), jangan buat logika.
7. **Jangan test implementasi.** Test perilaku yang dilihat pemanggil; test yang ngecek private method bikin refactor susah.

## Bug = test dulu

1. Tulis test yang mereproduksi bug (gagal, dan gagalnya memang bug itu).
2. Fix.
3. Test lulus + seluruh suite lulus.
4. Commit test bareng fix.

## Verifikasi yang dikutip ke user

```
npm test  →  Tests: 42 passed, 42 total
pytest -q →  18 passed in 1.2s
go test ./... → ok
```

Kalau ada test yang di-skip, sebutin. Kalau coverage diukur, sebutin angka nyata, bukan "udah cukup".
