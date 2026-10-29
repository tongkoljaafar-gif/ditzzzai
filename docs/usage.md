# Cara Pakai Detail

## 1. Pilih skill, jangan muat semua

`ditz-router` memetakan situasi ke skill. Contohnya:

| Situasi | Skill |
|---|---|
| Fitur baru dari nol | `ditz-mission`, `ditz-code`, `ditz-review`, `ditz-nomistake` |
| Ada error produksi | `ditz-bugfix`, `ditz-review` |
| Bikin endpoint baru | `ditz-backend`, `ditz-api`, `ditz-secure`, `ditz-tdd` |
| Ubah skema database | `ditz-db`, `ditz-tdd`, `ditz-ship` |
| Bikin halaman baru | `ditz-design`, `ditz-frontend`, `ditz-ui-state`, `ditz-design-check` |
| Aplikasi lambat | `ditz-perf` |
| Setup CI dan deploy | `ditz-ops`, `ditz-ship` |
| Masuk ke repo orang | `ditz-map`, `ditz-mission` |
| Tugas berhari-hari | `ditz-ledger` plus skill situasinya |

## 2. Tiap skill punya bentuk yang sama

```
frontmatter    name, description, versi, lisensi, tag
tujuan         satu paragraf, kapan skill ini dipakai
aturan         tabel atau daftar yang bisa dicek benar/salah
gerbang        kondisi yang harus dipenuhi sebelum lanjut
output         bentuk laporan yang diharapkan
```

Kalau mau nambah skill baru, ikuti bentuk itu. Deskripsi harus di bawah 60 karakter supaya utuh di indeks skill.

## 3. Contoh alur nyata

Permintaan: "tambah fitur ganti password".

```
ditz-mission
  scope: endpoint, form, test, migrasi nol
  kriteria selesai: password lama wajib valid, hash baru argon2id,
                    semua sesi lama dicabut, ada test untuk tiga kasus

ditz-backend
  route POST /account/password
  service verifikasi password lama pakai argon2id verify
  update hash, revoke refresh token

ditz-secure
  rate limit per akun, cookie HttpOnly, nol password di log

ditz-tdd
  test dulu: password lama salah, password baru terlalu pendek,
  password baru sama dengan lama

ditz-code
  jalankan test, tempel output

ditz-nomistake
  label tiap klaim, sebut yang belum dites
```

Hasil yang dilaporkan bukan "sudah selesai", tapi daftar: apa yang terverifikasi, apa yang beralasan, apa yang belum diketahui.

## 4. Untuk desain

`ditz-design` menghasilkan satu kalimat arah plus dial yang dipilih eksplisit. Contoh:

```
Arah: dashboard monitoring untuk tim ops, terasa tenang dan padat data.
Dial: density 7/10, kontras 6/10, radius 4px, gerak 2/10, kroma 3/10.
Palet: near-black berlapis, satu aksen amber untuk status kritis.
Tipografi: satu sans (Inter) ukuran 13-14px body, angka pakai tabular-nums.
```

Hasil itu dikunci. `ditz-frontend` implementasi tanpa melenceng. `ditz-ui-state` pastiin lima state ada. `ditz-design-check` cek A sampai H, termasuk: nol em-dash, nol indigo default Tailwind sebagai aksen, nol gradien ungu ke biru di hero, nol emoji sebagai ikon, nol tiga kartu fitur seragam.

## 5. Kalau agent melenceng

Tiga penyebab paling umum dan penangkalnya:

| Gejala | Penangkal |
|---|---|
| Agent ngarang API atau hasil test | `ditz-nomistake` bagian 1 dan 3, wajib label klaim |
| Scope melebar tiap turn | `ditz-mission` fase 1, tulis kriteria selesai di awal, `ditz-ledger` buat tugas panjang |
| UI keliatan template | `ditz-design` dial eksplisit, `ditz-design-check` bagian gaya |
