---
name: ditz-db
description: Use when designing schemas, queries, or migrations.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [database, sql, migration, indexing]
    related_skills: [ditz-backend, designing-data-intensive-applications]
---

# ditz-db - Schema, Query, Migrasi

## When to Use
- Bikin tabel/schema baru atau ngubah yang ada.
- Query lambat, N+1, EXPLAIN jelek.
- Migrasi data / zero-downtime deploy.

## Schema

1. **Normalisasi dulu (3NF), denormalisasi dengan alasan terukur.** Duplikasi tanpa alasan = data jadi bohong.
2. **Primary key:** `id` immutable (bigint/UUID). Jangan pakai email/username sebagai PK.
3. **Foreign key + constraint di DB**, bukan cuma di aplikasi: `NOT NULL`, `UNIQUE`, `CHECK`, `ON DELETE` yang jelas.
4. **Tipe tepat:** uang `numeric(12,2)`/integer sen (bukan float), waktu `timestamptz` UTC, teks terbatas `varchar(n)` kalau ada batas nyata, enum kalau nilainya tertutup.
5. **Audit minimal:** `created_at`, `updated_at` (atau `deleted_at` kalau soft delete).
6. **Naming konsisten:** `snake_case`, plural tabel, `tabel_id` buat FK.

## Index

- Index buat kolom yang dipakai `WHERE`, `JOIN`, `ORDER BY` di query panas. Bukan semua kolom.
- Composite: kolom paling selektif / yang dipakai equality dulu, range terakhir. `(tenant_id, created_at DESC)` buat listing per tenant.
- Index punya biaya tulis: hapus yang redundan (`(a)` vs `(a,b)`).
- Partial index buat subset (`WHERE deleted_at IS NULL`).
- Verifikasi: `EXPLAIN (ANALYZE, BUFFERS)` - lihat Seq Scan vs Index Scan, jumlah baris aktual vs estimasi.

## Query

- Nggak ada `SELECT *` di kode aplikasi. Ambil kolom yang dipakai.
- Nggak ada query di dalam loop → `IN (...)` atau join / batch.
- Pagination: keyset (`WHERE id > $last LIMIT n`), bukan `OFFSET` besar.
- Query parameterized selalu. String concat = injeksi.
- N+1 di ORM: pakai eager load/include yang eksplisit, dan cek jumlah query di test.

## Migrasi

**Aturan emas: setiap migrasi harus bisa jalan di DB yang lagi hidup dan dipakai.**

Pola expand-contract:
1. Tambah kolom baru nullable + tulis ke dua tempat (dual write) / isi via backfill batch.
2. Deploy kode yang baca dari yang baru.
3. Hapus kolom lama di migrasi terpisah setelah kode lama hilang.

Jangan dalam satu deploy:
- Rename kolom langsung
- Ubah tipe yang butuh rewrite tabel besar (atau pakai `CHECK` + backfill)
- Tambah `NOT NULL` tanpa default ke tabel besar
- `DROP` apapun tanpa backup + konfirmasi eksplisit dari user

Setiap migrasi: ada rollback atau penjelasan kenapa nggak bisa di-rollback. Backfill dalam batch kecil dengan jeda, bukan satu `UPDATE` juta baris.

## Verifikasi
- Migrasi jalan di salinan/staging, bukan cuma di dev kosong.
- `EXPLAIN ANALYZE` query panas sebelum vs sesudah.
- Test yang nyentuh data lewat jalur baru lulus.
