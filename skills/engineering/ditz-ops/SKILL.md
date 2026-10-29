---
name: ditz-ops
description: Use when wiring CI/CD, containers, or infrastructure.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [devops, ci-cd, docker, observability]
    related_skills: [ditz-ship, release-it]
---

# ditz-ops - Pipeline & Infra

## When to Use
- Setup CI (GitHub Actions/GitLab CI) atau perbaiki yang gagal.
- Bikin Dockerfile/compose, taruh app di server.
- Nambah logging, metric, alert.

## Pipeline minimum (urutan gate)

```
lint → typecheck → test → build → (deploy staging) → (deploy prod, manual approve)
```

Aturan:
- Gagal di gate awal → stop, jangan lanjut deploy.
- Cache dependency (`actions/setup-node` + `cache: npm`, atau `setup-python` + `cache: pip`) buat speed.
- Secret dari CI secret store, bukan di YAML. `${{ secrets.X }}`.
- Pin versi action ke major (`@v4`), jangan `@master`.
- Concurrent deploy dibatalkan (`concurrency: group: deploy-${{ github.ref }}`, `cancel-in-progress: true`).
- Deploy prod cuma dari branch utama / tag, dengan `environment:` + approval.

```yaml
name: ci
on: [push, pull_request]
concurrency: {group: ci-${{ github.ref }}, cancel-in-progress: true}
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: 22, cache: npm}
      - run: npm ci
      - run: npm run lint && npm run typecheck
      - run: npm test -- --ci
      - run: npm run build
```

## Container & deploy
- Multi-stage, non-root, healthcheck, `.dockerignore` (lihat `ditz-ship`).
- Env dari platform (bukan file `.env` di image).
- Satu proses per container; kerja async pakai worker terpisah.
- Reverse proxy (nginx/caddy) buat TLS + gzip/brotli + batas body size.

## Observability
- **Log:** JSON ke stdout, level benar (`error` buat yang butuh tindakan), request id di tiap baris, jangan log PII/secret.
- **Metric:** latency (p50/p95/p99), error rate, saturation (CPU/mem/conn pool), plus 2-3 metric domain (order dibuat, job gagal).
- **Alert:** cuma buat yang actionable, dengan threshold yang nggak bikin alarm fatigue. Tiap alert punya runbook 5 baris.
- **Health:** `/healthz` (liveness, cek proses) dan `/readyz` (readiness, cek dependency).

## SLO dasar
Target realistis: availability 99.9% per bulan (≈43 menit downtime), p95 API <300ms, error rate <0.5%. Tulis di README supaya tim tahu angkanya, bukan cuma di kepala.

## Debug CI gagal
1. Baca step yang gagal, bukan seluruh log.
2. Reproduksi lokal dengan versi runtime sama (`node -v`, docker image sama).
3. Beda environment: env var kosong, timezone, path case-sensitive, permission file, cache basi (hapus cache → ulang).
4. Jangan "fix" dengan `continue-on-error` atau `|| true` kecuali memang opsional dan disebut alasannya.
