# DitzzzAI Skills

Kumpulan skill agent untuk kerja engineering dan UI. Ditulis buat dipakai, bukan buat dibaca sekali terus dilupakan: tiap skill satu halaman, punya gerbang verifikasi, dan nggak nyuruh lo ngarang.

21 skill. Total 258 KB. Core skill rata-rata 2 KB. Reference yang berat cuma dibuka kalau memang perlu.

```
skills/engineering/   18 skill kerja: rencana, kode, review, DB, API, deploy, CI, performance, security
skills/design/         3 skill UI: arah desain, state, pre-flight sebelum kirim
docs/                  dokumentasi cara pakai dan sumber materi
```

## Kenapa ada

Kebanyakan "skill pack" isinya 500 baris ceramah yang nggak pernah dibaca agent di tengah kerja. Yang ini kebalikannya:

- **Satu skill, satu keputusan.** Isinya aturan yang bisa dicek (ada/tidak, benar/salah), bukan motivasi.
- **Ada gerbang.** `ditz-mission` memaksa rencana sebelum koding. `ditz-nomistake` ngeblok klaim "selesai" yang nggak punya bukti.
- **Nol klaim kosong.** Tiap laporan wajib pakai label: terverifikasi, beralasan, atau belum diketahui.
- **Bahasa kerja ringkas.** Kalimat perintah, tabel, sama checklist. Tanpa basa-basi.

## Isi

### Engineering

| Skill | Fungsi | Ukuran |
|---|---|---|
| `ditz-router` | Peta: situasi apa butuh skill apa. Mulai dari sini. | 2 KB |
| `ditz-mission` | Gerbang wajib tiap tugas koding: scope, cari, cabang, verifikasi. | 2 KB |
| `ditz-code` | Aturan nulis kode: penamaan, ukuran fungsi, error, plus gerbang anti-salah 6 poin. | 3 KB |
| `ditz-nomistake` | Gerbang akhir: 7 sumber kesalahan, checklist universal, aturan label klaim. | 2 KB |
| `ditz-review` | Review diff/PR: urutan konteks, kebenaran, keamanan, verdict BLOCK/SHIP. | 3 KB |
| `ditz-bugfix` | Debug: stop, rekam bukti, reproduksi, satu hipotesis, fix akar, kunci test. | 2 KB |
| `ditz-tdd` | RED-GREEN-REFACTOR yang ditegakkan: test harus gagal dulu. | 2 KB |
| `ditz-backend` | Route, service, repo, auth versus otorisasi, IDOR. | 2 KB |
| `ditz-db` | Skema, constraint, uang, waktu, migrasi expand-contract. | 2 KB |
| `ditz-api` | Desain endpoint: resource, status code, error shape. | 2 KB |
| `ditz-arch` | Batas modul, arah dependency, YAGNI. | 2 KB |
| `ditz-secure` | Hash password, cookie, JWT, rate limit, input. | 2 KB |
| `ditz-perf` | Baseline p50/p95/p99 dulu, baru optimasi. | 2 KB |
| `ditz-ops` | Pipeline CI: lint, typecheck, test, build, deploy, rollback. | 2 KB |
| `ditz-ship` | Gate sebelum produksi: secret, debug flag, CORS, migrasi, backup. | 2 KB |
| `ditz-frontend` | Urutan wajib: desain, implementasi, state, pre-flight. | 3 KB |
| `ditz-map` | Paham codebase asing cepat tanpa baca semua file. | 1 KB |
| `ditz-ledger` | Catatan tugas panjang: target, bukti, gap, bisa dilanjut. | 2 KB |

### Design

| Skill | Fungsi | Ukuran |
|---|---|---|
| `ditz-design` | Arah desain dari brief: satu kalimat arah, dial eksplisit, palet, tipografi, gerak. | 5 KB |
| `ditz-ui-state` | Lima state wajib per layar: loading, empty, error, terisi, edge. | 4 KB |
| `ditz-design-check` | Pre-flight A sampai H sebelum UI dikirim. | 5 KB |

`ditz-design` juga bawa 9 file reference di `references/`, dibuka cuma kalau perlu:

| Reference | Isi |
|---|---|
| `ux-rules.md` | 119 aturan UX berlabel prioritas |
| `product-palettes.md` | 192 palet per tipe produk plus alasan pemilihannya |
| `product-styles.md` | 192 tipe produk ke rekomendasi gaya visual |
| `visual-styles.md` | 88 nama gaya visual, kapan cocok, kapan salah tempat |
| `landing-patterns.md` | 34 pola landing page dan urutan section-nya |
| `font-pairings.md` | 74 pasangan font plus mood |
| `brand-palettes.md` | 36 sistem desain terkenal, hex asli |
| `motion.md` | 17 preset gerak: durasi dan easing |
| `charts.md` | 25 tipe data ke chart yang tepat |

## Cara pakai

### Hermes Agent

Salin folder skill yang dibutuhkan ke direktori skill profile lo:

```bash
git clone https://github.com/tongkoljaafar-gif/ditzzzai.git
cp -r ditzzzai/skills/engineering/* ~/.hermes/skills/software-development/
cp -r ditzzzai/skills/design/*       ~/.hermes/skills/creative/
```

Lalu load sesuai situasi:

```
skill_view(name='ditz-router')
skill_view(name='ditz-mission')
```

### Claude Code, Codex, dan agent lain

Nama folder sama dengan nama skill, dan tiap `SKILL.md` punya frontmatter `name` plus `description`. Agent yang baca folder skill secara otomatis bakal nemu semuanya. Kalau tool lo pakai `AGENTS.md`, tambah satu baris rujukan ke `skills/engineering/ditz-router/SKILL.md`.

### Urutan yang disarankan

```
tugas masuk
  ditz-router        pilih skill yang relevan
  ditz-mission       rencana + scope + kriteria selesai
  ditz-bugfix        kalau yang dikerjain adalah bug
  ditz-code          waktu nulis kode
  ditz-tdd           waktu nulis test
  ditz-review        waktu mau kirim diff
  ditz-nomistake     sebelum bilang selesai
```

Untuk UI, sisipkan setelah `ditz-code`:

```
ditz-design  ->  ditz-frontend  ->  ditz-ui-state  ->  ditz-design-check
```

Jangan load semua skill sekaligus. Dua sampai tiga skill per tugas sudah cukup, karena tiap skill nyuruh agent buka file lain kalau butuh.

## Aturan yang dijaga

`ditz-nomistake` dan `ditz-code` maksa tiga hal ini di setiap laporan:

| Label | Arti |
|---|---|
| Terverifikasi | Output-nya dilihat sendiri di sesi itu, dan alatnya disebut |
| Beralasan | Disimpulkan dari kode atau dokumentasi, belum dijalankan |
| Belum diketahui | Nggak ada data, dan disebut apa yang dibutuhkan |

Tanpa label, klaim dianggap kosong.

## Batasan yang jujur

- Skill ini hasil sintesis dari buku dan repo publik yang sudah dibaca, bukan salinan satu-satu. Tiap skill menyebut sumbernya di bagian atas file.
- Angka di reference design (palet, durasi gerak, ukuran font) adalah titik mulai. Kontras tetap harus dihitung sendiri.
- Nggak ada kode aplikasi di repo ini, jadi nggak ada test suite. Verifikasinya: frontmatter valid, nama folder sama dengan nama skill, deskripsi di bawah 60 karakter, nggak ada link markdown yang rusak, nggak ada karakter em-dash.
- Lisensi sumber: buku dan repo yang dirujuk punya lisensi masing-masing. Yang diambil cuma pola kerja dan nama aturan, bukan teks panjangnya.

## Sumber

Lihat [docs/sources.md](docs/sources.md).

## Lisensi

MIT. Lihat [LICENSE](LICENSE).

---

Dibuat oleh DitzzzAI. Fullstack, frontend sampai deploy.
