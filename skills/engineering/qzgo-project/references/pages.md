# 15 halaman dashboard

Diekstrak dari `const PAGES` di JSX.

```js
const PAGES = {
  usage: { title: "Usage & Analytics", sub: "Traffic, tokens, and service status from the shared database", icon: I.chart, view: Usage },
  status: { title: "Model Status", sub: "Service monitor · auto-refresh every 15s", icon: I.pulse, view: StatusPage },
  providers: { title: "Providers", sub: "Upstream connectors, credentials, and connection counts", icon: I.server, view: Providers },
  combos: { title: "Combo & Vision Adapter", sub: "Model aliases and failover chains", icon: I.combo, view: Combos },
  keys: { title: "Endpoint & Key", sub: "Gateway API keys and token quotas", icon: I.key, view: Keys },
  quota: { title: "Quota Tracker", sub: "Token usage per key and rate-limited connections", icon: I.data, view: Quota },
  keyusage: { title: "Key Usage", sub: "Sisa token, pemakaian per model, dan request terakhir per API key", icon: I.key, view: KeyUsage },
  saver: { title: "Token Saver", sub: "Caveman & ponytail - prompt injection to save tokens", icon: I.save, view: TokenSaver },
  prompts: { title: "System Prompt Model", sub: "Per-model/combo prompt injected into requests", icon: I.psych, view: SystemPrompts },
  pools: { title: "Proxy Pools", sub: "Outbound relay for OAuth connections", icon: I.layers, view: ProxyPools },
  logs: { title: "Console Log", sub: "Recent request logs from the database", icon: I.term, view: ConsoleLogs },
  settings: { title: "Settings", sub: "Gateway settings and dashboard password", icon: I.gear, view: Settings },
  cli: { title: "CLI Tools", sub: "CLI tool config and gateway base URLs", icon: I.term, view: CLITools },
  skills: { title: "Skills", sub: "Agent skill catalog, ready to copy", icon: I.ext, view: SkillsPage },
  accounts: { title: "Accounts & OAuth", sub: "Provider OAuth login, token import, and credential status", icon: I.key, view: Accounts },
};
```

Landing (belum login) berisi `PublicKeyCheck`, `PublicOverview`, `PublicUsage`, dan form admin.
