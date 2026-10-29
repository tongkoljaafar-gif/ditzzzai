---
name: ditz-backend
description: Use when building APIs, services, or server-side logic.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [backend, api, auth, validation]
    related_skills: [ditz-api, ditz-db, ditz-review]
---

# ditz-backend - Service yang Nggak Jatuh di Produksi

## When to Use
- Nambah route/controller/service/repository.
- Ngubah auth, transaksi, integrasi pihak ketiga.
- Bikin worker/queue/job.

## Struktur (yang berlaku di 90% kasus)

```
route/handler   → HTTP: parse, validasi bentuk, panggil service, bentuk response
service         → aturan bisnis, transaksi, orkestrasi
repo/data       → akses DB, query, mapping
```

Handler nggak boleh isi logika bisnis. Service nggak boleh tahu soal `req`/`res`. Repo nggak boleh ngebentuk response HTTP. Kalau repo udah punya pola lain, ikut repo.

## Aturan wajib

1. **Validasi di boundary.** Schema validation (zod/pydantic/Joi) di handler. Tipe hasil parse yang dipakai ke bawah - jangan re-parse.
2. **Auth ≠ otorisasi.** Cek "siapa" DAN "boleh akses objek ini" (IDOR: `WHERE id = ? AND owner_id = ?`).
3. **Error konsisten.** Satu bentuk error body: `{error: {code, message, details?}}`. Jangan bocorin stack/SQL ke client. Log internal dengan request id.
4. **Status code bener.** 201 create, 204 no content, 400 validasi, 401 belum login, 403 nggak boleh, 404 nggak ada, 409 konflik, 422 semantik, 429 rate limit.
5. **Idempotensi.** POST yang bisa dobel (payment, webhook) → idempotency key atau unique constraint.
6. **Timeout di semua panggilan keluar.** DB, HTTP, queue. Tanpa timeout = thread/pool ngabisin.
7. **Retry dengan backoff + jitter**, cuma buat operasi idempoten. Retry non-idempoten bikin duplikat.
8. **Transaksi buat multi-tulis.** Perubahan yang harus konsisten bareng → satu transaksi, dengan isolation level yang disadari.
9. **Konfigurasi dari env**, divalidasi saat startup (fail fast kalau `DATABASE_URL` kosong). Nggak ada secret hardcoded.
10. **Observability:** log terstruktur (JSON), request id, durasi, level benar. Metric buat endpoint kunci, error tidak bocor ke user.

## Integrasi pihak ketiga

- Bungkus dalam adapter tipis. Kalau SDK berubah, satu file yang disentuh.
- Simpan raw response kalau dipakai buat audit/debug.
- Webhook: verifikasi signature, proses idempoten, balas cepat (<5s) dan kerja beratnya async.
- Rate limit + circuit breaker buat dependency yang bisa mati.

## Verifikasi
Minimal: `curl -i` tiap endpoint baru (happy + 1 error), test handler, dan cek log nggak ada stack trace bocor.
