---
name: ditz-ship
description: Use before deploying or shipping to production.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [deploy, ci-cd, release, docker]
    related_skills: [ditz-review, release-it, ditz-ops]
---

# ditz-ship - Gerbang Sebelum Produksi

## When to Use
- User bilang "deploy", "ship", "push ke prod", "go live".
- Setup CI/CD, Dockerfile, env produksi.
- Nanya "udah siap rilis belum?".

## Urutan (jangan deploy sebelum semua di atas benar)

**1. Kode** - `ditz-review` pass: nggak ada blocker. Test lulus (kutip output). Build exit 0.

**2. Konfigurasi**
- [ ] Semua env var yang dipakai kode ada di prod (bandingkan dengan `.env.example`)
- [ ] Nggak ada secret di repo, di image, di log (`git log -p | grep -iE 'api[_-]?key|secret|password'`)
- [ ] Debug mode mati (`DEBUG=false`, `NODE_ENV=production`), CORS dibatasi ke domain nyata
- [ ] URL/callback OAuth pakai domain produksi

**3. Data**
- [ ] Migrasi aman & reversible (atau plan jelas kalau nggak)
- [ ] Backup terbaru ada, dan pernah dites restore
- [ ] Rollback plan: versi sebelumnya bisa di-deploy ulang, image/tag disimpan

**4. Runtime**
- [ ] Healthcheck endpoint (`/healthz`) balikin 200
- [ ] Resource limit & restart policy disetel (Docker/K8s)
- [ ] Tahu berapa replika dan gimana scaling-nya
- [ ] Volume/persistensi jelas, data nggak ilang pas container restart

**5. Observability**
- [ ] Log ke stdout terstruktur, bukan file di dalam container
- [ ] Error tracking aktif (Sentry atau sejenis)
- [ ] Ada satu metric/dashboard buat liat trafik + error rate

**6. Setelah deploy**
- `curl -i https://domain/healthz` → 200
- Cek log 2 menit pertama: nggak ada stack trace berulang
- Satu user journey nyata (login → aksi utama) berhasil
- Kalau gagal: rollback dulu, diagnosa belakangan (user duluan)

## Dockerfile sehat

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/healthz || exit 1
CMD ["node", "dist/index.js"]
```

Aturan: multi-stage, layer dependency dulu (`npm ci` sebelum `COPY . .`), jangan root, `.dockerignore` berisi `node_modules`, `.git`, `.env`, image final tanpa toolchain build.

## Format laporan deploy

```
SHIP GATE: CLEAR | BLOCK
Blocker: <daftar>
Diverifikasi: <test/build/curl + hasil>
Rollback: <cara + versi>
```

Kalau ada blocker yang butuh keputusan user (misal migrasi destruktif), stop dan tanya - itu satu-satunya alasan boleh nunggu.
