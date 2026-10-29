---
name: qzgo-project
description: Use when working on the QzRouter qzgo.digtel.id gateway.
version: 1.0.0
author: DitzzzAI
license: MIT
metadata:
  hermes:
    tags: [qzgo, qzrouter, gateway, go, react, project]
    related_skills: [ditz-backend, ditz-secure, ditz-frontend, ditz-design-check]
---

# qzgo-project - Peta Proyek QzRouter (qzgo.digtel.id)

## When to Use
- Nyentuh `https://qzgo.digtel.id` (dashboard/admin gateway AI milik user).
- Mau ubah halaman dashboard, tambah endpoint `/api/*`, atau ubah perilaku gateway.
- Debug masalah key, quota, combo, provider, OAuth account, atau usage di deployment ini.

## Identitas deployment (terverifikasi 2026-10-29)

| Item | Nilai |
|---|---|
| Domain | `qzgo.digtel.id` (Cloudflare di depan, `server: cloudflare`, `cf-ray: SIN`) |
| Komponen Go | `qzgo-core` v`qzgo-1.0.0`, runtime `go1.26.0 linux/amd64`, env `production`, port internal `:20130` |
| Komponen Node | service terpisah di `:20129`, heartbeat dilaporkan di `/api/health` |
| UI | `v0.6.0` label di header; React 19 + htm via esm.sh |
| Uptime saat dicek | 61603 s (~17 jam), goroutines 9, alloc 13 MB |
| Arsitektur data | database bersama (`shared database`) dipakai Go dan Node |

Endpoint publik yang terbuka tanpa login: `GET /api/public/overview`, `POST /api/public/key-info`, `GET /api/health`, `GET /api/auth/session`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /robots.txt`.

Semua endpoint lain `/api/*` balas `401 {"error":"Unauthorized"}`, dan `/v1/models` balas `401 {"error":"Missing API key"}`.

## Pembagian Go dan Node

Go (`:20130`) melayani dashboard baru: usage, status, providers, combos, keys, quota, key usage, token saver, system prompt, proxy pools, console, settings, skills, cli config.

Node (`:20129`) masih pegang: media (image, speech, transcribe), tulis config CLI, pxpipe, antigravity MITM, OAuth start/exchange, plus halaman lama. Kalau Node mati, dashboard tetap jalan, banner kuning muncul (`nodeUp === false`). Jangan asumsikan endpoint Node mati cuma karena UI bilang `this page is still served by Node`.

## Arsitektur frontend

Satu file JSX di-inline dalam `index.html` (~123 KB, bukan bundle terpisah), pakai React 19 + `htm` (template literal, tanpa build step), satu blok CSS (~18 KB, 84 class), tema light/dark lewat `html[data-theme]` + variabel CSS.

| Bagian | Isi |
|---|---|
| `api(path, opts)` | fetch `credentials:same-origin`, parse JSON, 401 dilempar sebagai error berkode |
| `jpost(p, data, method)` | wrapper JSON POST/PATCH/PUT |
| `PAGES` | 15 halaman dashboard, masing-masing `{title, sub, icon, view}` |
| `PATH_TO_PAGE` | peta `/dashboard/*` ke halaman; hash `#page` juga didukung |
| `NodePage` | halaman yang belum dimigrasi: tampilkan tombol buka `:20129` |
| `PublicOverview`, `PublicUsage`, `PublicKeyCheck` | isi landing sebelum login, refresh 30 s |

Landing sengaja cuma nampilkan status model, latency, usage 24 jam. Tidak ada nama key, kuota key, atau secret di payload publik.

## Model API dashboard

| Halaman | Endpoint |
|---|---|
| Usage | `GET /api/usage/summary?hours=N`, `/api/usage/recent?limit=60`, `/api/usage/model-status` |
| Status | `GET /api/usage/model-status` (auto-refresh 15 s) |
| Providers | `GET/POST /api/providers`, `PUT/DELETE /api/providers/{id}`, `GET/POST/PUT/DELETE /api/providers/{id}/connections[/{cid}]`, `POST .../connections/bulk` |
| Combos | `GET/POST /api/combos`, `PUT/DELETE /api/combos/{id}`, `GET /api/combos/options`, `GET /api/models/catalog[?live=0]`, `GET /api/models/upstream?prefix=X` |
| Keys | `GET/POST /api/keys`, `PUT/DELETE /api/keys/{id}`, `GET /api/keys/{id}/reveal`, `/share`, `/quota?hours=24`, `POST /api/keys/bulk`, `GET /api/tunnel/status` |
| Quota | `GET /api/quota` |
| Key Usage | `GET /api/key-trace?hours=N&id=X` |
| Token Saver | `GET /api/token-saver`, `PATCH /api/settings` |
| System Prompt | `GET/POST /api/system-prompts` |
| Proxy Pools | `GET/POST /api/proxy-pools`, `PUT/DELETE /api/proxy-pools/{id}` |
| Console | `GET /api/logs?limit=120[&onlyErr=1]` |
| Settings | `GET/PATCH /api/settings`, `GET/PATCH /api/routing` (PATCH), `POST /api/settings/password`, `GET /api/system/info`, `POST /api/backup/import`, `POST /api/backup/apply` |
| Accounts | `GET /api/accounts`, `PUT/DELETE /api/accounts/{id}`, `POST /api/accounts/import`, `POST /api/oauth/{provider}/start`, `POST /api/oauth/{provider}/exchange`, `POST /api/oauth/grok-cli/start`, `POST /api/oauth/grok-cli/poll` |
| Skills / CLI | `GET /api/skills`, `GET /api/cli-tools` |

## Semantik domain

- **Provider** = konektor upstream, punya `prefix` (dipakai di combo, contoh `gnkr/model`), `apiType` (`chat`/`responses`/`embeddings`), `baseUrl`, dan daftar **connections** (akun/kredensial). Runtime tiap provider ditandai `native go` atau `node`.
- **Connection** = satu kredensial di dalam provider; bisa bulk dengan format `apiKey[,name][,email][,priority]`, tanpa name jadi `Key 1`, `Key 2`. Ada backoff/cooldown dan rate-limit per koneksi, terlihat di halaman Quota.
- **Combo** = alias model yang dipakai di request (`model: nama-combo`) berisi `members` berurutan (format `prefix/model` atau model apa adanya) plus **sticky limit** (berapa call per member sebelum pindah, 0 = off). Failover mengikuti urutan members.
- **Key** = API key gateway untuk klien, dengan `tokenLimit`, `allowedModels`, status aktif, aksi reveal/share/copy, dan quota per key.
- **Token Saver** = dua injeksi system prompt: `caveman` (ringkas gaya jawab, level `lite`/`full`/`ultra`) dan `ponytail`.
- **System Prompt Model** = prompt per model/combo yang disuntik ke request.
- **Routing** = setelan `fill first` (pakai koneksi sesuai prioritas) vs rotate, plus sticky. Diatur lewat `PATCH /api/routing`.
- **Usage** = agregat per model per hari dari database bersama; hari tanpa data ditampilkan nol, bukan data contoh.

## Temuan audit (jangan diulang)

| # | Temuan | Dampak | Perbaikan |
|---|---|---|---|
| 1 | `/api/public/overview` membocorkan `promptTokens`/`completionTokens` per request terakhir (12 entri) tanpa login | kompetitor bisa lihat pola trafik detail | kirim agregat saja, atau butuh token |
| 2 | Nol security header di respons HTML (`CSP`, `HSTS`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) | tidak ada lapisan kedua kalau ada XSS/clickjack | pasang middleware header, CSP harus izinkan `esm.sh` |
| 3 | Dependency UI diambil dari `esm.sh` runtime (`react@19.0.0`, `react-dom`, `htm@3.1.1`) | supply-chain + downtime pihak ketiga, dan CSP mustahil ketat | self-host 3 file itu, hapus CDN |
| 4 | Blok JSX ~123 KB di-inline di `index.html`, tanpa `defer` build step | tidak bisa di-cache terpisah, tiap request HTML 142 KB | pisah jadi `/app.js` dengan hash |
| 5 | `reveal` key lewat `GET /api/keys/{id}/reveal` (bukan POST) | prefetch/cache/proxy bisa memicu reveal, log referer ke mana-mana | ubah ke POST, `Cache-Control: no-store`, wajib konfirmasi |
| 6 | CSS: nol `prefers-reduced-motion`, nol media query untuk `prefers-color-scheme` di CSS (JS sudah handle tema), fokus default tipis | aksesibilitas | tambah `@media (prefers-reduced-motion)` dan `:focus-visible` jelas |
| 7 | Login cuma satu password admin, tanpa 2FA/audit login | satu kredensial bocor = seluruh gateway | rate limit sudah ada (429 setelah 5 gagal), tambah log login + opsi 2FA |
| 8 | `POST /api/backup/apply` me-replace database aktif dan me-restart `qzgo` + `qzrouter` | satu klik salah = downtime + kehilangan data | wajib konfirmasi ganda, simpan snapshot otomatis sebelum apply |

Yang sudah bagus dan harus dipertahankan: cookie `credentials: same-origin` (bukan token di localStorage), nol `innerHTML`/`dangerouslySetInnerHTML` (React escape otomatis), landing tanpa data sensitif, `important`-free CSS, tabular-nums untuk angka, light/dark lengkap, auto-refresh dengan cleanup interval, dan `aria-*` dipakai di 21 tempat.

## Cara kerja di proyek ini

1. **Server tidak ada di mesin ini.** Semua analisa perilaku harus lewat HTTP: `curl -sS -m 15 -D - -o /dev/null <url>` untuk header, atau browser tool untuk alur UI.
2. **Jangan coba login tanpa kredensial user.** Kalau butuh data admin, minta user yang login, atau minta token. Jangan pernah menebak password.
3. **Ambil sumber asli, jangan kira-kira.** HTML berisi seluruh JSX; simpan lalu baca bagian per komponen. Endpoint lebih dipercaya dari UI karena UI bisa ketinggalan.
4. **Uji per perubahan** dengan curl ke `/api/health` dan halaman yang tersentuh, lalu bandingkan status code sebelum/sesudah.
5. **Kalau menyentuh `PATCH /api/settings` atau `/api/routing`,** pastikan UI menangani gagal-simpan (rollback toggle), karena setelan ini langsung mengubah perilaku gateway.
6. **Jangan sentuh Node :20129 lewat port publik** (tidak menanggapi dari luar), jadi semua perubahan yang perlu Node harus lewat halaman Go yang meneruskannya.

## Output laporan yang diharapkan user

```
Apa isinya: komponen + endpoint + halaman
Kualitas: temuan bernomor dengan bukti (header, payload, ukuran file)
Prioritas: mana yang bahaya, mana yang kosmetik
Langkah: apa yang dikerjakan duluan
```

## Reference (sudah diambil, jangan fetch ulang)

| File | Isi |
|---|---|
| `references/frontend-app.jsx` | salinan utuh JSX dari `index.html` (123 KB), sumber kebenaran untuk semua halaman |
| `references/api-endpoints.md` | peta endpoint per komponen UI, diekstrak dari JSX |
| `references/design-tokens.md` | 41 token CSS light + 41 dark, aturan pakai warna |
| `references/pages.md` | daftar 15 halaman dan rute `/dashboard/*` |

Kalau user minta analisa lain di masa depan, baca reference ini dulu sebelum `curl` apa pun.
