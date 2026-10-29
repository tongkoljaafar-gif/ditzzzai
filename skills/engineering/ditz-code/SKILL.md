---
name: ditz-code
description: Use when writing or changing code - clean code gates.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [code-quality, solid, refactor]
    related_skills: [clean-code, refactoring, ditz-review]
---

# ditz-code - Standar Nulis Kode

Dipakai SEBELUM dan SESUDAH nulis kode. Gabungan Clean Code, SOLID, KISS/YAGNI, plus pola gagal khas LLM.

## When to Use
- Nulis fungsi/kelas/modul baru.
- Ngubah kode yang udah ada.
- Review cepat sebelum ngasih hasil ke user.

## Aturan tetap (imperatif)

1. **Satu nama satu konsep.** `user`/`member`/`account` buat hal yang sama = salah satu dibuang.
2. **Fungsi kecil, satu alasan berubah.** >40 baris atau >3 level nesting → pecah.
3. **Command ≠ query.** Fungsi yang ngubah state jangan sekalian balikin data; pisah.
4. **Parameter maksimal 3-4.** Lebih dari itu → objek bermakna, bukan `a,b,c,d,e`.
5. **Boolean flag di parameter = dua fungsi.** `render(x, isAdmin)` → `renderAdmin(x)` / `renderUser(x)`.
6. **Error eksplisit, jangan ditelan.** `catch {}` kosong = bug yang nunggu. Throw atau log + tindakan.
7. **Validasi di batas kepercayaan.** Input user/HTTP/CLI divalidasi di titik masuk, bukan disebar di dalam.
8. **Komentar buat 'kenapa', bukan 'apa'.** Kalau komentar njelasin alur kode, kodenya yang disederhanakan.
9. **Jangan abstraksi sekali pakai.** Satu pemanggil → inline aja. YAGNI menang atas "nanti butuh".
10. **Jangan ubah perilaku diam-diam.** Refactor = behaviour sama. Kalau perilaku berubah, itu fitur/bugfix - sebut eksplisit.

## Pola gagal khas hasil LLM (cek tiap habis nulis)

| Gejala | Fix |
|---|---|
| Nambah helper/abstraksi yang cuma dipakai sekali | inline |
| Nulis ulang file penuh padahal yang berubah 5 baris | patch minimal |
| `try/catch` yang cuma `console.log(err)` | handle atau lempar ulang dengan konteks |
| Validasi input dobel di 3 layer | satu tempat, di boundary |
| Import library tanpa cek `package.json` | cek dulu, kalau nggak ada → kasih perintah install |
| `any`/`unknown` di interface publik | tipe konkret atau `unknown` + narrowing |
| Komentar generik "// handle data" | hapus, ganti nama variabel |
| Copy-paste blok 20 baris | ekstrak fungsi bernama |
| Nambah config flag buat nilai yang nggak pernah berubah | konstanta |

## Gerbang anti-salah (jalan tiap habis nulis kode)

Sebelum bilang "beres", jawab enam pertanyaan ini dengan bukti, bukan feeling:

| # | Pertanyaan | Bukti yang sah |
|---|---|---|
| 1 | Ada kode yang gua tulis tapi nggak pernah gua jalankan? | jalankan, kutip output |
| 2 | Ada import/API/flag yang gua asumsikan ada? | `package.json`/lockfile/`--help`/source library |
| 3 | Ada path error yang belum gua coba? | test/curl yang memicu error itu |
| 4 | Ada angka/string yang gua karang? | sumber nyata, atau label `mock`/`placeholder` |
| 5 | Ada perubahan di luar scope? | `git diff --stat` cocok sama rencana |
| 6 | Ada yang gua sembunyikan (test di-skip, warning diabaikan)? | sebutin di laporan |

Salah satu "nggak" dengan bukti kosong = belum selesai.

## Checklist sebelum kasih ke user

- [ ] Nama jelas, satu istilah per konsep
- [ ] Nggak ada angka ajaib (pakai konstanta bernama)
- [ ] Path error/luar biasa eksplisit
- [ ] Nggak ada kode mati, `TODO`, `...`
- [ ] Diff minimal: nggak ada perubahan tak terkait
- [ ] Ada test/smoke test kalau mengubah logika

## Refactor cepat (dari Refactoring/Guru)

Simpan perilaku, ubah kecil, test tiap langkah. Prioritas smell:
1. Duplikasi → extract function
2. Fungsi panjang → decompose
3. Conditional kompleks → guard clause / polymorphism
4. Data clump → class/struct
5. Primitive obsession → value object
6. Feature envy → pindah ke class yang datanya dipakai

Satu refactor per commit. Test hijau sebelum lanjut.

Detail lebih dalam: `skill_view('refactoring')`, `skill_view('clean-code')`, `skill_view('a-philosophy-of-software-design')`.
