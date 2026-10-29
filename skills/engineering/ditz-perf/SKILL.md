---
name: ditz-perf
description: Use when something is slow or bundles are too big.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [performance, profiling, bundle]
    related_skills: [ditz-db, ditz-frontend, ditz-backend]
---

# ditz-perf - Ukur Dulu, Baru Optimasi

## When to Use
- Endpoint/dashboard lambat, p99 lewat target.
- Memori naik terus (curiga leak).
- Bundle JS membengkak setelah nambah dependency.

## Hukum

```
NGGAK ADA OPTIMASI TANPA BASELINE ANGKA. UKUR → TEMUKAN → FIX → UKUR LAGI.
```

Catat sebelum: p50/p95/p99, RPS, error rate, memori. Sesudah fix, angka yang sama diukur ulang. Kalau nggak ada baseline, otomasi ukurnya dulu.

## Cari bottleneck

| Gejala | Alat |
|---|---|
| Endpoint lambat | log durasi per layer (handler/service/query), `curl -w "%{time_total}"`, autocannon/k6 |
| Curiga query | `EXPLAIN (ANALYZE, BUFFERS)`, slow query log, cek N+1 (hitung query per request) |
| CPU tinggi | Node: `node --cpu-prof` → flamegraph; Python: `py-spy record`; Go: `pprof` |
| Memori naik | Node: heap snapshot lalu bandingkan 2 snapshot, `--max-old-space-size`; Python: `tracemalloc`; Go: `pprof heap` |
| Bundle besar | `next build` analyzer / `webpack-bundle-analyzer` / `source-map-explorer` - liat modul terbesar |
| Frontend lambat | Lighthouse, Performance panel: LCP/INP/CLS |

## Optimasi berdasarkan tipe

**Query DB:** index sesuai pola akses, buang `SELECT *`, batch cara `IN`, keyset pagination, cache hasil yang mahal dengan TTL jelas.

**Backend:** pindahkan kerja berat ke background/queue, paralelkan IO independen, batasi payload, tambah cache di depan jalur panas (dan tau invalidasi-nya).

**Frontend:** code splitting per route, dynamic import komponen berat, jangan render ribuan DOM (virtualisasi), memo hanya setelah diukur (React.memo asal-asalan malah nambah cost), pindahkan data fetching ke server kalau bisa.

**Infra:** connection pool sized sesuai DB (bukan 100 default), worker sesuai CPU, timeout supaya nggak numpuk.

## Jangan

- Cache sebelum tau query mahal yang mana.
- Optimasi kode yang cuma jalan sekali.
- Ganti arsitektur sebelum ada angka yang nunjukin bottleneck-nya di mana.
- Klaim "lebih cepat" tanpa sebelum/sesudah.
