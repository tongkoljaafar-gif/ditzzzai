---
name: ditz-ledger
description: Use when a long task must stay accountable and resumable.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [workflow, continuity, planning, evidence]
    related_skills: [ditz-mission, weekly-review-planning]
---

# ditz-ledger - Jaga Tugas Panjang Nggak Melenceng

Diambil dari pola "requirement ledger": satu target, tujuan yang nggak boleh drift, bukti bukan kesan. Ini versi ringkas yang muat di kepala.

## Kapan dipakai
- Tugas lebih dari ~10 langkah, atau lintas sesi.
- Ada beberapa requirement yang gampang "hilang" di tengah.
- User minta laporan progres yang bisa dipercaya.

## Struktur (tulis di `.ditz-ledger.md` di root repo)

```
TARGET: <satu objek konkret yang ditangani>
TUJUAN: <hasil akhir yang user minta, satu kalimat>
SELESAI KALAU: <test yang bisa diobservasi>
DI LUAR SCOPE: <yang sengaja nggak dikerjakan>

Untuk tiap item:
  [id] status: todo | doing | done | blocked
       bukti: <output nyata / path / angka test>
       catatan: <keputusan + alasan, bukan narasi>

KEPUTUSAN:
  <tanggal> <keputusan> karena <alasan>

BLOCKED:
  <item> - nunggu <apa/dari siapa>
```

## Aturan

1. **Satu target per ledger.** Kalau target ganti, ledger baru. Jangan campur dua proyek.
2. **`done` wajib punya bukti.** Tanpa output/angka/path = masih `doing`. Ini aturan paling penting, karena status tanpa bukti itu bohong yang rapi.
3. **Requirement lama jangan jadi fakta baru.** Kalau requirement berubah, catat sebagai keputusan baru dengan tanggal, jangan di-edit diam-diam.
4. **Bedakan tiga hal** saat lapor: fakta terverifikasi / kesimpulan beralasan / belum diketahui. Jangan campur.
5. **Satu next action per laporan.** Bukan daftar 8 saran.
6. **Resume:** baca ledger dulu, bukan transkrip lama. Transkrip itu bukti, bukan otoritas.
7. **Jangan ledger buat tugas 3 langkah.** Overhead > manfaat.

## Format laporan progres

```
Tujuan: <satu kalimat>
Progres: <x/y item, dasar: item berstatus done>
Aktif: <item yang lagi dikerjakan>
Blocker: <ada/nggak>
Bukti terakhir: <output nyata terakhir>
Next: <satu aksi>
Selesai kalau: <kriteria>
```

Progress dihitung dari item `done` yang ada buktinya. Nggak boleh dikira-kira, nggak boleh dibulatkan ke atas.
