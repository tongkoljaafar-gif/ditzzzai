---
name: ditz-api
description: Use when designing or reviewing REST/GraphQL endpoints.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [api, rest, graphql, contract]
    related_skills: [ditz-backend, ditz-secure]
---

# ditz-api - Kontrak API yang Nggak Nyakitin Client

## When to Use
- Bikin endpoint baru atau ngubah bentuk response.
- Desain API buat fitur/modul baru.
- Review PR yang nyentuh route.

## Desain

1. **Resource, bukan aksi.** `POST /orders`, `GET /orders/:id`, `PATCH /orders/:id`. Bukan `POST /createOrder`. Aksi non-CRUD yang jelas: `POST /orders/:id/cancel`.
2. **Noun plural, kebab-case.** `/users/:id/payment-methods`.
3. **Method = makna:** GET idempoten & tanpa efek, POST bikin, PUT ganti utuh, PATCH ubah sebagian, DELETE hapus. Jangan GET yang ngubah state.
4. **Status code jujur.** 400 bentuk/validasi, 401 auth, 403 forbidden, 404 nggak ada, 409 konflik, 422 semantik, 429 limit, 500 server. 2xx tanpa body → 204.
5. **Bentuk error seragam:**
   ```json
   { "error": { "code": "email_taken", "message": "Email sudah dipakai", "fields": {"email": "harus unik"} } }
   ```
   `code` stabil buat dimachine, `message` buat manusia.
6. **Naming field:** satu style di seluruh API. Waktu ISO-8601 UTC. Uang integer sen + `currency`.
7. **Pagination seragam:** `?limit=&cursor=` + `{data, nextCursor}`. Jangan campur offset & cursor di API yang sama.
8. **Idempotency key** buat POST yang bisa dobel (payment, invite, webhook).
9. **Versioning:** `/v1` di path kalau publik. Perubahan yang ngerusak kontrak = versi baru, bukan silent change.
10. **Nggak bocorin internal:** PK database autoincrement buat publik → pakai UUID/slug kalau bisa ditebak. Stack trace/SQL nggak pernah ke client.

## Perubahan yang ngerusak (breaking)

- Rename/remove field, ubah tipe, ubah status code, nambah field required, ubah arti field, ubah auth.

Aman: nambah field opsional, nambah endpoint, deprecate sambil tetap jalan (header `Deprecation` + tanggal).

## GraphQL
- Batasi kedalaman & kompleksitas query (DoS), pakai DataLoader buat hindari N+1.
- Authorization per resolver, bukan cuma di root.
- Nggak ada field sensitif tanpa guard (email privat, token).

## Verifikasi
- `curl -i` happy path + satu error path per endpoint.
- Kalau ada OpenAPI: validasi spec (`npx @redocly/cli lint` atau swagger-cli) dan pastikan response nyata cocok sama schema.
- Cek breaking change kalau ngubah spec lama.
