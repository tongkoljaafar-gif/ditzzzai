---
name: ditz-ui-state
description: Use when building interactive UI - cover all states.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [ui, states, components, accessibility]
    related_skills: [ditz-frontend, ditz-design-check]
---

# ditz-ui-state - Semua State, Semua Kontrol

Kegagalan paling sering di UI hasil AI: cuma bikin state "ada data, semua sukses". Skill ini nutup itu.

## 1. Lima state wajib per surface

Setiap list, tabel, kartu, form, panel yang fetch/mengubah/menerima data:

| State | Kapan | Wajib berisi |
|---|---|---|
| **Loading** | data di jalan | skeleton yang bentuknya mirip hasil akhir (bukan spinner generik) + fallback "lebih lama dari biasanya" di 15 detik |
| **Empty** | belum ada data / hasil kosong | judul, penjelasan satu kalimat, CTA utama |
| **Error** | fetch gagal / server error / validasi ditolak | apa yang terjadi, kenapa kalau diketahui, apa yang bisa user lakukan, input user jangan hilang |
| **Populated** | keadaan normal | state yang memang dirancang |
| **Edge** | data ekstrem, string panjang, field opsional hilang, network putus | layout nggak pecah |

**Empty ≠ error.** Jangan pernah luluhin error jadi empty. Empty itu momen onboarding, error itu momen pemulihan.

Uji edge konkret: tabel 10.000 baris + sort/filter, judul 200 karakter, avatar hilang, query 1 karakter atau cuma simbol, semua field opsional kosong, teks RTL bercampur LTR.

## 2. Sembilan state kontrol

Tiap elemen interaktif punya: **default, hover, focus-visible, active/pressed, disabled, loading, error, selected, read-only** - sesuai yang relevan.

Aturan teknis:
- Fokus selalu keliatan (`:focus-visible`), pakai ring 2px + offset, jangan `outline: none` polos.
- Disabled: turunkan kontras tapi tetap kebaca (≥3:1 buat border/ikon), `cursor: not-allowed`, `aria-disabled` kalau perlu tetap fokusable.
- Hover cuma buat penunjuk (pointer:fine); jangan andelin hover buat informasi penting.
- Active: ada dorongan fisik (`translateY(1px)` atau `scale(0.98)`), durasi 50-100ms.
- Loading di tombol: tombol nggak boleh bisa diklik dua kali, label tetap (atau ganti ke progres), lebar jangan berubah.

## 3. Aturan komponen yang sering dilanggar

- **Badge selalu inline**, ukuran ikut isi. Full-width badge = bukan badge, pakai banner/alert.
- **Input harus kebeda dari latarnya.** Kalau background input sama dengan parent, ubah fill + border satu step lebih terang/gelap. Focus ring bukan pengganti field yang kebaca.
- **Nested radius dihitung:** `inner = outer - padding`. 24 dengan padding 8 → child 16.
- **Input + tombol satu baris = tinggi sama persis** (padding, font, border). Kalau sistem desain punya token tinggi tombol, input ngikutin token itu.
- **Ikon di dalam input balance:** jarak tepi→ikon = jarak ikon→teks. `padding-inline-start = inset + lebarIkon + inset`.
- **Native select:** `appearance: none` + chevron custom, padding kanan ≥ 2.5rem, `color-scheme` disesuaikan biar dropdown nggak putih di tema gelap.
- **Label tombol nggak wrap** (`white-space: nowrap`), tombol nggak boleh nyusut (`flex-shrink: 0`). Kalau nggak muat, potong copy atau susun ulang layout.
- **Tombol sebaris ukuran sama** (tinggi, padding, font). Hierarki dari varian, bukan dari gede-kecilin kotak.
- **Label di atas input**, helper opsional, error di bawah. Placeholder bukan label.
- **Validasi saat blur**, bukan tiap ketukan; kecuali password/live field - validasi tiap ketukan setelah blur pertama. Pesan error hilang begitu input valid.

## 4. Hukum interaksi yang dipakai (dari 30 UX laws)

Pilih yang relevan, jangan hafal semua:

- **Fitts:** target utama besar dan dekat.
- **Hick:** ≤5 opsi per titik keputusan (kecuali tugasnya memang membandingkan).
- **Doherty:** feedback <100ms; <1s cukup indikator; >1s wajib progres yang jelas.
- **Jakob:** ikutin konvensi dulu, inovasi belakangan.
- **Miller/Chunking:** kelompokkan, jangan dump 9 field beruntun.
- **Von Restorff:** satu elemen dibedain buat nunjukin yang penting - jangan semua dibedain.
- **Tesler:** kompleksitas nggak bisa hilang, cuma dipindah - sembunyikan di progressive disclosure, jangan diamputasi.
- **Peak-End:** awal dan akhir alur harus bagus (onboarding + konfirmasi sukses).
- **Zeigarnik/Goal-gradient:** tunjukin progres di flow multi-langkah.
- **Postel:** input yang diterima longgar, output ketat.
- **Working memory:** recognition over recall - pilihan sebelumnya tetap keliatan.

## 5. Teks di UI

- Tombol = kata kerja spesifik ("Mulai lacak", bukan "Mulai").
- Error = apa yang terjadi + kenapa + apa yang bisa dilakukan. "Terjadi kesalahan" dilarang.
- Empty state = satu kalimat nilai + CTA.
- Konfirmasi destruktif = sebut objeknya ("Hapus "proyek Alpha"?"), tombol destruktif beda varian dan bukan default fokus.
