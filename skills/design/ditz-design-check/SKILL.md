---
name: ditz-design-check
description: Use before delivering any UI - run the design pre-flight.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [design, qa, pre-flight, anti-slop]
    related_skills: [ditz-design, ditz-frontend, ditz-ui-state]
---

# ditz-design-check - Pre-Flight Sebelum UI Dikirim

Jalanin semua. Satu kotak gagal = belum selesai. Ini bukan opsional.

## A. Kejujuran arah
- [ ] Design read satu baris ada dan dial eksplisit (bukan default diam-diam)
- [ ] Satu sistem desain resmi, atau estetika bernama + jujur soal aproksimasi
- [ ] Satu bahasa visual, satu palet, satu skala radius, satu skala type

## B. Anti-slop (paling sering bocor)
- [ ] **Nol em-dash (karakter U+2014) dan nol en-dash (U+2013).** Pemisah pakai hyphen biasa `-`.
- [ ] Nggak ada indigo/violet default Tailwind (`#6366f1`, `#4f46e5`, `#8b5cf6`, `#a855f7`) sebagai aksen, kecuali brand minta
- [ ] Nggak ada gradient "trust" 2-stop di hero (ungu→biru, biru→cyan)
- [ ] Nggak ada emoji sebagai ikon fitur (✨ 🚀 🎯 ⚡ 🔥 💡)
- [ ] Nggak ada kartu rounded dengan border-kiri berwarna ("AI dashboard tile")
- [ ] Nggak ada 3 kartu fitur sama besar sejajar
- [ ] Nggak ada div palsu niru screenshot produk (fake task list / fake terminal / fake dashboard)
- [ ] Nggak ada nama generik (Acme, Nexus, John Doe), angka palsu presisi (99.99%, 10× faster), kata "Unleash/Seamless/Elevate/Revolutionize"
- [ ] Nggak ada `lorem ipsum` atau "Feature one / two / three"
- [ ] Ikon dari library (Phosphor/HugeIcons/Radix/Tabler), bukan path SVG buatan sendiri
- [ ] Maks 2 pemakaian aksen per layar (link dan focus ring dihitung)

## C. Tipografi
- [ ] Huruf cuma 1-2 keluarga (+ mono kalau perlu); sans jadi default, serif cuma kalau brand/editorial beneran
- [ ] Bukan Inter sebagai default tanpa alasan (kecuali brief minta netral/public-sector)
- [ ] ALL CAPS punya tracking ≥ 0.06em
- [ ] Display ≥ 32px punya tracking negatif -0.01 sampai -0.03em (Latin)
- [ ] Judul italic dengan huruf turunan (y g j p q) punya `line-height` ≥ 1.1 + ruang bawah
- [ ] Body ≤ 18px punya `line-height` 1.5-1.6; ukuran cuma 6-8 level
- [ ] Paragraf body `max-width` 60-75ch
- [ ] Kalau ada teks CJK: leading 1.3-1.4 buat display, tracking 0 (jangan negatif)

## D. Warna & material
- [ ] Kontras body ≥ 4.5:1, teks besar ≥ 3:1, komponen UI ≥ 3:1
- [ ] Nggak ada `#000` atau `#fff` murni; pakai near-black/near-white
- [ ] Satu aksen dipakai konsisten sepanjang halaman (nggak tiba-tiba biru di section 7)
- [ ] Teks di dalam tombol kebaca (nggak ada putih-di-putih, CTA transparan tanpa border)
- [ ] Shadow di-tint ke latar, bukan hitam pekat
- [ ] Satu tema per halaman (nggak ada section terang nyempil di halaman gelap)

## E. Layout
- [ ] Hero masuk viewport: judul maks 2 baris, subteks ≤ 20 kata, CTA keliatan tanpa scroll
- [ ] Hero `pt` maks 24 (6rem); lebih dari itu keliatan bug
- [ ] Hero maksimal 4 elemen teks (eyebrow ATAU brand strip, judul, subteks, CTA)
- [ ] Eyebrow (label kecil uppercase di atas judul section) maks 1 per 3 section, hero dihitung 1 - dihitung mekanis, bukan dikira-kira
- [ ] Nggak ada split-header (judul kiri + paragraf kecil nyangkut di kanan) sebagai header section
- [ ] Maks 2 section beruntun pola gambar+teks zigzag; yang ketiga ganti pola
- [ ] Minimal 4 keluarga layout berbeda di 8 section; satu pola nggak diulang
- [ ] Bento: jumlah sel = jumlah item, nggak ada sel kosong, minimal 2-3 sel punya variasi visual nyata
- [ ] Grid pakai CSS Grid, bukan matematika flex persen; `min-h-[100dvh]`, bukan `h-screen`
- [ ] Nav satu baris di desktop, tinggi ≤ 80px
- [ ] Collapse mobile eksplisit per section (≤768px)

## F. Konten
- [ ] Copy diaudit ulang: nggak ada kalimat rusak, puitis palsu, atau label "performative craftsman"
- [ ] CTA satu niat satu label (jangan "Get in touch" + "Let's talk" di halaman sama)
- [ ] Label CTA nggak wrap di desktop (maks 3 kata untuk primer)
- [ ] Logo wall = logo doang, nggak dikasih label industri di bawahnya; pakai SVG asli (Simple Icons/devicon) atau monogram buatan
- [ ] Kutipan ≤ 3 baris, atribusi nama + peran
- [ ] List > 5 item pakai komponen yang tepat (grup, kartu, scroll-snap, tab), bukan `<ul>` + garis tiap baris
- [ ] Nggak ada fake-precise spec angka tanpa sumber/label mock

## G. Gerak & aksesibilitas
- [ ] Tiap animasi bisa dijelaskan dalam 1 kalimat (hierarki / cerita / feedback / perubahan state). "Biar keren" = hapus.
- [ ] `MOTION > 4` → beneran ada animasi; `MOTION ≤ 4` → halaman statis bersih (jangan setengah jadi)
- [ ] Durasi: feedback instan 50-100ms, konfirmasi state 150ms, masuknya UI 200-300ms, transisi antar layar 300-500ms
- [ ] Nggak ada `window.addEventListener('scroll')` - pakai `useScroll`, ScrollTrigger, IntersectionObserver, atau CSS scroll-driven
- [ ] `prefers-reduced-motion` dihormati di semua yang gerak
- [ ] Maks 1 marquee per halaman
- [ ] Fokus keyboard keliatan di semua elemen interaktif; target sentuh ≥ 44px
- [ ] Makna nggak pernah disampaikan warna doang (selalu warna + ikon/teks/bentuk)
- [ ] Nggak ada `useEffect` animasi tanpa cleanup

## H. Bukti
- [ ] Dev server nyala, halaman dirender, console bersih
- [ ] Dicek di 3 lebar (360 / 768 / 1280)
- [ ] Loading / empty / error / edge state ada (lihat `ditz-ui-state`)
- [ ] Path atau URL yang bisa dibuka user disebutkan di laporan
