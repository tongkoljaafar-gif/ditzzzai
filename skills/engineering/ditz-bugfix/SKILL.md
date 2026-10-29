---
name: ditz-bugfix
description: Use when something breaks - test, build, or runtime error.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [debugging, root-cause, triage]
    related_skills: [systematic-debugging, ditz-mission, ditz-code]
---

# ditz-bugfix - Stop, Reproduksi, Akar, Fix, Kunci

## When to Use
- Test gagal, build rusak, perilaku nggak sesuai, error di log.
- "Dulu jalan, sekarang nggak."
- Satu fitur/modul dirasa rusak total → pakai protokol 5 fase di bawah.

## Hukum

```
NGGAK ADA FIX SEBELUM BUG BISA DIREPRODUKSI DAN AKARNYA DIKETAHUI.
```

Kalau belum paham kenapa, perubahan apapun itu tebakan. Tebakan = utang.

## Protokol

**1. STOP.** Jangan nambah fitur, jangan "sekalian rapihin". Jangan push lewat test yang merah - error menumpuk dan ngerusak langkah berikutnya.

**2. Rekam bukti.** Error teks lengkap (bukan potongan), command persisnya, env (versi node/python, OS), langkah reproduksi. Simpen output ke file kalau panjang (`... 2>&1 | tee /tmp/err.log`).

**3. Reproduksi.** Cari cara paling kecil yang gagal konsisten. Kalau nggak bisa direproduksi, itu masalah informasi - jangan nebak fix, tambah logging/tracing dulu.

**4. Lokalisasi.** Persempit:
- Baca stack trace dari frame paling atas yang kode lu sendiri.
- `git log -5 -- <file>` dan `git diff` - apa yang berubah terakhir?
- Bisect manual: matikan separuh, cek, ulang.
- Cek asumsi: versi dependency (`npm ls x`, `pip show x`), env var kosong, file config kebaca, port bentrok, permission, path relatif vs absolut.
- Bahasa-spesifik: Python `python -X dev`, `pdb`/`breakpoint()`; Node `node --inspect`, `NODE_OPTIONS=--trace-warnings`.

**5. Satu hipotesis, satu test.** Tulis: "gue curiga X jadi penyebabnya karena Y". Uji dengan perubahan terkecil. Kalau hipotesis mati, catat dan bikin yang baru. Jangan pernah uji dua hipotesis sekaligus.

**6. Fix di akar, bukan gejala.** Kalau symptom yang dimatiin (try/catch yang nelan error, `setTimeout` nambah delay, retry buta), sebutin eksplisit sebagai tambalan dan alasannya.

**7. Kunci.** Tambah test yang gagal sebelum fix dan lulus sesudahnya. Kalau nggak bisa dites, tulis kenapa di laporan.

**8. Verifikasi.** Jalankan ulang test suite relevan + jalur yang tadi rusak. Kutip hasil nyata.

## Eskalasi: fix berturut-turut bikin masalah baru

Kalau 3+ fix malah munculin masalah baru di tempat lain → **bukan kumpulan bug, tapi masalah arsitektur.** Berhenti. Lapor:

```
3+ fix malah nimbrung masalah baru. Ini bau arsitektur, bukan bug lepas.
Temuan: <ringkas pola yang muncul, mis. shared state / coupling>
Opsi: (a) lanjut tambal (bakal nambah utang), (b) resiko restrukturisasi bagian X
```

## Jangan

- Ngubah 3 hal sekaligus lalu bingung mana yang benerin.
- "Fix" dengan nambah `if (x) return` di banyak tempat.
- Ngeluhin bug ke user tanpa hasil lokalisasi.
- Bilang "udah gua fix" tanpa reproduce → fix → verify.
