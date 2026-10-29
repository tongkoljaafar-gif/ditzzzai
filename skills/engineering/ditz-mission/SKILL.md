---
name: ditz-mission
description: Use when starting a coding task - plan, act, verify.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [workflow, core, mission]
    related_skills: [ditz-review, ditz-bugfix, ditz-ship]
---

# ditz-mission - Satu Tugas, Selesai, Baru Ngomong

Gerbang masuk semua kerja koding. Load ini dulu, lalu load 1-2 skill spesifik yang relevan.

## Hukum besi

```
TUGAS DIKASIH → KERJA → VERIFIKASI → LAPOR. NGGAK ADA BOUNCING DI TENGAH.
```

Tanya user cuma kalau dua interpretasi menghasilkan deliverable yang beda dan salah tebak = kerja ulang total. Kalau enggak, ambil default paling masuk akal, sebut asumsinya satu baris, jalan.

## Fase

**1. Skope (maks 5 baris di kepala, jangan ditulis ke user)**
- Apa yang diminta, dalam bentuk yang bisa diverifikasi? (contoh: "endpoint /login balikin 200 + cookie", bukan "bikin auth")
- File/folder mana yang kena?
- Stack apa, test runner apa, cara jalannya gimana?
- Ada blocker yang butuh kredensial/akses? Kalau ada, itu satu-satunya alasan boleh nanya.

**2. Cari dulu, nulis kemudian**
- Baca kode yang ada di sekitar titik perubahan SEBELUM nulis. Ikuti konvensi repo, bukan selera sendiri.
- Verifikasi library/API/flag benar-benar ada: cek `package.json`/`requirements.txt`/`go.mod`, atau baca node_modules/site-packages. Nggak ada → jangan import.

**3. Eksekusi bertahap**
- Satu perubahan logis per langkah, jalankan cek relevan setelah tiap langkah (test/build/lint/curl).
- Error muncul → berhenti nambah fitur, diagnosa dulu (lihat `ditz-bugfix`).
- Fix 3+ kali malah bikin masalah baru → arsitekturnya yang salah, lapor ke user, jangan tambal terus.

**4. Verifikasi (wajib, jangan dilewat)**
Minimal satu bukti nyata per klaim:

| Klaim | Bukti minimal |
|---|---|
| "test lulus" | output test runner: jumlah pass/fail |
| "endpoint jalan" | `curl -i` dengan status + body |
| "build sukses" | exit code 0 + artefak ada di disk |
| "bug fixed" | test/repro yang tadinya gagal sekarang lulus |
| "UI jadi" | dev server nyala + render tanpa error console |

Nggak bisa verifikasi? Bilang apa adanya: "nggak gua tes, butuh X".

**5. Lapor (maks 5 baris)**
```
Apa yang berubah: <file/fitur>
Verifikasi: <output nyata, ringkas>
Belum: <yang sengaja ditinggal + alasan>
```

## Larangan

- TODO, stub, `...`, "rest unchanged" di dalam deliverable.
- Ngarang output tool, angka test, atau status deploy.
- Nanya "mau gua lanjut?" kalau langkah berikutnya udah jelas dari permintaan awal.
- Ngubah file di luar scope tanpa nyebut alasannya.
- Bilang "harusnya jalan" buat hal yang belum dijalankan.

## Hemat token

- Jangan baca file 2000 baris buat ngubah 3 baris: grep dulu, baca window sempit.
- Jangan dump file utuh ke chat; tunjuk path + potongan yang berubah.
- Satu tugas satu ringkasan. Nggak ada laporan susulan kecuali user nanya.
