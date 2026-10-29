# Sumber Materi

Repo ini nggak menyalin file dari proyek lain. Yang diambil pola kerjanya, lalu ditulis ulang jadi satu halaman per skill. Di bawah ini sumbernya, biar bisa dicek sendiri.

## Engineering

| Sumber | Yang diambil |
|---|---|
| [ciembor/agent-rules-books](https://github.com/ciembor/agent-rules-books) | Ringkasan buku: Clean Code, Refactoring, DDD, Clean Architecture, Designing Data-Intensive Applications, Release It, The Pragmatic Programmer, dan lain-lain. Aturan turunannya ada di `skills/engineering/ditz-code`, `ditz-arch`, `ditz-db`, `ditz-review`, `ditz-ops`. |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | Protokol lima fase focused-fix, ship gate, review diff, profiling performa, desain skema, review API, onboarding codebase. Jadi dasar `ditz-mission`, `ditz-bugfix`, `ditz-review`, `ditz-ship`, `ditz-perf`. |
| [Egonex-AI/Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) | Model knowledge graph: node file, fungsi, class, modul; edge contains, imports, calls. Jadi dasar `ditz-map`. Plugin Node-nya nggak dipakai. |
| [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills) | Checklist review kode, panduan backend, migrasi database, pemulihan error, CI/CD. Hasil kompresi masuk `ditz-backend`, `ditz-db`, `ditz-ops`, `ditz-bugfix`. |

## Design dan UX

| Sumber | Yang diambil |
|---|---|
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Dataset guideline UX (119 aturan), palet per tipe produk (192), katalog gaya visual (88), pola landing (34), pasangan font (74), preset gerak (17), pemilihan chart (25). Diringkas ke `skills/design/ditz-design/references/`. |
| [nexu-io/open-design](https://github.com/nexu-io/open-design) | Disiplin craft: anti AI slop, warna, tipografi, cakupan state, animasi. Palet diekstrak dari dokumentasi design system mereka jadi `brand-palettes.md`. |
| [bergside/typeui](https://github.com/bergside/typeui) | Prinsip spacing, UX, dan UI. Masuk `ditz-design` dan `ditz-ui-state`. |
| [adand-91/gpt-6-astra-skill](https://github.com/adand-91/gpt-6-astra-skill) | Pola ledger: satu target, tujuan yang nggak boleh melenceng, bukti bukan kesan. Jadi `ditz-ledger` dan `ditz-nomistake`. |
| [Kimi: design skills for agents](https://www.kimi.ai/id/resources/design-skills-for-agents) | Kerangka skill desain: constraint lebih penting dari selera, skill harus bisa dicek. Masuk bagian gerbang di `ditz-design-check`. |

## Catatan lisensi

Kutipan dan pola di atas dipakai sebagai referensi. Kalau lo mau pakai ulang materi dari repo sumber, cek lisensi masing-masing repo. Repo ini sendiri MIT.
