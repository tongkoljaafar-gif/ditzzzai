# Design token QzRouter (diekstrak dari CSS)

Jangan ngarang warna baru. Pakai variabel ini.

## Light (`:root`)

| Token | Nilai |
|---|---|
| `--bg-page` | `#F4F7FB` |
| `--grid` | `rgba(59,130,246,.06)` |
| `--bg-side` | `rgba(255,255,255,.72)` |
| `--bg-card` | `#fff` |
| `--bg-subtle` | `#F1F5F9` |
| `--border` | `#EBF0F6` |
| `--border-strong` | `#DDE5EF` |
| `--t1` | `#0F1B2D` |
| `--t2` | `#64748B` |
| `--t3` | `#94A3B8` |
| `--t-nav` | `#33415C` |
| `--t-icon` | `#8291A8` |
| `--blue` | `#3B82F6` |
| `--blue-bg` | `rgba(59,130,246,.10)` |
| `--green` | `#16A34A` |
| `--amber` | `#F59E0B` |
| `--red` | `#DC2626` |
| `--shadow-card` | `0 1px 2px rgba(15,23,42,.05)` |
| `--shadow-pill` | `0 1px 3px rgba(15,23,42,.10)` |
| `--bg-hover` | `#F8FAFC` |
| `--bg-chip` | `#FAFAFA` |
| `--bg-input` | `#F1F5FA` |
| `--line-soft` | `#F1F5F9` |
| `--track` | `#EEF2F7` |
| `--danger-bg` | `#FEF2F2` |
| `--ok-fg` | `#15803D` |
| `--ok-bg` | `#DCFCE7` |
| `--ok-bd` | `#BBF7D0` |
| `--warn-fg` | `#B45309` |
| `--warn-bg` | `#FEF3C7` |
| `--warn-bd` | `#FDE68A` |
| `--bad-fg` | `#B91C1C` |
| `--bad-bg` | `#FEE2E2` |
| `--bad-bd` | `#FECACA` |
| `--neu-fg` | `#475569` |
| `--neu-bg` | `#F1F5F9` |
| `--neu-bd` | `#E2E8F0` |
| `--banner-bg` | `#FFFBEB` |
| `--banner-bd` | `#FDE68A` |
| `--banner-fg` | `#92400E` |
| `--banner-b` | `#78350F` |

## Dark (`html[data-theme="dark"]`)

| Token | Nilai |
|---|---|
| `--bg-page` | `#0B1220` |
| `--grid` | `rgba(148,163,184,.075)` |
| `--bg-side` | `#0E1728` |
| `--bg-card` | `#111C2E` |
| `--bg-subtle` | `#16233A` |
| `--border` | `#22304A` |
| `--border-strong` | `#33415C` |
| `--t1` | `#E8EEF8` |
| `--t2` | `#93A3B8` |
| `--t3` | `#6B7D95` |
| `--t-nav` | `#C3CFE0` |
| `--t-icon` | `#8CA0BA` |
| `--blue` | `#3B82F6` |
| `--blue-bg` | `#152641` |
| `--green` | `#34D399` |
| `--amber` | `#FBBF24` |
| `--red` | `#F87171` |
| `--shadow-card` | `0 1px 2px rgba(0,0,0,.45)` |
| `--shadow-pill` | `0 1px 3px rgba(0,0,0,.5)` |
| `--bg-hover` | `#16233A` |
| `--bg-chip` | `#16233A` |
| `--bg-input` | `#0E1728` |
| `--line-soft` | `#1B2942` |
| `--track` | `#1B2942` |
| `--danger-bg` | `#3F1212` |
| `--ok-fg` | `#4ADE80` |
| `--ok-bg` | `#052E1B` |
| `--ok-bd` | `#14532D` |
| `--warn-fg` | `#FCD34D` |
| `--warn-bg` | `#3A2A05` |
| `--warn-bd` | `#78350F` |
| `--bad-fg` | `#FCA5A5` |
| `--bad-bg` | `#3F1212` |
| `--bad-bd` | `#7F1D1D` |
| `--neu-fg` | `#A9B8CC` |
| `--neu-bg` | `#16233A` |
| `--neu-bd` | `#28374F` |
| `--banner-bg` | `#3A2A05` |
| `--banner-bd` | `#78350F` |
| `--banner-fg` | `#FCD34D` |
| `--banner-b` | `#FDE68A` |

## Aturan pakai

- Warna semantik: `--blue` aksi, `--green` normal, `--amber` lambat, `--red` mati.
- Teks: `--t1` utama, `--t2` sekunder, `--t3` paling lemah. Jangan pakai `--t3` untuk body.
- Semua angka pakai class `.num` (tabular-nums) supaya kolom tabel nggak goyang.
- Tema dipilih lewat `html[data-theme]`, disimpan di `localStorage['qz.theme']`.
