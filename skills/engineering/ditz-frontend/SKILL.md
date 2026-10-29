---
name: ditz-frontend
description: Use when building UI - components, state, design taste.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [frontend, react, ui, design]
    related_skills: [ditz-code, ditz-review, popular-web-designs]
---

# ditz-frontend - UI yang Nggak Generik

## When to Use
- Bikin/ngubah halaman, komponen, form, layout.
- Ngatur data fetching, state, animasi di frontend.
- User ngeluh UI-nya "kaku", "kayak template", "AI banget".

**Urutan wajib:** `ditz-design` (arah visual + dial) → implementasi di bawah → `ditz-ui-state` (state kontrol) → `ditz-design-check` (pre-flight). Jangan lompat ke kode sebelum arah visualnya ditentukan.

## Nol: cek stack dulu
Baca `package.json`: framework (Next/Vite/React/Vue/Svelte), versi React (18 vs 19 beda API), UI lib (shadcn/Tailwind/MUI), state (zustand/redux/tanstack-query). **Jangan import yang nggak ada di dependencies** - kalau perlu, tulis perintah install-nya duluan.

## Aturan implementasi

1. **Server dulu kalau ada server.** Data yang bisa diambil di server component/loader jangan di-fetch di client.
2. **Waterfall = musuh.** `await` berurutan yang independen → `Promise.all`. Mulai promise lebih awal, await belakangan.
3. **State seminimal mungkin.** Turunkan (derive) daripada simpan; jangan subscribe state yang cuma dipakai di callback.
4. **List panjang:** key stabil (id, bukan index), virtualisasi kalau >500 item, `content-visibility: auto`.
5. **Bundle:** import langsung ke file, bukan barrel; dynamic import buat komponen berat; jangan load analytics/logging sebelum hydration.
6. **Semua state UI wajib ada:** loading, empty, error, success, disabled, focus, hover, pressed, dark mode.
7. **Form:** validasi di client buat UX + di server buat keamanan. Server selalu sumber kebenaran.
8. **Aksesibilitas minimum:** label terhubung input, `alt` bermakna, kontras ≥4.5:1, navigasi keyboard, `aria-*` buat komponen custom, jangan `<div onClick>`.
9. **Responsif:** mobile dulu, tes di 360px, 768px, 1280px. Jangan fixed width kecuali memang perlu.

## Anti-slop (biar nggak keliatan hasil AI)

**Hindari:** hero tengah dengan gradient ungu-biru, 3 kartu fitur generik berikon sama, emoji sebagai ikon, rounded-2xl + shadow-lg di semua tempat, teks placeholder "Lorem", "Unlock the power of...", judul 60px tanpa hierarki, spacing acak.

**Lakukan:**
- Satu arah visual: pilih satu dari - editorial/typographic, brutalist, swiss/minimal, dense dashboard, atau playful. Konsisten.
- Skala tipografi tetap (mis. 12/14/16/20/28/40) dan skala spacing (4/8/12/16/24/32/48). Pakai variabel, jangan angka acak.
- Hierarki: 1 headline jelas, 2-3 level di bawahnya, kontras ukuran nyata (≥1.5x antar level).
- Warna: 1 netral base + 1 aksen + 1 semantik (error/success). Jangan pelangi.
- Kepadatan sesuai konteks: marketing = lega, dashboard = padat.
- Gerak: 150-250ms, easing standar, jangan animasi semua elemen, hormati `prefers-reduced-motion`.
- Isi nyata, bukan lorem. Kalau belum ada data, pakai contoh realistis domainnya.

## Verifikasi
- Dev server nyala, buka halaman, **nggak ada error/warning di console**.
- Cek 3 breakpoint + state kosong + state error.
- Kalau ada test UI (`playwright`/`cypress`), jalanin.
- Kasih path/screenshot URL yang bisa dibuka user.
