# Peta endpoint per komponen UI

Diekstrak langsung dari JSX di index.html (bukan tambahan manual).

## Usage
- `/api/usage/summary?hours=${range}`

## Providers
- `/api/providers/${id}`
- `/api/providers/${d.id}` (write)

## ConnectionsModal
- `/api/providers/${provider.id}/connections`
- `/api/providers/${provider.id}/connections/${c.id}`
- `/api/providers/${provider.id}/connections` (write)
- `/api/providers/${provider.id}/connections/${c.id}` (write)
- `/api/providers/${provider.id}/connections/bulk` (write)

## Combos
- `/api/combos/${c.id}`
- `/api/models/upstream?prefix=${encodeURIComponent(pick.prefix)}`
- `/api/combos/${d.id}` (write)

## Keys
- `/api/keys/${k.id}`
- `/api/keys/${k.id}/quota?hours=24`
- `/api/keys/${k.id}/reveal`
- `/api/keys/${k.id}/share`
- `/api/keys/${k.id}` (write)
- `/api/keys/${modal.data.id}` (write)

## KeyUsage
- `/api/key-trace?hours=${hours}&id=${encodeURIComponent(sel)}`

## ProxyPools
- `/api/proxy-pools/${p.id}`
- `/api/proxy-pools/${modal.data.id}` (write)

## ConsoleLogs
- `/api/logs?limit=120${onlyErr ? "&errors=1" : ""}`

## Accounts
- `/api/accounts/${a.id}`
- `/api/accounts/${a.id}` (write)
- `/api/oauth/${conn.provider}/exchange` (write)
- `/api/oauth/${conn.provider}/start` (write)
