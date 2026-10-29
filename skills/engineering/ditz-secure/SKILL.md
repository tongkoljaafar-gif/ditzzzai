---
name: ditz-secure
description: Use when adding auth, secrets, or handling user input.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [security, auth, owasp, secrets]
    related_skills: [ditz-api, ditz-review]
---

# ditz-secure - Keamanan yang Nggak Bisa Di-skip

## When to Use
- Nambah login/register/sesi/role.
- Nanganin input user, file upload, webhook, atau integrasi pihak ketiga.
- Audit keamanan cepat.

## Auth

- **Password:** hash dengan argon2id (atau bcrypt cost ≥12). Nggak pernah plaintext, nggak pernah MD5/SHA.
- **Sesi:** cookie `HttpOnly; Secure; SameSite=Lax` (atau `Strict` kalau nggak ada alur lintas situs). JWT disimpan di cookie HttpOnly, bukan localStorage.
- **JWT:** algoritma dikunci di server (nolak `alg: none` dan algorithm confusion), cek `iss`, `aud`, `exp`. Secret dari env, panjang ≥32 byte.
- **Otorisasi per objek:** setiap baca/tulis cek kepemilikan (`WHERE id = ? AND owner_id = ?`). Jangan cuma "udah login".
- **Role:** cek di server, jangan percaya field role dari client. Default deny.
- **Rate limit** login/reset/OTP, dan lockout yang lembut (delay/backoff).
- **Reset password:** token sekali pakai, expire <1 jam, simpan hash-nya, jangan bocorin apakah email terdaftar.

## Input & output

- Query parameterized. Tanpa terkecuali. ORM raw query juga.
- Shell: `execFile`/array args, jangan string shell. `spawn('cmd', [arg])`.
- Path file: resolve + cek prefix direktori yang diizinkan, tolak `..`, tolak absolut dari user.
- Upload: batas ukuran (di reverse proxy juga), sniff MIME asli, simpan di luar webroot, nama file di-generate server.
- SSRF: kalau user ngasih URL buat di-fetch, whitelist skema/host, blok IP private/link-local.
- Output HTML: escape default; kalau pakai `innerHTML`/`dangerouslySetInnerHTML`, sanitasi dengan library (DOMPurify).
- JSON/JS di HTML: encode, jangan `JSON.stringify` mentah ke `<script>`.

## Secret

- Dari env/secret manager. Nggak masuk repo, nggak masuk log, nggak masuk error message, nggak masuk URL query.
- Kalau secret ke-commit: rotasi dulu, baru bersihin history. Bersihin history nggak ngebatalin kebocoran.
- Secret di frontend cuma yang memang publik (URL, anon key dengan RLS ketat).

## Dependency

- `npm audit` / `pip-audit` / `govulncheck` sebelum rilis. Critical = blocker.
- Library nggak dirawat / download mingguan rendah → cari alternatif.

## Checklist audit cepat

- [ ] Nggak ada secret di `git log -p`
- [ ] Semua route privat punya auth + otorisasi objek
- [ ] Input divalidasi di boundary
- [ ] Query parameterized
- [ ] Header keamanan: CSP, `X-Content-Type-Options`, `Referrer-Policy`
- [ ] Error nggak bocorin stack/SQL
- [ ] Rate limit di endpoint sensitif
- [ ] Dependency audit bersih (atau diketahui)
