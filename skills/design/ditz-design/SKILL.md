---
name: ditz-design
description: Use when designing a page or UI - read the brief first.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [design, frontend, taste, anti-slop]
    related_skills: [ditz-frontend, ditz-ui-state, ditz-design-check]
---

# ditz-design - Arah Visual Sebelum Nulis CSS

Gerbang desain. Dipakai SEBELUM nulis kode UI apa pun. Setelah ini, lanjut ke `ditz-frontend` (implementasi) dan `ditz-design-check` (pre-flight).

## 1. Design read (wajib, satu baris)

Sebelum kode, tentuin dan tulis di kepala:

> "Ini gue baca sebagai: <jenis halaman> buat <audiens>, dengan bahasa <vibe>, condong ke <sistem desain / keluarga estetik>."

Sinyal yang dibaca: jenis halaman (landing/portfolio/dashboard/docs/redesign), kata vibe user ("minimalis", "Linear-style", "brutalist", "premium", "playful", "B2B serius", "editorial"), referensi yang dikasih (URL, screenshot, brand pesaing), audiens, aset brand yang udah ada, dan constraint senyap (aksesibilitas, sektor publik, regulasi).

**Constraint > selera.** Kalau audiensnya publik/regulated, aturan trust menang atas "keren".

Kalau ambigu dan dua arah bakal beda hasilnya, tanya SATU pertanyaan. Kalau bisa disimpulin, jangan tanya.

## 2. Tiga dial (angka, bukan perasaan)

| Dial | 1 | 10 |
|---|---|---|
| `DESIGN_VARIANCE` | simetris sempurna | chaos artistik |
| `MOTION_INTENSITY` | statis | sinematik/fisika |
| `VISUAL_DENSITY` | galeri lapang | cockpit padat |

Baseline `8 / 6 / 4`. Override dari design read:

| Sinyal | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| minimalis / clean / editorial / Linear | 5-6 | 3-4 | 2-3 |
| premium consumer / Apple-y / luxury | 7-8 | 5-7 | 3-4 |
| playful / Awwwards / agency | 9-10 | 8-10 | 3-4 |
| landing/portfolio default | 7-9 | 6-8 | 3-5 |
| trust-first / publik / regulated | 3-4 | 2-3 | 4-5 |
| dashboard / data product | 4-5 | 2-3 | 7-9 |
| redesign: preserve | samain | +1 | samain |
| redesign: overhaul | +2 | +2 | samain |

Aturannya konsisten: `VARIANCE > 4` → hero nggak boleh center, harus split/asimetris. `MOTION > 4` → halaman wajib beneran gerak (kalau nggak sanggup, turunin ke 3 dan kirim statis yang bersih). `DENSITY > 7` → kartu generik dilarang, data bernafas di layout kosong.

## 3. Sistem desain: pakai yang resmi, jangan bikin ulang

| Brief | Pakai |
|---|---|
| enterprise / Microsoft-ish | `@fluentui/react-components` |
| Google-ish / Material | `@material/web` (M3 tokens) |
| IBM-ish / analitik B2B | `@carbon/react` |
| GitHub-ish / devtool | `@primer/css` / `@primer/react-brand` |
| sektor publik UK / trust-first | `govuk-frontend` / `uswds` |
| modern SaaS, komponen milik sendiri | shadcn/ui + Tailwind v4 (wajib di-customize, jangan default) |
| app kecil, cepat | Tailwind v4 utilities + Radix primitives |

Satu sistem per proyek. Jangan campur Fluent + Carbon, atau shadcn di dalam app Material.

Kalau brief-nya estetika, bukan sistem (glassmorphism, bento, brutalist, editorial, dark-tech, kinetic type, aurora): native CSS + Tailwind, dan **jujur di komentar** mana yang inspirasi mana yang resmi. Liquid Glass Apple itu **nggak ada versi web resminya** - sebut sebagai aproksimasi.

## 4. Arah visual (pilih satu, konsisten)

Pilihan keluarga: **editorial/typographic**, **swiss/minimal**, **brutalist/raw**, **dense product UI**, **premium consumer**, **playful/kinetic**. Pilih satu dari design read. Campur dua = keliatan nggak yakin.

Dari situ turunin:
- **Tipografi:** 1 display + 1 body + (opsional) 1 mono. Skala tetap, maks 6-8 ukuran.
- **Warna:** 1 neutral base + 1 aksen + 1 set semantik. Bukan pelangi.
- **Radius:** satu skala (sharp semua / soft 12-16 / pill buat interaktif), jangan campur tanpa aturan.
- **Spacing:** kelipatan 4 (4/8/12/16/24/32/48/64/96), minimal 3 tier dipakai.
- **Gerak:** satu personality (snappy 150ms / spring lembut / scroll-driven), bukan campur.

## 5. Satu hal yang bikin diingat

Target: **~80% pola yang kebukti + ~20% keputusan khas proyek ini.** Yang 20% taruh di: satu langkah visual berani (tipografi, proporsi, satu warna), microcopy yang spesifik produk, satu micro-interaction, atau satu detail yang cuma bisa ditulis orang yang makai produknya.

Tes: kalau screenshot-nya dikasih ke orang di luar proyek, dia bisa nebak ini produk apa? Kalau nggak, itu template, bukan desain.

## 6. Serah ke implementasi

Sebelum nulis komponen, keluarkan kontrak 6 baris ini:

```
Read: <satu baris design read>
Dial: variance X / motion Y / density Z
Sistem: <paket resmi | estetika bernama + jujur>
Type: <display + body + mono> | skala <...>
Warna: bg/surface/fg/muted/border + aksen <hex> (aksen dipakai maks 2x per layar)
Radius/spacing/motion: <...>
```

Kontrak ini yang dijaga di `ditz-frontend`. Kalau di tengah jalan pengen ganti arah, balik ke sini dan ubah kontraknya dulu, jangan diam-diam.

## 7. Reference (load on demand, jangan dibaca semua)

Semua ada di `references/` dalam folder skill ini. Buka cuma yang relevan dengan pertanyaan saat itu.

| File | Isi | Kapan dibuka |
|---|---|---|
| `brand-palettes.md` | 36 sistem desain terkenal, hex asli | butuh arah warna yang sudah terbukti |
| `product-palettes.md` | 192 palet per tipe produk + alasannya | baru tahu tipe produknya, belum tahu palette |
| `visual-styles.md` | 88 nama gaya visual (editorial, brutalist, bento, glass, dst) | butuh nama bener buat arah visual |
| `product-styles.md` | 192 tipe produk -> gaya + pola landing | mau cepet milih gaya yang cocok |
| `landing-patterns.md` | 34 pola landing + urutan section | nyusun halaman marketing |
| `font-pairings.md` | 74 pasangan font + mood | milih tipografi |
| `ux-rules.md` | 119 aturan UX berlabel prioritas | review UX / cari kesalahan perilaku |
| `motion.md` | 17 preset gerak (durasi, easing) | ngerancang animasi |
| `charts.md` | 25 tipe data -> chart yang tepat | visualisasi data |

Aturan pakai reference: **bukti > selera**. Kalau ada angka/palette di sini, pakai itu sebagai titik mulai, verifikasi kontras sendiri, dan jangan ngarang nilai baru yang kelihatan presisi.
