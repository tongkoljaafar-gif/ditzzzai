---
name: ditz-arch
description: Use when designing system structure or refactoring modules.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [architecture, design, complexity, ddd]
    related_skills: [a-philosophy-of-software-design, clean-architecture, domain-driven-design]
---

# ditz-arch - Desain & Batas Modul

## When to Use
- Mulai proyek/modul baru, milih struktur folder.
- Mau refactor besar, "kode udah nggak karuan".
- Nentuin batas antar-modul/service.

## Prinsip

1. **Kompleksitas itu biaya utama.** Yang nyumbang: dependency antar modul, informasi yang harus diketahui buat paham satu modul, kode yang nggak jelas. Tiap keputusan desain: ini nambah atau kurangi tiga itu?
2. **Modul dalam, interface tipis.** Interface sederhana yang nyembunyiin kompleksitas. Kalau buat paham modul harus baca 5 file, interface-nya gagal.
3. **Satu hal satu tempat.** Aturan bisnis satu tempat. Duplikasi aturan = bug nunggu sinkron.
4. **Dependency searah.** UI → aplikasi → domain → infra boleh, sebaliknya enggak. Framework jangan bocor ke domain.
5. **YAGNI > spekulasi.** Nggak bikin abstraksi "buat nanti". Ekstrak kalau ada 3 contoh nyata.
6. **Batas sejalan sama perubahan.** Modul dipisah karena berubah bareng / beda tim / beda rate deploy - bukan karena file-nya banyak.

## Pilih struktur

| Konteks | Struktur |
|---|---|
| App kecil, 1 tim | folder per fitur (`features/auth/...`) |
| Domain kompleks | layer + domain model (clean architecture / hexagonal) |
| Banyak tim, banyak service | batas per bounded context (DDD), komunikasi event/API |
| Data & integrasi berat | modular monolith dulu; pecah ke service cuma kalau butuh scaling/deploy terpisah |

Default: **modular monolith**, bukan microservice, kecuali ada alasan operasional nyata.

## Refactor besar (dari legacy)

1. Pahami perilaku nyata: tambah characterization test dulu (test yang nangkep perilaku sekarang, walaupun aslinya salah).
2. Cari seam: titik yang bisa disisipi tanpa ngubah semua.
3. Extract → pindahkan sedikit-sedikit → test hijau tiap langkah.
4. Nggak ada "rewrite total" tanpa test yang sama-sama di-rewrite; kalau harus, jalankan paralel dan bandingkan output.

## Anti-pola arsitektur

- Folder `utils/` jadi tempat sampah.
- God service / `index.ts` 800 baris.
- Model DB dipakai langsung sebagai response API.
- Event bus dipakai buat alur yang sebenarnya berurutan.
- Abstraksi interface dengan 1 implementasi (bikin refactor susah tanpa manfaat).
- Service dipisah tapi share DB yang sama → itu monolith dengan biaya network.

## Output desain (singkat)

```
Konteks: <masalah + constraint>
Opsi: A ... / B ...
Pilihan: <X>, alasan: <2 baris>
Batas modul: <modul → tanggung jawab>
Risiko: <apa yang bakal susah diubah nanti>
```
