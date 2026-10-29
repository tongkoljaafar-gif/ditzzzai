
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";
const html = htm.bind(React.createElement);

const NODE = location.protocol + "//" + location.hostname + ":20129";
const fmt = (n) => (n ?? 0).toLocaleString("id-ID");
const copyText = async (t) => {
  const v = String(t ?? "");
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(v); return true; } } catch (e) {}
  try {
    const ta = document.createElement("textarea");
    ta.value = v; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "-9999px";
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, v.length);
    const ok = document.execCommand("copy"); ta.remove(); return ok;
  } catch (e) { return false; }
};
const fmtMs = (v) => (v == null ? "—" : v >= 100 ? (v / 1000).toFixed(1) + "s" : Math.round(v) + "ms");
const compact = (n) => {
  n = n ?? 0;
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
};
const ago = (ts) => {
  if (!ts || ts === "None") return "—";
  const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000);
  if (isNaN(s)) return "—";
  if (s < 60) return Math.round(s) + "s ago";
  if (s < 3600) return Math.round(s / 60) + "m ago";
  if (s < 86400) return Math.round(s / 3600) + "h ago";
  return Math.round(s / 86400) + "d ago";
};
const shortProv = (p) => (p || "").replace(/^openai-compatible-(chat|responses)-/, "oc:").slice(0, 30);

const I = {
  chart: html`<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>`,
  pulse: html`<svg viewBox="0 0 24 24"><path d="M2 12h4l2-6 3 12 3-9 2 3h6"/></svg>`,
  server: html`<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/></svg>`,
  combo: html`<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  key: html`<svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M17 3l4 4M14 6l3 3"/></svg>`,
  gear: html`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M4.5 12a7.5 7.5 0 0 1 .2-1.7l-1.6-1.2 2-3.5 1.9.8a7.5 7.5 0 0 1 2.9-1.6L10 2.5h4l.1 2.3a7.5 7.5 0 0 1 2.9 1.6l1.9-.8 2 3.5-1.6 1.2a7.5 7.5 0 0 1 0 3.4l1.6 1.2-2 3.5-1.9-.8a7.5 7.5 0 0 1-2.9 1.6l-.1 2.3h-4l-.1-2.3a7.5 7.5 0 0 1-2.9-1.6l-1.9.8-2-3.5 1.6-1.2A7.5 7.5 0 0 1 4.5 12z"/></svg>`,
  term: html`<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/></svg>`,
  data: html`<svg viewBox="0 0 24 24"><path d="M3 7c0-1.7 4-3 9-3s9 1.3 9 3-4 3-9 3-9-1.3-9-3z"/><path d="M3 7v10c0 1.7 4 3 9 3s9-1.3 9-3V7"/></svg>`,
  save: html`<svg viewBox="0 0 24 24"><path d="M12 3v12M7 11l5 5 5-5M5 21h14"/></svg>`,
  psych: html`<svg viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z"/><path d="M9 21h6M10 17v4M14 17v4"/></svg>`,
  ext: html`<svg viewBox="0 0 24 24"><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/><path d="M14 4h6v6M20 4l-8 8"/></svg>`,
  layers: html`<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/></svg>`,
  plus: html`<svg viewBox="0 0 24 24" style=${{width:"13px",height:"13px",stroke:"currentColor",strokeWidth:"2.4",fill:"none"}}><path d="M12 5v14M5 12h14"/></svg>`,
  refresh: html`<svg viewBox="0 0 24 24" style=${{width:"14px",height:"14px",stroke:"currentColor",strokeWidth:"2",fill:"none"}}><path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6"/></svg>`,
};

async function api(path, opts = {}) {
  const res = await fetch(path, { credentials: "same-origin", ...opts });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 && !path.startsWith("/api/auth/login") && !body.error) {
    const e = new Error("unauthorized"); e.code = 401; throw e;
  }
  if (!res.ok) throw new Error(body.error || (path.startsWith("/api/auth/login") ? "wrong password" : String(res.status)));
  return body;
}
const jpost = (p, data, method = "POST") =>
  api(p, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });

/* ---------------------------------------------------------------- primitives */

function Modal({ title, onClose, children, onSave, saveLabel = "Save", busy, error, wide }) {
  return html`<div className="modal-bg" onClick=${(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" style=${wide ? { width: "min(760px,100%)" } : undefined}>
      <div className="mh"><h2>${title}</h2>
        <button className="btn sm" onClick=${onClose}>tutup</button></div>
      <div className="mb">${children}
        ${error && html`<p className="err">${error}</p>`}
      </div>
      <div className="mf">
        <button className="btn" onClick=${onClose}>batal</button>
        ${onSave && html`<button className="btn blue" onClick=${onSave} disabled=${busy}>${busy ? "…" : saveLabel}</button>`}
      </div>
    </div>
  </div>`;
}

function Field({ label, children, hint }) {
  return html`<label className="f">${label}${children}${hint && html`<span style=${{ fontWeight: 400, color: "var(--t3)", fontSize: 11 }}>${hint}</span>`}</label>`;
}

function ActionBtn({ onClick, children, danger, title }) {
  return html`<button className=${"btn sm" + (danger ? " danger" : "")} title=${title} onClick=${onClick}>${children}</button>`;
}

function Toggle({ checked, onChange, label }) {
  return html`<button className="sw" role="switch" aria-checked=${checked ? "true" : "false"}
    aria-label=${label || "toggle"} title=${label || ""} onClick=${onChange}></button>`;
}

function StatusPill({ status }) {
  const map = { success: "okp", ok: "okp", "200": "okp", normal: "okp" };
  const cls = map[status] || (status === "slow" ? "warnp" : status === "offline" ? "badp" : "neup");
  return html`<span className=${"pill " + cls}>${status}</span>`;
}

/* ---------------------------------------------------------------- login */

function PublicUsage() {
  const [d, setD] = useState(null);
  useEffect(() => {
    const load = () => api("/api/public/overview").then(setD).catch(() => {});
    load(); const t = setInterval(load, 30000); return () => clearInterval(t);
  }, []);
  if (!d) return null;
  const u = d.usage || {};
  const rows = d.usageByModel || [];
  const maxTok = Math.max(1, ...rows.map((m) => m.tokens || 0));
  return html`<div className="card">
    <div className="hd">
      <div>
        <h3>Usage 24h</h3>
        <span className="sub">${fmt(u.requests)} requests · ${compact(u.tokens)} tokens · 24h window</span>
      </div>
      <span className="sub" style=${{ marginLeft: "auto" }}>auto-refresh 30s</span>
    </div>
    <div className="bd tight">
    <div style=${{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "12px 16px" }}>
      ${[["Request", fmt(u.requests)], ["Token", compact(u.tokens)],
         ["Success", (u.successRate || 0).toFixed(1) + "%"], ["Failed", fmt(u.failed)]].map(([k, v]) => html`<div key=${k}>
        <div className="mut" style=${{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>${k}</div>
        <div className="num b" style=${{ fontSize: 16 }}>${v}</div></div>`)}
    </div>
    <table style=${{ marginTop: 12 }}>
      <thead><tr><th>Model</th><th className="r">Req</th><th className="r">In</th><th className="r">Out</th><th style=${{ width: "18%" }}>Share</th></tr></thead>
      <tbody>${rows.slice(0, 8).map((m) => html`<tr key=${m.model}>
        <td className="b ell" title=${m.model}>${m.model}</td>
        <td className="r num">${fmt(m.requests)}</td>
        <td className="r num" style=${{ color: "var(--blue)" }}>${compact(m.promptTokens)}</td>
        <td className="r num" style=${{ color: "var(--green)" }}>${compact(m.completionTokens)}</td>
        <td><div className="bar"><i style=${{ width: Math.max(2, Math.round(((m.tokens || 0) / maxTok) * 100)) + "%" }} /></div></td>
      </tr>`)}</tbody></table>
    ${(d.recent || []).length > 0 && html`<div style=${{ marginTop: 18, borderTop: "1px solid var(--line-soft)", paddingTop: 12 }}>
      <div className="mut" style=${{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Recent requests</div>
      <div style=${{ maxHeight: 220, overflow: "auto" }}>
        <table>
          <thead><tr><th style=${{ width: 12 }}></th><th>Model</th><th className="r">In / Out</th><th className="r">When</th></tr></thead>
          <tbody>${(d.recent || []).map((r, i) => html`<tr key=${i}>
            <td style=${{ width: 12, paddingRight: 0 }}><i className="dot"
              style=${{ background: ["success", "ok", "200"].includes(r.status) ? "#22C55E" : "#EF4444" }} /></td>
            <td className="b ell" title=${r.model}>${r.model}</td>
            <td className="r num" style=${{ fontSize: 11 }}>${compact(r.promptTokens)} / ${compact(r.completionTokens)}</td>
            <td className="r mut">${ago(r.timestamp)}</td></tr>`)}</tbody></table>
      </div>
    </div>`}
    </div>
  </div>`;
}

function PublicKeyCheck() {
  const [key, setKey] = useState("");
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const k = key.trim();
    if (!k) return;
    setBusy(true); setErr(""); setD(null);
    try {
      setD(await jpost("/api/public/key-info", { key: k, hours: 24 }));
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  const q = (d && d.quota) || {};
  const t = (d && d.totals) || {};
  const models = (d && d.byModel) || [];
  const allowed = (d && d.allowedModels) || [];
  const pct = Math.min(100, q.percent || 0);

  return html`<div className="card" style=${{ marginTop: 14 }}>
    <div className="hd">
      <div>
        <h3>Cek key kamu</h3>
        <span className="sub">paste API key di sini — langsung kelihatan sisa token, model yang boleh dipakai, dan request terakhir</span>
      </div>
    </div>
    <div className="bd">
      <form onSubmit=${submit} style=${{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input type="password" autocomplete="off" spellcheck="false" placeholder="sk-…"
          aria-label="API key" value=${key} onInput=${(e) => setKey(e.target.value)}
          style=${{ flex: "1 1 320px", fontFamily: "ui-monospace,monospace", fontSize: 13 }} />
        <button className="btn blue" disabled=${busy || !key.trim()}>${busy ? "…" : "lihat detail"}</button>
        ${d && html`<button type="button" className="btn" onClick=${() => { setKey(""); setD(null); setErr(""); }}>reset</button>`}
      </form>
      ${err && html`<p className="err" style=${{ marginTop: 10 }}>${err}</p>`}

      ${d && html`<div style=${{ marginTop: 16 }}>
        <div style=${{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <b style=${{ fontSize: 15 }}>${d.key.name || "key"}</b>
          <code className="mut" style=${{ fontSize: 12 }}>${d.key.masked}</code>
          <span className=${"pill " + (d.key.isActive ? "okp" : "neup")}>${d.key.isActive ? "active" : "off"}</span>
          ${t.lastUsed && html`<span className="mut" style=${{ fontSize: 11, marginLeft: "auto" }}>terakhir dipakai ${ago(t.lastUsed)}</span>`}
        </div>

        <div className="grid4" style=${{ marginBottom: 12 }}>
          <${StatCard} label="Token terpakai" value=${fmt(q.used || 0)}
            caption=${q.hasLimit ? "dari " + fmt(q.tokenLimit) : "tanpa limit"} />
          <${StatCard} label="Sisa token" color="c3" value=${q.hasLimit ? fmt(q.remaining || 0) : "∞"}
            caption=${q.hasLimit ? (100 - pct).toFixed(1) + "% tersisa" : "unlimited"} />
          <${StatCard} label="Request 24h" color="c2" value=${fmt(t.requests || 0)}
            caption=${`${fmt(t.failed || 0)} gagal`} />
          <${StatCard} label="Lifetime token" value=${compact(t.lifetimeTokens || 0)}
            caption=${`${models.length} model dipakai`} />
        </div>

        <div className="bar" style=${{ marginBottom: 6 }}><i className=${pct > 90 ? "hi" : ""} style=${{ width: pct + "%" }} /></div>
        <div className="mut" style=${{ fontSize: 11, marginBottom: 14 }}>
          ${q.hasLimit ? `${pct.toFixed(1)}% dari ${fmt(q.tokenLimit)} token` : "tanpa limit"} ·
          24h ${compact((t.promptTokens || 0) + (t.completionTokens || 0))} token
        </div>

        ${allowed.length > 0 && html`<div style=${{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          <span className="mut" style=${{ fontSize: 11, alignSelf: "center" }}>model diizinkan:</span>
          ${allowed.slice(0, 12).map((m) => html`<span key=${m} className="pill neup">${m}</span>`)}
          ${allowed.length > 12 && html`<span className="pill neup">+${allowed.length - 12}</span>`}
        </div>`}

        <div className="cols">
          <div className="card" style=${{ boxShadow: "none" }}>
            <div className="hd"><h3>Per model (24h)</h3><span className="sub">${models.length}</span></div>
            <div className="bd tight">
              <table>
                <thead><tr><th>Model</th><th className="r">Req</th><th className="r">In</th><th className="r">Out</th></tr></thead>
                <tbody>${models.map((m) => html`<tr key=${m.model}>
                  <td className="b ell" title=${m.model}>${m.model}</td>
                  <td className="r num">${fmt(m.requests)}</td>
                  <td className="r num" style=${{ color: "var(--blue)" }}>${compact(m.promptTokens)}</td>
                  <td className="r num" style=${{ color: "var(--green)" }}>${compact(m.completionTokens)}</td></tr>`)}</tbody>
              </table>
              ${models.length === 0 && html`<div className="empty">belum ada pemakaian 24 jam terakhir</div>`}
            </div>
          </div>
          <div className="card" style=${{ boxShadow: "none" }}>
            <div className="hd"><h3>Request terakhir</h3><span className="sub">${(d.recent || []).length}</span></div>
            <div className="bd tight">
              <table>
                <thead><tr><th>Model</th><th className="r">In / Out</th><th className="r">Latency</th><th className="r">When</th></tr></thead>
                <tbody>${(d.recent || []).map((r2, i) => html`<tr key=${i}>
                  <td className="b ell" title=${r2.model}>${r2.model}</td>
                  <td className="r num" style=${{ fontSize: 11 }}>${compact(r2.promptTokens)} / ${compact(r2.completionTokens)}</td>
                  <td className="r num">${r2.latencyMs ? fmtMs(r2.latencyMs) : "—"}</td>
                  <td className="r mut">${ago(r2.timestamp)}</td></tr>`)}</tbody>
              </table>
              ${(d.recent || []).length === 0 && html`<div className="empty">belum ada request</div>`}
            </div>
          </div>
        </div>
        <p className="mut" style=${{ fontSize: 11, marginTop: 10 }}>
          Key hanya dipakai untuk membaca data key itu sendiri — tidak disimpan di browser, tidak dikirim ke pihak lain.
        </p>
      </div>`}
    </div>
  </div>`;
}

function ModelHealthTable({ rows, showTraffic }) {
  return html`<table>
    <thead><tr><th>Model</th><th>Status</th><th className="r">Latency</th>
      ${showTraffic ? html`<th className="r">Req</th><th className="r">Tokens</th><th className="r">Succ</th>` : ""}
      <th className="r">Last seen</th></tr></thead>
    <tbody>${rows.map((c) => html`<tr key=${c.name}>
      <td className="b ell" title=${c.name}>${c.name}</td>
      <td><${StatusPill} status=${c.status} /></td>
      <td className="r num">${c.latencyMs ? fmtMs(c.latencyMs) : "—"}</td>
      ${showTraffic ? html`<td className="r num">${fmt(c.requests)}</td>
        <td className="r num">${compact(c.tokens)}</td>
        <td className="r num">${c.requests ? (c.successRate || 0).toFixed(1) + "%" : "—"}</td>` : ""}
      <td className="r mut">${c.lastSeen ? ago(c.lastSeen) : "—"}</td></tr>`)}</tbody></table>`;
}

function PublicOverview() {
  const [d, setD] = useState(null);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    const load = () => api("/api/public/overview").then(setD).catch(() => {});
    load(); const t = setInterval(load, 30000); return () => clearInterval(t);
  }, []);
  if (!d) return null;
  const u = d.usage || {};
  const models = d.models || [];
  const sum = d.modelSummary || {};
  const visible = showAll ? models : models.slice(0, 14);
  return html`<div className="card">
    <div className="hd">
      <div>
        <h3>Gateway status</h3>
        <span className="sub">${models.length} model · 60m window · ${fmt(u.requests)} requests / 24h</span>
      </div>
      <span className="sub" style=${{ marginLeft: "auto" }}>auto-refresh 30s</span>
    </div>
    <div className="bd tight">
      <div style=${{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "12px 16px" }}>
        ${[["Normal", sum.normal || 0, "var(--green)"], ["Slow", sum.slow || 0, "var(--amber)"],
           ["Idle", sum.idle || 0, "var(--t2)"], ["Offline", sum.offline || 0, "var(--red)"]].map(([k, v, c]) => html`<div key=${k}>
          <div className="mut" style=${{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>${k}</div>
          <div className="num b" style=${{ fontSize: 18, color: c }}>${v}</div></div>`)}
      </div>
      <${ModelHealthTable} rows=${visible} showTraffic=${false} />
      ${models.length > visible.length && html`<div style=${{ padding: "10px 16px 14px", marginTop: "auto" }}>
        <button className="btn sm" onClick=${() => setShowAll(true)}>show ${models.length - visible.length} more models</button>
      </div>`}
    </div>
  </div>`;
}

function Login({ onDone }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      await jpost("/api/auth/login", { password: pw });
      onDone();
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return html`<div className="landing">
  <header className="landing-top">
    <div className="brand" style=${{ padding: 0 }}>
      <div className="tile">${I.pulse}</div>
      <div><b>QzRouter Proxy</b><small>v0.6.0 · Go :20130</small></div>
    </div>
    <form className="signin" onSubmit=${submit}>
      <span className="signin-lbl">Admin sign in</span>
      <input type="password" placeholder="Admin password" value=${pw} autofocus
        aria-label="Admin password" onInput=${(e) => setPw(e.target.value)} />
      <button className="btn blue" disabled=${busy}>${busy ? "…" : "Sign in"}</button>
    </form>
  </header>
  ${err && html`<p className="err" style=${{ margin: "0 0 10px" }}>${err}</p>`}
  <${PublicKeyCheck} />
  <div className="landing-grid">
    <${PublicOverview} />
    <${PublicUsage} />
  </div>
  <div className="landing-foot">QzRouter Proxy · gateway status refreshes automatically</div>
  </div>`;
}

/* ---------------------------------------------------------------- usage */

function StatCard({ label, value, color, caption }) {
  return html`<div className="card stat">
    <div className="k">${label}</div>
    <div className=${"v num " + (color || "c1")}>${value}</div>
    ${caption && html`<div className="c">${caption}</div>`}
  </div>`;
}

function ChartCard({ hourly, range }) {
  const [mode, setMode] = useState("tokens");
  const series = (hourly || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  const vals = series.map((h) => (mode === "tokens" ? h.tokens : h.requests));
  const max = Math.max(1, ...vals);
  const w = 640, h = 132, pad = 4;
  const step = vals.length > 1 ? (w - pad * 2) / (vals.length - 1) : 0;
  const pts = vals.map((v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = pts.length ? `${line} L${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L${pad} ${h - pad} Z` : "";
  const span = series.length ? (new Date(series[series.length - 1].name) - new Date(series[0].name)) / 3600000 : 0;
  const hour = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    const hhmm = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return span > 12 ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${hhmm}` : hhmm;
  };
  return html`<div className="card">
    <div className="hd">
      <h3>${mode === "tokens" ? "Tokens" : "Requests"} per hour</h3>
      <div className="seg">${["tokens", "requests"].map((m) => html`<button key=${m} aria-pressed=${mode === m}
        onClick=${() => setMode(m)}>${m === "tokens" ? "Tokens" : "Requests"}</button>`)}</div>
    </div>
    <div className="bd">
      <div style=${{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--t3)", marginBottom: 8 }}>
        <span>total ${compact(vals.reduce((a, b) => a + b, 0))} ${mode === "tokens" ? "token" : "request"} · peak ${compact(max)}</span>
        <span>${series.length} hours with data · window ${range}h</span>
      </div>
      <div style=${{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 8 }}>
        <div style=${{ display: "flex", flexDirection: "column", justifyContent: "space-between",
                       fontSize: 10, color: "var(--t3)", textAlign: "right", padding: "2px 0 16px" }}>
          <span>${compact(max)}</span><span>${compact(max / 2)}</span><span>0</span>
        </div>
        <svg viewBox=${`0 0 ${w} ${h}`} style=${{ width: "100%", height: 132, display: "block" }} preserveAspectRatio="none">
          <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style=${{ stopColor: "var(--blue)", stopOpacity: 0.22 }} />
            <stop offset="100%" style=${{ stopColor: "var(--blue)", stopOpacity: 0 }} />
          </linearGradient></defs>
          ${[0.25, 0.5, 0.75].map((f) => html`<line key=${f} x1="0" x2=${w} y1=${h * f} y2=${h * f}
            style=${{ stroke: "var(--border)" }} strokeWidth="1" strokeDasharray="3 4" />`)}
          <line x1="0" x2=${w} y1=${h - pad} y2=${h - pad} style=${{ stroke: "var(--border-strong)" }} strokeWidth="1" />
          ${area && html`<path d=${area} fill="url(#g)" />`}
          ${line && html`<path d=${line} fill="none" style=${{ stroke: "var(--blue)" }} strokeWidth="2" strokeLinejoin="round" vector-effect="non-scaling-stroke" />`}
        </svg>
      </div>
      <div style=${{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)",
                     marginTop: 4, paddingLeft: 52 }}>
        ${[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const idx = series.length ? Math.min(series.length - 1, Math.round(f * (series.length - 1))) : 0;
          return html`<span key=${f}>${hour(series[idx]?.name)}</span>`;
        })}
      </div>
    </div>
  </div>`;
}

const TRACK_KEY = null; // removed: the public card is resolved server-side

function Usage() {
  const [tab, setTab] = useState("overview");
  const [range, setRange] = useState(24);
  const [sum, setSum] = useState(null);
  const [recent, setRecent] = useState([]);
  const [status, setStatus] = useState(null);

  const load = useCallback(() => {
    api(`/api/usage/summary?hours=${range}`).then(setSum).catch(() => {});
    api("/api/usage/recent?limit=60").then((d) => setRecent(d.requests || [])).catch(() => {});
    api("/api/usage/model-status").then(setStatus).catch(() => {});
  }, [range]);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);

  const ok = sum && sum.totalRequests ? Math.round((sum.success / sum.totalRequests) * 1000) / 10 : 0;
  return html`<div>
    <div className="tabsrow">
      <div className="seg">
        <button aria-pressed=${tab === "overview"} onClick=${() => setTab("overview")}>Overview</button>
        <button aria-pressed=${tab === "details"} onClick=${() => setTab("details")}>Details</button>
      </div>
      <div className="seg">${[24, 168, 720].map((h) => html`<button key=${h} aria-pressed=${range === h}
        onClick=${() => setRange(h)}>${h === 24 ? "24h" : h === 168 ? "7D" : "30D"}</button>`)}</div>
    </div>

    <div className="grid5">
      <${StatCard} label="Total requests" value=${fmt(sum?.totalRequests)} />
      <${StatCard} label="Input tokens" color="c2" value=${fmt(sum?.promptTokens)} />
      <${StatCard} label="Output tokens" color="c3" value=${fmt(sum?.completionTokens)} />
      <${StatCard} label="Success rate" value=${ok + "%"} caption=${`${fmt(sum?.success)} succeeded`} />
      <${StatCard} label="Failed" color="c5" value=${fmt(sum?.failed)} caption="upstream errors" />
    </div>

    ${tab === "overview" ? html`<div style=${{ marginBottom: 16 }}><${ChartCard} hourly=${sum?.hourly} range=${range} /></div>
    <div className="cols">
      <div className="card">
        <div className="hd"><h3>Model status</h3><span className="sub">service monitor · last ${status?.windowMinutes || 60} minutes</span></div>
        <div className="bd">
          ${status ? html`<div>
            <div className="heat">${status.models.map((m) => html`<i key=${m.name}
              className=${m.status === "normal" ? "ok" : m.status === "slow" ? "slow" : m.status === "offline" ? "bad" : ""}
              title=${`${m.name} · ${m.status}${m.latencyMs ? " · " + fmtMs(m.latencyMs) : ""}`} />`)}</div>
            <div className="legend">
              <span><i className="dot" style=${{ background: "#22C55E" }} />normal</span>
              <span><i className="dot" style=${{ background: "#F59E0B" }} />slow</span>
              <span><i className="dot" style=${{ background: "#EF4444" }} />offline</span>
              <span><i className="dot" style=${{ background: "var(--track)" }} />unknown</span>
            </div>
          </div>` : html`<p className="mut">loading…</p>`}
          <div style=${{ marginTop: 16 }}>
            <table><thead><tr><th>Model</th><th>Status</th><th className="r">Latency</th><th className="r">Last seen</th></tr></thead>
            <tbody>${(status?.models || [])
              .slice()
              .sort((a, b) => (b.lastSeen ? new Date(b.lastSeen).getTime() : 0) - (a.lastSeen ? new Date(a.lastSeen).getTime() : 0))
              .map((m) => html`<tr key=${m.name}>
              <td className="b">${m.name}</td><td><${StatusPill} status=${m.status} /></td>
              <td className="r num">${m.latencyMs ? fmtMs(m.latencyMs) : "—"}</td>
              <td className="r mut">${ago(m.lastSeen)}</td></tr>`)}</tbody></table>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="hd"><h3>Recent requests</h3><span className="sub">${recent.length}</span></div>
        <div className="bd tight" style=${{ maxHeight: 372, overflow: "auto" }}>
          <table className="tbl-recent">
            <thead><tr>
              <th style=${{ width: 14 }}></th>
              <th>Model</th>
              <th className="r" colSpan=${2}>In / Out</th>
              <th className="r">When</th>
            </tr></thead>
            <tbody>${recent.map((r) => html`<tr key=${r.id}>
            <td style=${{ width: 12, paddingRight: 0 }}>
              <i className="dot" style=${{ background: ["success", "ok"].includes(r.status) ? "#22C55E" : "#EF4444" }} /></td>
            <td className="b" title=${r.model}><span className="clip">${r.model}</span></td>
            <td className="r num" style=${{ color: "var(--blue)" }}>${compact(r.promptTokens)}↑</td>
            <td className="r num" style=${{ color: "var(--green)" }}>${compact(r.completionTokens)}↓</td>
            <td className="r mut">${ago(r.timestamp)}</td></tr>`)}</tbody></table>
        </div>
      </div>
    </div>` : html`<div className="cols">
      <div className="card">
        <div className="hd"><h3>Top providers</h3><span className="sub">${range}h</span></div>
        <div className="bd tight"><table>
          <thead><tr><th>Provider</th><th className="r">Req</th><th className="r">In</th><th className="r">Out</th></tr></thead>
          <tbody>${(sum?.byProvider || []).map((p) => html`<tr key=${p.name}>
            <td className="ell" title=${p.name}>${shortProv(p.name)}</td>
            <td className="r num">${fmt(p.requests)}</td>
            <td className="r num" style=${{ color: "var(--blue)" }}>${compact(p.promptTokens)}</td>
            <td className="r num" style=${{ color: "var(--green)" }}>${compact(p.completionTokens)}</td></tr>`)}</tbody></table>
        </div>
      </div>
      <div className="card">
        <div className="hd"><h3>Top models</h3><span className="sub">${range}h</span></div>
        <div className="bd tight" style=${{ maxHeight: 420, overflow: "auto" }}><table>
          <thead><tr><th>Model</th><th className="r">Req</th><th className="r">Tokens</th></tr></thead>
          <tbody>${(sum?.byModel || []).slice(0, 24).map((p) => html`<tr key=${p.name}>
            <td className="ell b">${p.name}</td><td className="r num">${fmt(p.requests)}</td>
            <td className="r num">${compact(p.tokens)}</td></tr>`)}</tbody></table>
        </div>
      </div>
    </div>`}
  </div>`;
}

/* ---------------------------------------------------------------- status */

function StatusPage() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    const load = () => api("/api/usage/model-status").then(setStatus).catch(() => {});
    load(); const t = setInterval(load, 15000); return () => clearInterval(t);
  }, []);
  const models = status?.models || [];
  const count = (s) => models.filter((m) => m.status === s).length;
  return html`<div>
    <div className="grid4">
      <${StatCard} label="Normal" color="c3" value=${count("normal")} />
      <${StatCard} label="Slow" color="c4" value=${count("slow")} />
      <${StatCard} label="Offline" color="c5" value=${count("offline")} />
      <${StatCard} label="Unknown" value=${count("unknown")} caption=${`window ${status?.windowMinutes || 60}m`} />
    </div>
    <div className="card">
      <div className="hd"><h3>Model status</h3><span className="sub">pembaruan otooffs 15s</span></div>
      <div className="bd"><div className="heat">${models.map((m) => html`<i key=${m.name}
        className=${m.status === "normal" ? "ok" : m.status === "slow" ? "slow" : m.status === "offline" ? "bad" : ""}
        title=${`${m.name} · ${m.status}`} />`)}</div>
        <div style=${{ marginTop: 16 }}><table>
          <thead><tr><th>Model</th><th>Status</th><th className="r">Latency</th><th className="r">Last seen</th></tr></thead>
          <tbody>${models.map((m) => html`<tr key=${m.name}>
            <td className="b">${m.name}</td><td><${StatusPill} status=${m.status} /></td>
            <td className="r num">${m.latencyMs ? fmtMs(m.latencyMs) : "—"}</td>
            <td className="r mut">${ago(m.lastSeen)}</td></tr>`)}</tbody></table></div>
      </div>
    </div>
  </div>`;
}

/* ---------------------------------------------------------------- providers */

function Providers() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(null);   // {mode:'new'|'edit', data}
  const [connFor, setConnFor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => api("/api/providers").then((d) => setRows(d.providers || [])).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const save = async () => {
    setBusy(true); setErr("");
    try {
      const d = modal.data;
      if (modal.mode === "new") await jpost("/api/providers", d);
      else await jpost(`/api/providers/${d.id}`, { prefix: d.prefix, apiType: d.apiType, baseUrl: d.baseUrl, name: d.name }, "PUT");
      setModal(null); setMsg("provider saved"); load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const del = async (id, prefix) => {
    if (!confirm(`Delete provider "${prefix}" and all its connections?`)) return;
    try { await api(`/api/providers/${id}`, { method: "DELETE" }); setMsg("provider deleted"); load(); }
    catch (e) { setErr(e.message); }
  };

  return html`<div>
    <div className="tabsrow">
      <div className="seg"><span style=${{ padding: "6px 14px", fontSize: 13, color: "var(--t2)" }}>${rows.length} konektor</span></div>
      <button className="btn blue" onClick=${() => setModal({ mode: "new", data: { prefix: "", apiType: "chat", baseUrl: "", name: "" } })}>
        ${I.plus} new provider</button>
    </div>
    ${msg && html`<p className="okmsg" style=${{ marginBottom: 12 }}>${msg}</p>`}
    ${err && html`<p className="err" style=${{ marginBottom: 12 }}>${err}</p>`}
    <div className="card"><div className="bd tight"><table>
      <thead><tr><th>Prefix</th><th>Name</th><th>API type</th><th>Base URL</th><th className="r">Connections</th><th>Runtime</th><th></th></tr></thead>
      <tbody>${rows.map((p) => html`<tr key=${p.id}>
        <td className="b">${p.prefix || "—"}</td>
        <td>${p.name}</td>
        <td className="mut">${p.apiType || "—"}</td>
        <td className="mut ell">${p.baseUrl || ""}</td>
        <td className="r num">${p.active}/${p.conns}</td>
        <td><span className=${"pill " + (p.native || p.nativeAlt ? "okp" : "neup")}>${p.native || p.nativeAlt ? "native go" : "node"}</span></td>
        <td className="r" style=${{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <${ActionBtn} onClick=${() => setConnFor(p)}>connections</${ActionBtn}>
          <${ActionBtn} onClick=${() => setModal({ mode: "edit", data: { ...p } })}>edit</${ActionBtn}>
          <${ActionBtn} danger=${true} onClick=${() => del(p.id, p.prefix)}>delete</${ActionBtn}>
        </td></tr>`)}</tbody></table>
      ${rows.length === 0 && html`<div className="empty">no providers yet</div>`}
    </div></div>

    ${modal && html`<${Modal} title=${modal.mode === "new" ? "New provider" : "Edit provider"} onClose=${() => setModal(null)}
        onSave=${save} busy=${busy} error=${err}>
      <${Field} label="Prefix" hint="used in combos, e.g. gnkr/model">
        <input value=${modal.data.prefix} onInput=${(e) => setModal({ ...modal, data: { ...modal.data, prefix: e.target.value } })} />
      </${Field}>
      <${Field} label="Name"><input value=${modal.data.name}
        onInput=${(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} /></${Field}>
      <${Field} label="API type">
        <select value=${modal.data.apiType} onChange=${(e) => setModal({ ...modal, data: { ...modal.data, apiType: e.target.value } })}>
          ${["chat", "responses", "embeddings"].map((t) => html`<option key=${t} value=${t}>${t}</option>`)}
        </select></${Field}>
      <${Field} label="Base URL"><input placeholder="https://api.contoh.com/v1" value=${modal.data.baseUrl}
        onInput=${(e) => setModal({ ...modal, data: { ...modal.data, baseUrl: e.target.value } })} /></${Field}>
    </${Modal}>`}

    ${connFor && html`<${ConnectionsModal} provider=${connFor} onClose=${() => { setConnFor(null); load(); }} />`}
  </div>`;
}

function ConnectionsModal({ provider, onClose }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ apiKey: "", name: "", email: "" });
  const [bulk, setBulk] = useState("");
  const [bulkRes, setBulkRes] = useState(null);
  const [showBulk, setShowBulk] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api(`/api/providers/${provider.id}/connections`)
    .then((d) => setRows(d.connections || [])).catch((e) => setErr(e.message)), [provider.id]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    setBusy(true); setErr("");
    try { await jpost(`/api/providers/${provider.id}/connections`, form); setForm({ apiKey: "", name: "", email: "" }); load(); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const bulkAdd = async () => {
    setBusy(true); setErr(""); setBulkRes(null);
    try {
      const res = await jpost(`/api/providers/${provider.id}/connections/bulk`, { lines: bulk });
      setBulkRes(res);
      if (res.created > 0) setBulk("");
      load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const patch = async (c, body) => {
    try { await jpost(`/api/providers/${provider.id}/connections/${c.id}`, body, "PUT"); load(); } catch (e) { setErr(e.message); }
  };
  const del = async (c) => {
    if (!confirm(`Delete connection ${c.name}?`)) return;
    try { await api(`/api/providers/${provider.id}/connections/${c.id}`, { method: "DELETE" }); load(); } catch (e) { setErr(e.message); }
  };
  const replaceKey = async (c) => {
    const next = prompt(`New API key for ${c.name}:`);
    if (next) patch(c, { apiKey: next });
  };

  return html`<${Modal} wide=${true} title=${`Connections · ${provider.prefix}`} onClose=${onClose}>
    <div className="g2">
      <${Field} label="API key"><input placeholder="sk-…" value=${form.apiKey}
        onInput=${(e) => setForm({ ...form, apiKey: e.target.value })} /></${Field}>
      <${Field} label="Name"><input placeholder="opsional" value=${form.name}
        onInput=${(e) => setForm({ ...form, name: e.target.value })} /></${Field}>
    </div>
    <div style=${{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
      <button className="btn" onClick=${() => setShowBulk(!showBulk)}>${showBulk ? "tutup bulk" : "bulk add"}</button>
      <button className="btn blue" onClick=${add} disabled=${busy || !form.apiKey}>${I.plus} tambah connections</button>
    </div>
    ${showBulk && html`<div className="card" style=${{ boxShadow: "none", marginTop: 10 }}>
      <div className="hd"><h3>Bulk add</h3><span className="sub">satu credential per baris</span></div>
      <div className="bd">
        <${Field} label="Credentials" hint="format: apiKey[,name][,email][,priority] — tanpa name otomatis jadi Key 1, Key 2, … — baris # diabaikan">
          <textarea rows="7" placeholder=${"sk-aaaa\nsk-bbbb,bot-1,bob@mail,2"}
            value=${bulk} onInput=${(e) => setBulk(e.target.value)}
            style=${{ fontFamily: "ui-monospace,monospace", fontSize: 12 }} /></${Field}>
        <div style=${{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn blue" onClick=${bulkAdd} disabled=${busy || !bulk.trim()}>
            ${busy ? "…" : "import " + bulk.split("\n").filter((l) => l.trim()).length + " baris"}</button>
        </div>
        ${bulkRes && html`<p className="okmsg" style=${{ marginTop: 8 }}>
          ${bulkRes.created} dibuat · ${bulkRes.duplicates} duplikat · ${bulkRes.invalid} invalid</p>`}
      </div>
    </div>`}
    ${err && html`<p className="err">${err}</p>`}
    <div className="card" style=${{ boxShadow: "none" }}><div className="bd tight" style=${{ maxHeight: 260, overflow: "auto" }}>
      <table><thead><tr><th>Name</th><th>Key</th><th>Status</th><th className="r">Actions</th></tr></thead>
      <tbody>${rows.map((c) => html`<tr key=${c.id}>
        <td className="b">${c.name}${c.email ? html`<div className="mut" style=${{ fontWeight: 400 }}>${c.email}</div>` : null}</td>
        <td className="mut">${c.keyMasked || (c.hasOAuth ? "oauth" : "—")}</td>
        <td><span className=${"pill " + (c.isActive ? "okp" : "neup")}>${c.isActive ? "active" : "off"}</span>
          ${c.lastError && html`<div className="mut" style=${{ fontWeight: 400, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>${String(c.lastError).slice(0, 60)}</div>`}</td>
        <td className="r" style=${{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <${ActionBtn} onClick=${() => patch(c, { isActive: !c.isActive })}>${c.isActive ? "offkan" : "enable"}</${ActionBtn}>
          <${ActionBtn} onClick=${() => replaceKey(c)}>rotate key</${ActionBtn}>
          <${ActionBtn} danger=${true} onClick=${() => del(c)}>delete</${ActionBtn}>
        </td></tr>`)}</tbody></table>
      ${rows.length === 0 && html`<div className="empty">no connections yet</div>`}
    </div></div>
  </${Modal}>`;
}

/* ---------------------------------------------------------------- combos */

function Combos() {
  const [rows, setRows] = useState([]);
  const [catalog, setCatalog] = useState({ prefixes: [], combos: [] });
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState({ prefix: "", model: "" });
  const [modelOptions, setModelOptions] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const load = useCallback(() => {
    api("/api/combos").then((d) => setRows(d.combos || [])).catch((e) => setErr(e.message));
    api("/api/models/catalog").then(setCatalog).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const p = (catalog.providers || []).find((x) => x.prefix === pick.prefix);
    setModelOptions(p ? (p.models || []).map((m) => m.id) : []);
  }, [pick.prefix, catalog]);
  const refreshModels = async () => {
    if (!pick.prefix) return;
    setLoadingModels(true); setErr("");
    try {
      const d = await api(`/api/models/upstream?prefix=${encodeURIComponent(pick.prefix)}`);
      setModelOptions((d.models || []).map((m) => m.id));
      setMsg(`${d.models.length} models loaded from ${pick.prefix}`);
      api("/api/models/catalog?live=0").then(setCatalog).catch(() => {});
    } catch (e) { setErr(e.message); } finally { setLoadingModels(false); }
  };

  const save = async () => {
    setBusy(true); setErr("");
    try {
      const d = modal.data;
      const members = d.members.map((m) => m.trim()).filter(Boolean);
      if (!d.name.trim() || members.length === 0) throw new Error("name and members are required");
      if (modal.mode === "new") await jpost("/api/combos", { name: d.name.trim(), members });
      else await jpost(`/api/combos/${d.id}`, { name: d.name.trim(), members }, "PUT");
      setModal(null); setMsg("combo saved"); load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const del = async (c) => {
    if (!confirm(`Delete combo ${c.name}?`)) return;
    try { await api(`/api/combos/${c.id}`, { method: "DELETE" }); setMsg("combo deleted"); load(); } catch (e) { setErr(e.message); }
  };
  const addMember = () => {
    const raw = pick.model.trim();
    if (!raw) return;
    const member = pick.prefix && !raw.includes("/") ? `${pick.prefix}/${raw}` : raw;
    setModal({ ...modal, data: { ...modal.data, members: [...modal.data.members, member] } });
    setPick({ ...pick, model: "" });
  };

  return html`<div>
    <div className="tabsrow">
      <div className="seg"><span style=${{ padding: "6px 14px", fontSize: 13, color: "var(--t2)" }}>${rows.length} combo</span></div>
      <button className="btn blue" onClick=${() => setModal({ mode: "new", data: { name: "", members: [] } })}>${I.plus} new combo</button>
    </div>
    ${msg && html`<p className="okmsg" style=${{ marginBottom: 12 }}>${msg}</p>`}
    ${err && html`<p className="err" style=${{ marginBottom: 12 }}>${err}</p>`}
    <div className="card"><div className="bd tight"><table>
      <thead><tr><th>Combo</th><th>Members</th><th className="r">Count</th><th></th></tr></thead>
      <tbody>${rows.map((c) => html`<tr key=${c.id}>
        <td className="b">${c.name}</td>
        <td className="mut ell" title=${c.members.join(", ")}>${c.members.join(" · ")}</td>
        <td className="r num">${c.members.length}</td>
        <td className="r" style=${{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <${ActionBtn} onClick=${() => setModal({ mode: "edit", data: { id: c.id, name: c.name, members: [...c.members] } })}>edit</${ActionBtn}>
          <${ActionBtn} danger=${true} onClick=${() => del(c)}>delete</${ActionBtn}>
        </td></tr>`)}</tbody></table>
      ${rows.length === 0 && html`<div className="empty">no combos yet</div>`}
    </div></div>

    ${modal && html`<${Modal} wide=${true} title=${modal.mode === "new" ? "New combo" : "Edit combo"}
        onClose=${() => setModal(null)} onSave=${save} busy=${busy} error=${err}>
      <${Field} label="Combo name (used as the model in requests)">
        <input value=${modal.data.name} onInput=${(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} />
      </${Field}>
      <div>
        <div style=${{ fontSize: 12, fontWeight: 600, color: "var(--t2)", marginBottom: 6 }}>Members (urut failover)</div>
        <div style=${{ display: "grid", gap: 6 }}>
          ${modal.data.members.map((m, i) => html`<div key=${i} style=${{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="pill neup">${i + 1}</span>
            <input value=${m} onInput=${(e) => {
              const members = [...modal.data.members]; members[i] = e.target.value;
              setModal({ ...modal, data: { ...modal.data, members } });
            }} />
            <${ActionBtn} danger=${true} onClick=${() => setModal({ ...modal, data: { ...modal.data,
              members: modal.data.members.filter((_, j) => j !== i) } })}>×</${ActionBtn}>
          </div>`)}
          ${modal.data.members.length === 0 && html`<div className="empty">no members yet</div>`}
        </div>
      </div>
      <div className="gfilt">
        <${Field} label="Prefix">
          <select value=${pick.prefix} onChange=${(e) => setPick({ ...pick, prefix: e.target.value })}>
            <option value="">(no prefix)</option>
            ${(catalog.providers || []).filter((p) => p.prefix).map((p) => html`<option key=${p.prefix} value=${p.prefix}>${p.prefix} — ${p.name}${p.models?.length ? ` (${p.models.length} model)` : ""}</option>`)}
          </select></${Field}>
        <${Field} label="Model upstream" hint="pick from the list or type manually">
          <input list="combo-model-options" placeholder="e.g. gemini-3.8-flash-low" value=${pick.model}
            onInput=${(e) => setPick({ ...pick, model: e.target.value })}
            onKeyDown=${(e) => e.key === "Enter" && addMember()} />
          <datalist id="combo-model-options">${modelOptions.map((m) => html`<option key=${m} value=${m} />`)}</datalist>
        </${Field}>
        <div style=${{ display: "flex", gap: 6 }}>
          <button className="btn" onClick=${refreshModels} disabled=${loadingModels || !pick.prefix}
            title="fetch model list from upstream">${loadingModels ? "…" : "muat model"}</button>
          <button className="btn blue" onClick=${addMember}>${I.plus} tambah</button>
        </div>
      </div>
    </${Modal}>`}
  </div>`;
}

/* ---------------------------------------------------------------- keys */

function ModelPicker({ value, onChange }) {
  // Combos load first and on their own: the key editor only needs the combo
  // list to be useful, so the heavier model catalog is fetched lazily on focus.
  const [combos, setCombos] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [pick, setPick] = useState("");
  useEffect(() => { api("/api/combos/options").then((d) => setCombos((d.combos || []).map((c) => c.name))).catch(() => {}); }, []);
  const loadCatalog = () => {
    if (catalog) return;
    api("/api/models/catalog?live=0").then(setCatalog).catch(() => setCatalog({}));
  };
  const options = [...combos];
  for (const p of (catalog?.providers || [])) for (const m of p.models || []) options.push(`${p.prefix}/${m.id}`);
  for (const p of (catalog?.prefixes || [])) options.push(`${p}/`);
  const add = (v) => {
    v = (v || "").trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setPick("");
  };
  return html`<div>
    <div style=${{ display: "flex", gap: 6 }}>
      <input list="key-model-options" placeholder="pilih combo / model…" value=${pick}
        onFocus=${loadCatalog}
        onInput=${(e) => setPick(e.target.value)} onKeyDown=${(e) => e.key === "Enter" && (e.preventDefault(), add(pick))} />
      <button className="btn" onClick=${() => add(pick)}>${I.plus}</button>
    </div>
    <datalist id="key-model-options">${[...new Set(options)].map((o) => html`<option key=${o} value=${o} />`)}</datalist>
    ${combos.length > 0 && html`<div style=${{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      <span className="mut" style=${{ fontSize: 11, alignSelf: "center" }}>combo:</span>
      ${combos.map((c) => html`<button key=${c} className=${"pill " + (value.includes(c) ? "okp" : "neup")}
        style=${{ cursor: "pointer", border: "1px solid var(--border)" }}
        onClick=${() => value.includes(c) ? onChange(value.filter((x) => x !== c)) : add(c)}>${c}</button>`)}
    </div>`}
    <div style=${{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      ${value.length === 0 ? html`<span className="pill neup">all models allowed</span>`
        : value.map((v) => html`<span key=${v} className="pill okp" style=${{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            ${v}<button style=${{ border: 0, background: "transparent", color: "inherit", cursor: "pointer", padding: 0 }}
              onClick=${() => onChange(value.filter((x) => x !== v))}>×</button></span>`)}
    </div>
  </div>`;
}

// ShareBox renders what a key recipient needs: endpoint, credential, enabled
// models, and copy-as-text / copy-as-JSON for pasting into a chat or config.
function ShareBox({ share }) {
  const [copied, setCopied] = useState("");
  const copy = async (label, text) => {
    const ok = await copyText(text || "");
    setCopied(ok ? label : "copy gagal");
    setTimeout(() => setCopied(""), 1800);
  };
  if (!share) return null;
  return html`<div>
    <div className="eprow"><span className="lbl"><i>Base URL</i></span>
      <span className="val">${share.baseUrl}</span>
      <button className="btn sm" onClick=${() => copy("url", share.baseUrl)}>copy</button></div>
    <div className="eprow"><span className="lbl"><i>API key</i></span>
      <span className="val" style=${{ wordBreak: "break-all" }}><code>${share.key}</code></span>
      <button className="btn sm" onClick=${() => copy("key", share.key)}>copy</button></div>
    <div className="eprow"><span className="lbl"><i>Models</i></span>
      <span className="val" style=${{ whiteSpace: "normal", wordBreak: "break-word", overflow: "visible", textOverflow: "clip" }}>
        ${share.modelsUnrestricted ? "all models (no allowlist)" : (share.models || []).join(", ")}</span>
      <button className="btn sm" disabled=${!!share.modelsUnrestricted}
        onClick=${() => copy("models", (share.models || []).join(", "))}>copy</button></div>
    <div style=${{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
      <button className="btn sm" onClick=${() => copy("snippet", share.snippet)}>copy as text</button>
      <button className="btn sm" onClick=${() => copy("json", share.json)}>copy as JSON</button>
      ${copied && html`<span className="pill okp">${copied} copied</span>`}
    </div>
    <pre style=${{ margin: "10px 0 0", padding: 10, background: "var(--bg-input)", border: "1px solid var(--border)",
                    borderRadius: 8, fontSize: 11.5, overflow: "auto", whiteSpace: "pre-wrap" }}>${share.snippet}</pre>
  </div>`;
}

function Keys() {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const [created, setCreated] = useState(null);   // {key, share}
  const [share, setShare] = useState(null);       // share payload of one key
  const [quota, setQuota] = useState(null);       // quota payload of one key
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({ count: 5, namePrefix: "bot", tokenLimit: "", allowedModels: [] });
  const [bulkRes, setBulkRes] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [ep, setEp] = useState(null);
  const [copiedEp, setCopiedEp] = useState(false);
  const localURL = location.origin + "/v1";

  const load = useCallback(() => api("/api/keys").then((d) => setRows(d.keys || [])).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { api("/api/tunnel/status").then(setEp).catch(() => {}); }, []);

  const [copied, setCopied] = useState(null);
  const copyKey = async (k) => {
    try {
      const res = await api(`/api/keys/${k.id}/reveal`);
      if (await copyText(res.key)) { setCopied(k.id); setTimeout(() => setCopied(null), 1600); }
      else setErr("copy failed — clipboard blocked by the browser");
    } catch (e) { setErr(e.message); }
  };

  const save = async () => {
    setBusy(true); setErr("");
    try {
      if (modal.mode === "new") {
        const res = await jpost("/api/keys", { name: modal.data.name,
          tokenLimit: modal.data.tokenLimit ? +modal.data.tokenLimit : null,
          allowedModels: modal.data.allowedModels || [] });
        setCreated(res);
      } else {
        await jpost(`/api/keys/${modal.data.id}`, {
          name: modal.data.name, isActive: modal.data.isActive,
          tokenLimit: modal.data.tokenLimit ? +modal.data.tokenLimit : null,
          allowedModels: modal.data.allowedModels || [],
        }, "PUT");
      }
      setModal(null); setMsg("key saved"); load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const del = async (k) => {
    if (!confirm(`Delete key ${k.name}?`)) return;
    try { await api(`/api/keys/${k.id}`, { method: "DELETE" }); setMsg("key deleted"); load(); } catch (e) { setErr(e.message); }
  };
  const toggle = async (k) => {
    try { await jpost(`/api/keys/${k.id}`, { isActive: !k.isActive }, "PUT"); load(); } catch (e) { setErr(e.message); }
  };
  const openShare = async (k) => {
    try { setShare(await api(`/api/keys/${k.id}/share`)); } catch (e) { setErr(e.message); }
  };
  const openQuota = async (k) => {
    try { setQuota(await api(`/api/keys/${k.id}/quota?hours=24`)); } catch (e) { setErr(e.message); }
  };
  const saveBulk = async () => {
    setBusy(true); setErr(""); setBulkRes(null);
    try {
      const res = await jpost("/api/keys/bulk", {
        count: +bulkForm.count || 0,
        namePrefix: bulkForm.namePrefix,
        tokenLimit: bulkForm.tokenLimit ? +bulkForm.tokenLimit : null,
        allowedModels: bulkForm.allowedModels || [],
      });
      setBulkRes(res); setMsg(`${res.count} key dibuat`); load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return html`<div>
    <div className="card" style=${{ marginBottom: 16 }}>
      <div className="hd"><h3>API Endpoint</h3><span className="sub">base URL OpenAI-compatible untuk semua client</span></div>
      <div className="bd">
        <div className="eprow">
          <span className="lbl"><i>Local</i></span>
          <span className="val" title=${localURL}>${localURL}</span>
          <button className="btn sm" onClick=${async () => {
            if (await copyText(localURL)) { setCopiedEp(true); setTimeout(() => setCopiedEp(false), 1600); }
          }}>${copiedEp ? "copied" : "copy"}</button>
        </div>
        ${[["Tunnel", ep?.cloudflare], ["Tailscale", ep?.tailscale]].map(([label, p]) => html`<div className="eprow" key=${label}>
          <span className="lbl"><i>${label}</i></span>
          <span className="val" title=${p?.configured || ""}>${p?.configured || "belum dikonfigurasi"}</span>
          ${p?.configured
            ? html`<span className=${"pill " + (p.alive ? "okp" : p.processUp ? "warnp" : "badp")}>
                ${p.alive ? `up · ${p.status}` : p.processUp ? "process up, unreachable" : "off"}</span>`
            : html`<span className="pill neup">not set</span>`}
        </div>`)}
        <div className="mut" style=${{ fontSize: 11, marginTop: 10 }}>
          ${ep?.publicHint ? `tunnel harus mengarah ke ${String(ep.publicHint).replace(/^point the tunnel at\s*/i, "")}` : "atur tunnelUrl / TAILSCALE_URL di setelan untuk mengisi baris di atas"}
        </div>
      </div>
    </div>
    ${msg && html`<p className="okmsg" style=${{ marginBottom: 12 }}>${msg}</p>`}
    ${err && html`<p className="err" style=${{ marginBottom: 12 }}>${err}</p>`}
    ${created && html`<div className="card" style=${{ marginBottom: 16 }}>
      <div className="hd"><h3>New key — ready to share</h3>
        <div style=${{ display: "flex", gap: 6, marginLeft: "auto" }}>
          <button className="btn sm" onClick=${async () => {
            if (await copyText(created.key)) setMsg("key copied");
            else setErr("copy failed — clipboard blocked by the browser");
          }}>copy key</button>
          <button className="btn sm" onClick=${() => setCreated(null)}>close</button>
        </div></div>
      <div className="bd"><${ShareBox} share=${created.share} /></div>
    </div>`}
    <div className="card">
      <div className="hd">
        <div>
          <h3>API Keys</h3>
          <div className="sub" style=${{ marginTop: 2 }}>${rows.length} key · token quota per key</div>
        </div>
        <div style=${{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn" onClick=${() => { setBulkOpen(true); setBulkRes(null); }}>bulk add</button>
          <button className="btn blue"
            onClick=${() => setModal({ mode: "new", data: { name: "", tokenLimit: "", allowedModels: [] } })}>${I.plus} Create key</button>
        </div>
      </div>
      <div className="bd tight"><table className="tbl-keys">
      <thead><tr><th>Name</th><th>Key</th><th>Allowed models</th><th className="r">Used / Remaining</th><th>Status</th><th className="r">Aksi</th></tr></thead>
      <tbody>${rows.map((k) => html`<tr key=${k.id}>
        <td className="b">${k.name || "—"}</td>
        <td className="mut"><div style=${{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style=${{ fontFamily: "ui-monospace,monospace", fontSize: 12 }}>${k.keyMasked}</span>
          <${ActionBtn} onClick=${() => copyKey(k)}>${copied === k.id ? "copied" : "copy"}</${ActionBtn}>
        </div></td>
        <td className="mut"><div title=${(k.allowedModels || []).join(", ")}
          style=${{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          ${(k.allowedModels || []).length ? k.allowedModels.join(" · ") : "all"}</div></td>
        <td className="r num">${fmt(k.used)}
          <div className="mut" style=${{ fontSize: 10, color: k.hasLimit && k.remaining === 0 ? "var(--red)" : "var(--t3)" }}>
            ${k.hasLimit ? "sisa " + fmt(k.remaining) + " / " + fmt(k.tokenLimit) : "unlimited"}</div></td>
        <td><span className=${"pill " + (k.isActive ? "okp" : "neup")}>${k.isActive ? "active" : "off"}</span></td>
        <td className="r" style=${{ display: "flex", gap: 4, justifyContent: "flex-end", alignItems: "center", whiteSpace: "nowrap" }}>
          <${Toggle} checked=${!!k.isActive} onChange=${() => toggle(k)} label=${k.isActive ? "disable" : "enable"} />
          <${ActionBtn} title="rincian token per model" onClick=${() => openQuota(k)}>∑</${ActionBtn}>
          <${ActionBtn} title="share: base URL + key + model" onClick=${() => openShare(k)}>↗</${ActionBtn}>
          <${ActionBtn} title="edit key" onClick=${() => setModal({ mode: "edit", data: { ...k, tokenLimit: k.tokenLimit || "", allowedModels: k.allowedModels || [] } })}>✎</${ActionBtn}>
          <${ActionBtn} title="hapus key" danger=${true} onClick=${() => del(k)}>✕</${ActionBtn}>
        </td></tr>`)}</tbody></table>
      ${rows.length === 0 && html`<div className="empty">no keys yet</div>`}
    </div></div>
    <div className="card" style=${{ marginTop: 0 }}><div className="kcards">
      ${rows.map((k) => html`<div className="kcard" key=${k.id}>
        <div className="kchd"><b>${k.name || "—"}</b>
          <span className=${"pill " + (k.isActive ? "okp" : "neup")}>${k.isActive ? "active" : "off"}</span></div>
        <div className="kckey"><code>${k.keyMasked}</code>
          <${ActionBtn} onClick=${() => copyKey(k)}>${copied === k.id ? "copied" : "copy"}</${ActionBtn}></div>
        <div className="kcmeta"><b>Allowed models:</b> ${(k.allowedModels || []).length ? k.allowedModels.join(" · ") : "all"}</div>
        <div className="kcmeta"><b>Used:</b> ${fmt(k.used)} · <b>Remaining:</b> ${k.hasLimit ? fmt(k.remaining) : "∞"} · <b>Limit:</b> ${k.tokenLimit ? fmt(k.tokenLimit) : "∞"}</div>
        <div className="kcact">
          <${ActionBtn} onClick=${() => toggle(k)}>${k.isActive ? "disable" : "enable"}</${ActionBtn}>
          <${ActionBtn} onClick=${() => openQuota(k)}>quota</${ActionBtn}>
          <${ActionBtn} onClick=${() => openShare(k)}>share</${ActionBtn}>
          <${ActionBtn} onClick=${() => setModal({ mode: "edit", data: { ...k, tokenLimit: k.tokenLimit || "", allowedModels: k.allowedModels || [] } })}>edit</${ActionBtn}>
          <${ActionBtn} danger=${true} onClick=${() => del(k)}>delete</${ActionBtn}>
        </div></div>`)}
      ${rows.length === 0 && html`<div className="empty">no keys yet</div>`}
    </div></div>

    ${modal && html`<${Modal} title=${modal.mode === "new" ? "New key" : "Edit key"} onClose=${() => setModal(null)}
        onSave=${save} busy=${busy} error=${err}>
      <${Field} label="Name"><input value=${modal.data.name}
        onInput=${(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} /></${Field}>
      <${Field} label="Limit token" hint="leave empty for unlimited">
        <input type="number" min="0" value=${modal.data.tokenLimit}
          onInput=${(e) => setModal({ ...modal, data: { ...modal.data, tokenLimit: e.target.value } })} /></${Field}>
      <${Field} label="Allowed models" hint="empty = all models">
        <${ModelPicker} value=${modal.data.allowedModels || []}
          onChange=${(v) => setModal({ ...modal, data: { ...modal.data, allowedModels: v } })} /></${Field}>
    </${Modal}>`}
    ${bulkOpen && html`<${Modal} title="Bulk add keys" onClose=${() => setBulkOpen(false)}
        onSave=${saveBulk} saveLabel="create" busy=${busy} error=${err} wide=${true}>
      <div className="g2">
        <${Field} label="Jumlah key" hint="1 – 1000">
          <input type="number" min="1" max="1000" value=${bulkForm.count}
            onInput=${(e) => setBulkForm({ ...bulkForm, count: e.target.value })} /></${Field}>
        <${Field} label="Prefix nama" hint="jadi prefix-01, prefix-02, …">
          <input value=${bulkForm.namePrefix}
            onInput=${(e) => setBulkForm({ ...bulkForm, namePrefix: e.target.value })} /></${Field}>
      </div>
      <${Field} label="Limit token per key" hint="kosong = unlimited">
        <input type="number" min="0" value=${bulkForm.tokenLimit}
          onInput=${(e) => setBulkForm({ ...bulkForm, tokenLimit: e.target.value })} /></${Field}>
      <${Field} label="Allowed models" hint="berlaku untuk semua key di batch; kosong = all">
        <${ModelPicker} value=${bulkForm.allowedModels}
          onChange=${(v) => setBulkForm({ ...bulkForm, allowedModels: v })} /></${Field}>
      ${bulkRes && html`<div style=${{ marginTop: 8 }}>
        <div style=${{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <b style=${{ fontSize: 13 }}>${bulkRes.count} key dibuat</b>
          <button className="btn sm" style=${{ marginLeft: "auto" }}
            onClick=${async () => { if (await copyText(bulkRes.keysText)) setMsg(bulkRes.count + " key copied"); }}>
            copy semua</button>
        </div>
        <textarea readOnly rows="6" value=${bulkRes.keysText}
          style=${{ fontFamily: "ui-monospace,monospace", fontSize: 12 }} />
      </div>`}
    </${Modal}>`}
    ${share && html`<${Modal} title=${"Share key " + (share.name || "")} onClose=${() => setShare(null)} wide=${true}>
      <p className="mut" style=${{ marginTop: 0, fontSize: 12 }}>
        Kirim blok ini ke pemakai key: base URL, key, dan model yang di-enable.
      </p>
      <${ShareBox} share=${share} />
    </${Modal}>`}
    ${quota && html`<${Modal} title=${"Token remaining · " + (quota.name || "")} onClose=${() => setQuota(null)} wide=${true}>
      <div style=${{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button className="btn sm" onClick=${() => {
          try { sessionStorage.setItem("qz.keyId", quota.id); } catch (e) {}
          setQuota(null); location.hash = "keyusage";
        }}>buka halaman Key Usage</button>
      </div>
      <div className="grid4" style=${{ marginBottom: 12 }}>
        <${StatCard} label="Used" value=${fmt(quota.used)} />
        <${StatCard} label="Remaining" color="c3" value=${quota.hasLimit ? fmt(quota.remaining) : "∞"} />
        <${StatCard} label="Limit" value=${quota.tokenLimit ? fmt(quota.tokenLimit) : "∞"} />
        <${StatCard} label="24h requests" color="c2" value=${fmt(quota.requests)} caption=${`${fmt(quota.failed)} failed`} />
      </div>
      <div className="bar" style=${{ marginBottom: 10 }}><i className=${quota.percent > 90 ? "hi" : ""} style=${{ width: Math.min(100, quota.percent || 0) + "%" }} /></div>
      <div className="mut" style=${{ fontSize: 11, marginBottom: 12 }}>
        ${quota.hasLimit ? `${(quota.percent || 0).toFixed(1)}% terpakai` : "tanpa limit"} ·
        lifetime ${compact(quota.lifetimeTokens || 0)} token ·
        window ${compact((quota.promptTokens || 0) + (quota.completionTokens || 0))} token
      </div>
      <table>
        <thead><tr><th>Model</th><th className="r">Req</th><th className="r">In</th><th className="r">Out</th><th className="r">Last seen</th></tr></thead>
        <tbody>${(quota.byModel || []).map((m) => html`<tr key=${m.model}>
          <td className="b ell" title=${m.model}>${m.model}</td>
          <td className="r num">${fmt(m.requests)}</td>
          <td className="r num">${compact(m.promptTokens)}</td>
          <td className="r num">${compact(m.completionTokens)}</td>
          <td className="r mut">${m.lastSeen ? ago(m.lastSeen) : "—"}</td></tr>`)}</tbody>
      </table>
      ${(quota.byModel || []).length === 0 && html`<div className="empty">belum ada pemakaian 24 jam terakhir</div>`}
    </${Modal}>`}
  </div>`;
}

/* ---------------------------------------------------------------- quota */

function Quota() {
  const [data, setData] = useState(null);
  useEffect(() => { api("/api/quota").then(setData).catch(() => setData({ keys: [], connections: [] })); }, []);
  if (!data) return html`<div className="empty">loading…</div>`;
  const limited = (data.connections || []).filter((c) => c.lastError || c.backoffLevel || c.locks > 0);
  return html`<div>
    <div className="card" style=${{ marginBottom: 16 }}>
      <div className="hd"><h3>Key quotas</h3><span className="sub">${data.keys.length} key</span></div>
      <div className="bd tight"><table>
        <thead><tr><th>Name</th><th style=${{ width: "32%" }}>Usage</th><th className="r">Used</th><th className="r">Remaining</th><th className="r">Limit</th><th>Status</th></tr></thead>
        <tbody>${data.keys.map((k) => html`<tr key=${k.id}>
          <td className="b">${k.name || "—"}</td>
          <td>
            <div className="bar"><i className=${k.percent > 90 ? "hi" : ""} style=${{ width: Math.min(100, k.percent || 0) + "%" }} /></div>
            <div className="mut" style=${{ fontSize: 11, marginTop: 4 }}>
              ${k.tokenLimit ? `${(k.percent || 0).toFixed(1)}% used` : "no limit"}
            </div>
          </td>
          <td className="r num">${fmt(k.used)}</td>
          <td className="r num" style=${{ color: k.tokenLimit && k.tokenLimit - k.used < k.tokenLimit * 0.1 ? "var(--red)" : "var(--green)" }}>
            ${k.tokenLimit ? fmt(Math.max(0, k.tokenLimit - k.used)) : "∞"}</td>
          <td className="r num">${k.tokenLimit ? fmt(k.tokenLimit) : "∞"}</td>
          <td><span className=${"pill " + (k.isActive ? "okp" : "neup")}>${k.isActive ? "active" : "off"}</span></td>
        </tr>`)}</tbody></table>
        ${data.keys.length === 0 && html`<div className="empty">no keys yet</div>`}
      </div>
    </div>
    <div className="card">
      <div className="hd"><h3>Connection problem</h3><span className="sub">${limited.length} of ${data.connections.length}</span></div>
      <div className="bd tight"><table>
        <thead><tr><th>Provider</th><th>Connections</th><th className="r">Lock</th><th className="r">Backoff</th><th>Rate limit</th><th>Last error</th></tr></thead>
        <tbody>${limited.slice(0, 60).map((c) => html`<tr key=${c.id}>
          <td className="mut ell" title=${c.provider}>${shortProv(c.provider)}</td>
          <td className="b">${c.name}</td>
          <td className="r num">${c.locks || 0}</td>
          <td className="r num">${c.backoffLevel || 0}</td>
          <td className="mut">${c.rateLimitedUntil ? ago(c.rateLimitedUntil) : "—"}</td>
          <td className="mut ell" title=${String(c.lastError || "")}>${String(c.lastError || "").slice(0, 60)}</td>
        </tr>`)}</tbody></table>
        ${limited.length === 0 && html`<div className="empty">all connections healthy</div>`}
      </div>
    </div>
  </div>`;
}

/* ---------------------------------------------------------------- key usage */

function KeyUsage() {
  const [keys, setKeys] = useState([]);
  const [sel, setSel] = useState(() => { try { return sessionStorage.getItem("qz.keyId") || ""; } catch (e) { return ""; } });
  const [hours, setHours] = useState(24);
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [allRecent, setAllRecent] = useState(false);

  useEffect(() => {
    api("/api/keys").then((r) => {
      const ks = r.keys || [];
      setKeys(ks);
      setSel((cur) => cur || (ks[0] && ks[0].id) || "");
    }).catch((e) => setErr(e.message));
  }, []);

  const load = useCallback(() => {
    if (!sel) return;
    api(`/api/key-trace?hours=${hours}&id=${encodeURIComponent(sel)}`)
      .then(setD).catch((e) => setErr(e.message));
  }, [sel, hours]);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);
  useEffect(() => { try { if (sel) sessionStorage.setItem("qz.keyId", sel); } catch (e) {} setD(null); }, [sel, hours]);

  const q = (d && d.quota) || {};
  const totals = (d && d.totals) || {};
  const byModel = (d && d.byModel) || [];
  const daily = (d && d.daily) || [];
  const recentAll = (d && d.recent) || [];
  const recent = allRecent ? recentAll : recentAll.slice(0, 12);
  const pct = Math.min(100, q.percent || 0);
  const maxDay = Math.max(1, ...daily.map((x) => (x.promptTokens || 0) + (x.completionTokens || 0)));

  return html`<div>
    <div className="card" style=${{ marginBottom: 16 }}>
      <div className="hd">
        <div>
          <h3>Key token usage</h3>
          <span className="sub">pilih key, lihat sisa token, pemakaian per model, dan request terakhir</span>
        </div>
        <div style=${{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <select value=${sel} onChange=${(e) => setSel(e.target.value)} style=${{ minWidth: 220 }}>
            ${keys.map((k) => html`<option key=${k.id} value=${k.id}>
              ${(k.name || k.keyMasked) + (k.isActive ? "" : " (off)")}</option>`)}
          </select>
          <div className="seg">${[24, 168, 720].map((h) => html`<button key=${h} aria-pressed=${hours === h}
            onClick=${() => setHours(h)}>${h === 24 ? "24h" : h === 168 ? "7D" : "30D"}</button>`)}</div>
        </div>
      </div>
      <div className="bd">
        ${err && html`<p className="err" style=${{ marginBottom: 10 }}>${err}</p>`}
        ${!d ? html`<div className="empty">loading…</div>` : html`<div>
          <div className="grid4" style=${{ marginBottom: 12 }}>
            <${StatCard} label="Token terpakai" value=${fmt(q.used || 0)}
              caption=${q.hasLimit ? "dari " + fmt(q.tokenLimit) : "tanpa limit"} />
            <${StatCard} label="Sisa token" color="c3" value=${q.hasLimit ? fmt(q.remaining || 0) : "∞"}
              caption=${q.hasLimit ? (100 - pct).toFixed(1) + "% tersisa" : "unlimited"} />
            <${StatCard} label=${`Request ${hours === 24 ? "24h" : hours === 168 ? "7D" : "30D"}`} color="c2"
              value=${fmt(totals.requests || 0)} caption=${`${fmt(totals.failed || 0)} gagal`} />
            <${StatCard} label="Lifetime token" value=${compact(totals.lifetimeTokens || 0)}
              caption=${(d.key && d.key.masked) || ""} />
          </div>
          <div className="bar" style=${{ marginBottom: 6 }}>
            <i className=${pct > 90 ? "hi" : ""} style=${{ width: pct + "%" }} /></div>
          <div className="mut" style=${{ fontSize: 11, marginBottom: 14 }}>
            ${q.hasLimit ? `${pct.toFixed(1)}% dari ${fmt(q.tokenLimit)} token` : "tanpa limit"} ·
            window ${compact((totals.promptTokens || 0) + (totals.completionTokens || 0))} token
            ${(q.allowedModels || []).length
              ? html` · <span title=${(q.allowedModels || []).join(", ")}>${(q.allowedModels || []).length} model diizinkan</span>`
              : html` · semua model`}
          </div>

          <div className="cols">
            <div className="card" style=${{ boxShadow: "none" }}>
              <div className="hd"><h3>Per model</h3><span className="sub">${byModel.length} model</span></div>
              <div className="bd tight">
                <table>
                  <thead><tr><th>Model</th><th className="r">Req</th><th className="r">In</th><th className="r">Out</th><th className="r">Last</th></tr></thead>
                  <tbody>${byModel.map((m) => html`<tr key=${m.model}>
                    <td className="b ell" title=${m.model}>${m.model}</td>
                    <td className="r num">${fmt(m.requests)}</td>
                    <td className="r num" style=${{ color: "var(--blue)" }}>${compact(m.promptTokens)}</td>
                    <td className="r num" style=${{ color: "var(--green)" }}>${compact(m.completionTokens)}</td>
                    <td className="r mut">${m.lastSeen ? ago(m.lastSeen) : "—"}</td></tr>`)}</tbody>
                </table>
                ${byModel.length === 0 && html`<div className="empty">belum ada pemakaian di window ini</div>`}
              </div>
            </div>
            <div className="card" style=${{ boxShadow: "none" }}>
              <div className="hd"><h3>Harian</h3><span className="sub">token per hari</span></div>
              <div className="bd">
                ${daily.length < 2
                  ? html`<div className="empty">
                      ${daily.length === 0
                        ? "belum ada data harian di window ini"
                        : "baru satu hari data — grafik harian muncul setelah 2 hari pemakaian"}</div>`
                  : html`<div style=${{ display: "flex", alignItems: "flex-end", gap: 6, height: 132 }}>
                    ${daily.map((x) => {
                      const t = (x.promptTokens || 0) + (x.completionTokens || 0);
                      return html`<div key=${x.day} title=${`${x.day} · ${fmt(x.requests)} req · ${compact(t)} token`}
                        style=${{ flex: 1, maxWidth: 64, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 4 }}>
                        <div className="mut num" style=${{ fontSize: 9, textAlign: "center" }}>${compact(t)}</div>
                        <div style=${{ height: Math.max(3, Math.round((t / maxDay) * 92)) + "px",
                                        background: "var(--blue)", borderRadius: 4, opacity: 0.85 }} />
                        <div className="mut" style=${{ fontSize: 9, textAlign: "center" }}>${String(x.day).slice(5)}</div>
                      </div>`;
                    })}
                  </div>`}
              </div>
            </div>
          </div>

          <div className="card" style=${{ boxShadow: "none", marginTop: 16 }}>
            <div className="hd"><h3>Recent requests</h3><span className="sub">${recent.length} dari ${recentAll.length}</span></div>
            <div className="bd tight">
              <table>
                <thead><tr><th style=${{ width: 14 }}></th><th>Model</th><th>Provider</th>
                  <th className="r">In / Out</th><th className="r">Latency</th><th className="r">When</th></tr></thead>
                <tbody>${recent.map((r, i) => html`<tr key=${i}>
                  <td style=${{ width: 14, paddingRight: 0 }}>
                    <i className="dot" title=${(r.promptTokens || 0) + (r.completionTokens || 0) === 0 ? "0 token" : r.status}
                      style=${{ background: !["success", "ok", "200"].includes(r.status) ? "#EF4444"
                        : ((r.promptTokens || 0) + (r.completionTokens || 0) === 0 ? "var(--track)" : "#22C55E") }} /></td>
                  <td className="b ell" title=${r.model}>${r.model}</td>
                  <td className="mut ell">${shortProv(r.provider) || "—"}</td>
                  <td className="r num" style=${{ fontSize: 11 }}>${compact(r.promptTokens)} / ${compact(r.completionTokens)}</td>
                  <td className="r num">${r.latencyMs ? fmtMs(r.latencyMs) : "—"}</td>
                  <td className="r mut">${ago(r.timestamp)}</td></tr>`)}</tbody>
              </table>
              ${recentAll.length === 0 && html`<div className="empty">belum ada request tercatat</div>`}
              ${recentAll.length > recent.length && html`<div style=${{ padding: "10px 16px 14px" }}>
                <button className="btn sm" onClick=${() => setAllRecent(true)}>
                  tampilkan ${recentAll.length - recent.length} request lain</button>
              </div>`}
            </div>
          </div>
        </div>`}
      </div>
    </div>
  </div>`;
}

/* ---------------------------------------------------------------- token saver */

function TokenSaver() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const load = useCallback(() => api("/api/token-saver").then(setData).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const patch = async (body) => {
    setErr(""); setMsg("");
    try { await jpost("/api/settings", body, "PATCH"); setMsg("disave"); load(); }
    catch (e) { setErr(e.message); }
  };
  if (!data) return html`<div className="empty">loading…</div>`;
  return html`<div className="cols">
    <div className="card">
      <div className="hd"><h3>Token saver</h3><span className="sub">injeksi system prompt</span></div>
      <div className="bd">
        <div className="switch">
          <input type="checkbox" checked=${!!data.cavemanEnabled} onChange=${(e) => patch({ cavemanEnabled: e.target.checked })} />
          <div><div className="b">Caveman</div>
            <div className="mut" style=${{ fontWeight: 400, fontSize: 12 }}>Ringkas gaya jawaban (${data.cavemanChars} char prompt)</div></div>
        </div>
        <select value=${data.cavemanLevel || "ultra"} onChange=${(e) => patch({ cavemanLevel: e.target.value })}>
          ${["lite", "full", "ultra"].map((l) => html`<option key=${l} value=${l}>${l}</option>`)}
        </select>
        <div className="switch" style=${{ marginTop: 12 }}>
          <input type="checkbox" checked=${!!data.ponytailEnabled} onChange=${(e) => patch({ ponytailEnabled: e.target.checked })} />
          <div><div className="b">Ponytail</div>
            <div className="mut" style=${{ fontWeight: 400, fontSize: 12 }}>Gaya coding minimal (${data.ponytailChars} char prompt)</div></div>
        </div>
        <select value=${data.ponytailLevel || "ultra"} onChange=${(e) => patch({ ponytailLevel: e.target.value })}>
          ${["lite", "full", "ultra"].map((l) => html`<option key=${l} value=${l}>${l}</option>`)}
        </select>
        ${msg && html`<p className="okmsg" style=${{ marginTop: 12 }}>${msg}</p>`}
        ${err && html`<p className="err" style=${{ marginTop: 12 }}>${err}</p>`}
      </div>
    </div>
    <div className="card">
      <div className="hd"><h3>Ringkasan</h3></div>
      <div className="bd">
        <div className="kv"><span className="mut">Caveman</span><span className="b">${data.cavemanEnabled ? data.cavemanLevel : "off"}</span></div>
        <div className="kv"><span className="mut">Ponytail</span><span className="b">${data.ponytailEnabled ? data.ponytailLevel : "off"}</span></div>
        <div className="kv"><span className="mut">System prompt per model</span><span className="b">${data.systemPromptCount} entri</span></div>
        <div className="kv"><span className="mut">Total prompt injeksi</span><span className="b">${fmt((data.cavemanChars || 0) + (data.ponytailChars || 0))} char</span></div>
      </div>
    </div>
  </div>`;
}

/* ---------------------------------------------------------------- system prompts */

function SystemPrompts() {
  const [rows, setRows] = useState([]);
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const load = useCallback(() => api("/api/system-prompts").then((d) => setRows(d.prompts || [])).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setErr("");
    try {
      await jpost("/api/system-prompts", { model: edit.model, text: edit.text }, "PUT");
      setEdit(null); setMsg("system prompt saved"); load();
    } catch (e) { setErr(e.message); }
  };

  return html`<div>
    ${msg && html`<p className="okmsg" style=${{ marginBottom: 12 }}>${msg}</p>`}
    ${err && html`<p className="err" style=${{ marginBottom: 12 }}>${err}</p>`}
    <div className="tabsrow">
      <div className="seg"><span style=${{ padding: "6px 14px", fontSize: 13, color: "var(--t2)" }}>${rows.length} model</span></div>
      <button className="btn blue" onClick=${() => setEdit({ model: "", text: "" })}>${I.plus} prompt baru</button>
    </div>
    <div className="card"><div className="bd tight"><table>
      <thead><tr><th>Model / combo</th><th className="r">Panjang</th><th>Cuplikan</th><th></th></tr></thead>
      <tbody>${rows.map((p) => html`<tr key=${p.model}>
        <td className="b">${p.model}</td>
        <td className="r num">${fmt(p.chars)}</td>
        <td className="mut ell" title=${p.text}>${(p.text || "").slice(0, 90)}</td>
        <td className="r" style=${{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <${ActionBtn} onClick=${() => setEdit({ ...p })}>edit</${ActionBtn}>
          <${ActionBtn} danger=${true} onClick=${async () => {
            if (!confirm(`Delete prompt for ${p.model}?`)) return;
            await jpost("/api/system-prompts", { model: p.model, text: "" }, "PUT"); load();
          }}>delete</${ActionBtn}>
        </td></tr>`)}</tbody></table>
      ${rows.length === 0 && html`<div className="empty">no per-model system prompts yet</div>`}
    </div></div>

    ${edit && html`<${Modal} wide=${true} title="System prompt per model" onClose=${() => setEdit(null)} onSave=${save} error=${err}>
      <${Field} label="Model / combo"><input value=${edit.model} onInput=${(e) => setEdit({ ...edit, model: e.target.value })} /></${Field}>
      <${Field} label="Prompt body" hint="clear it and save to delete">
        <textarea style=${{ minHeight: 220 }} value=${edit.text} onInput=${(e) => setEdit({ ...edit, text: e.target.value })} /></${Field}>
    </${Modal}>`}
  </div>`;
}

/* ---------------------------------------------------------------- proxy pools */

function ProxyPools() {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api("/api/proxy-pools").then((d) => setRows(d.pools || [])).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setBusy(true); setErr("");
    try {
      if (modal.mode === "new") await jpost("/api/proxy-pools", modal.data);
      else await jpost(`/api/proxy-pools/${modal.data.id}`, modal.data, "PUT");
      setModal(null); setMsg("pool saved"); load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const del = async (p) => {
    if (!confirm(`Delete pool ${p.name}?`)) return;
    try { await api(`/api/proxy-pools/${p.id}`, { method: "DELETE" }); setMsg("pool deleted"); load(); } catch (e) { setErr(e.message); }
  };
  return html`<div>
    <div className="tabsrow">
      <div className="seg"><span style=${{ padding: "6px 14px", fontSize: 13, color: "var(--t2)" }}>${rows.length} pool</span></div>
      <button className="btn blue" onClick=${() => setModal({ mode: "new", data: { name: "", proxyUrl: "", type: "custom" } })}>${I.plus} pool baru</button>
    </div>
    ${msg && html`<p className="okmsg" style=${{ marginBottom: 12 }}>${msg}</p>`}
    ${err && html`<p className="err" style=${{ marginBottom: 12 }}>${err}</p>`}
    <div className="card"><div className="bd tight"><table>
      <thead><tr><th>Name</th><th>Proxy URL</th><th>Type</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows.map((p) => html`<tr key=${p.id}>
        <td className="b">${p.name || "—"}</td>
        <td className="mut ell">${p.proxyUrl || ""}</td>
        <td className="mut">${p.type || "—"}</td>
        <td><span className=${"pill " + (p.isActive ? "okp" : "neup")}>${p.isActive ? (p.testStatus || "active") : "off"}</span></td>
        <td className="r" style=${{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <${ActionBtn} onClick=${() => setModal({ mode: "edit", data: { ...p } })}>edit</${ActionBtn}>
          <${ActionBtn} danger=${true} onClick=${() => del(p)}>delete</${ActionBtn}>
        </td></tr>`)}</tbody></table>
      ${rows.length === 0 && html`<div className="empty">no proxy pools yet</div>`}
    </div></div>
    ${modal && html`<${Modal} title=${modal.mode === "new" ? "New proxy pool" : "Edit pool"} onClose=${() => setModal(null)}
        onSave=${save} busy=${busy} error=${err}>
      <${Field} label="Name"><input value=${modal.data.name || ""} onInput=${(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} /></${Field}>
      <${Field} label="Proxy URL"><input placeholder="https://relay.contoh.workers.dev" value=${modal.data.proxyUrl || ""}
        onInput=${(e) => setModal({ ...modal, data: { ...modal.data, proxyUrl: e.target.value } })} /></${Field}>
      <${Field} label="Type"><input value=${modal.data.type || ""} onInput=${(e) => setModal({ ...modal, data: { ...modal.data, type: e.target.value } })} /></${Field}>
    </${Modal}>`}
  </div>`;
}

/* ---------------------------------------------------------------- console */

function ConsoleLogs() {
  const [rows, setRows] = useState([]);
  const [onlyErr, setOnlyErr] = useState(false);
  const [auto, setAuto] = useState(true);
  const load = useCallback(() => api(`/api/logs?limit=120${onlyErr ? "&errors=1" : ""}`)
    .then((d) => setRows(d.entries || [])).catch(() => {}), [onlyErr]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [auto, load]);
  return html`<div>
    <div className="tabsrow">
      <div className="seg">
        <button aria-pressed=${!onlyErr} onClick=${() => setOnlyErr(false)}>All</button>
        <button aria-pressed=${onlyErr} onClick=${() => setOnlyErr(true)}>Error saja</button>
      </div>
      <div style=${{ display: "flex", gap: 10, alignItems: "center" }}>
        <label style=${{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, color: "var(--t2)" }}>
          <input type="checkbox" style=${{ width: "auto" }} checked=${auto} onChange=${(e) => setAuto(e.target.checked)} /> auto 5s
        </label>
        <button className="btn" onClick=${load}>${I.refresh} muat</button>
      </div>
    </div>
    <div className="card"><div className="bd" style=${{ maxHeight: "70vh", overflow: "auto",
        fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 12, lineHeight: 1.7 }}>
      ${rows.length === 0 && html`<div className="empty">no logs yet</div>`}
      ${rows.map((r, i) => {
        const ok = ["success", "ok", "200"].includes(r.status);
        const t = new Date(r.timestamp).toLocaleTimeString("id-ID", { hour12: false });
        const bits = [];
        if (r.stream) bits.push("STREAM");
        if (r.messages) bits.push(`${r.messages} MSG`);
        if (r.tools) bits.push(`${r.tools} TOOL`);
        if (r.think) bits.push(`THINK:${r.think}`);
        if (r.keyName) bits.push(`ACC:${r.keyName}`);
        if (r.latencyMs) bits.push(fmtMs(r.latencyMs));
        return html`<div key=${i} style=${{ padding: "6px 0", borderTop: i ? "1px solid var(--line-soft)" : "none" }}>
          <div>
            <span className="mut">[${t}]</span> ${ok ? "🟢" : "🔴"}
            <span className="b"> ${r.model}</span>
            <span className="mut"> · ${shortProv(r.provider)}</span>
            ${bits.length ? html`<span className="mut"> · ${bits.join(" · ")}</span>` : null}
            <span style=${{ float: "right", color: "var(--blue)" }}>${fmt(r.promptTokens)}↑</span>
            <span style=${{ float: "right", color: "var(--green)", marginRight: 10 }}>${fmt(r.completionTokens)}↓</span>
          </div>
          ${r.injected && r.injected.length ? html`<div className="mut" style=${{ paddingLeft: 18 }}>
            ⚙ SYSTEM_PROMPT · ${r.injected.join(" · ")}${r.promptLen ? ` · ${fmt(r.promptLen)} char` : ""}
          </div>` : null}
          ${!ok ? html`<div style=${{ paddingLeft: 18, color: "var(--red)" }}>status: ${r.status}</div>` : null}
        </div>`;
      })}
    </div></div>
  </div>`;
}

/* ---------------------------------------------------------------- settings */

function Settings() {
  const [s, setS] = useState(null);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState(null);
  const [routing, setRouting] = useState(null);
  const [importNote, setImportNote] = useState("");
  const fileRef = useRef(null);
  const load = useCallback(() => {
    api("/api/settings").then(setS).catch((e) => setErr(e.message));
    api("/api/system/info").then(setInfo).catch(() => {});
    api("/api/routing").then(setRouting).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const saveRouting = async (patch) => {
    setMsg(""); setErr("");
    try { await jpost("/api/routing", patch, "PATCH"); setMsg("routing saved"); load(); }
    catch (e) { setErr(e.message); }
  };
  const uploadBackup = async (file) => {
    if (!file) return;
    setErr(""); setMsg(""); setImportNote("uploading…");
    try {
      const buf = await file.arrayBuffer();
      const res = await fetch("/api/backup/import", { method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/octet-stream" }, body: buf });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "import failed");
      setImportNote(`saved · ${d.tables} tables · ${d.note}`);
    } catch (e) { setErr(e.message); setImportNote(""); }
  };
  const applyBackup = async () => {
    if (!confirm("Replace the active database with the uploaded backup? qzgo + qzrouter will restart.")) return;
    setErr("");
    try {
      const d = await jpost("/api/backup/apply", {});
      setImportNote(`applied · backup lama: ${d.previous} · ${d.note}`);
    } catch (e) { setErr(e.message); }
  };

  const patch = async (body) => {
    setMsg(""); setErr("");
    try { await jpost("/api/settings", body, "PATCH"); setMsg("settings saved"); load(); } catch (e) { setErr(e.message); }
  };
  const changePw = async () => {
    setMsg(""); setErr("");
    try {
      await jpost("/api/settings/password", pw);
      setMsg("password diganti"); setPw({ currentPassword: "", newPassword: "" });
    } catch (e) { setErr(e.message); }
  };
  if (!s) return html`<div className="empty">loading…</div>`;
  return html`<div className="cols two">
    <div className="card">
      <div className="hd"><h3>General settings</h3><span className="sub">saved to the settings table</span></div>
      <div className="bd">
        <div className="switch">
          <input type="checkbox" checked=${!!s.cavemanEnabled} onChange=${(e) => patch({ cavemanEnabled: e.target.checked })} />
          <div className="b">Caveman</div>
        </div>
        <div className="switch">
          <input type="checkbox" checked=${!!s.ponytailEnabled} onChange=${(e) => patch({ ponytailEnabled: e.target.checked })} />
          <div className="b">Ponytail</div>
        </div>
        <div className="switch">
          <input type="checkbox" checked=${!!s.enableObservability} onChange=${(e) => patch({ enableObservability: e.target.checked })} />
          <div><div className="b">Observability</div>
            <div className="mut" style=${{ fontWeight: 400, fontSize: 12 }}>include requestDetails for the dashboard</div></div>
        </div>
        ${msg && html`<p className="okmsg" style=${{ marginTop: 10 }}>${msg}</p>`}
        ${err && html`<p className="err" style=${{ marginTop: 10 }}>${err}</p>`}
      </div>
    </div>
    <div className="card">
      <div className="hd"><h3>Landing page</h3><span className="sub">halaman login</span></div>
      <div className="bd">
        <p className="mut" style=${{ fontSize: 12, margin: 0 }}>
          Halaman login menampilkan status model, latency dan usage 24 jam. Tidak ada key,
          nama key, atau kuota key yang dikirim ke halaman itu.
        </p>
      </div>
    </div>
    <${TunnelCard} />
    <div className="card">
      <div className="hd"><h3>Local Mode</h3><span className="sub">running on this machine</span></div>
      <div className="bd">
        <div className="kv"><span className="mut">Host</span><span className="b">${info?.host || "—"}</span></div>
        <div className="kv"><span className="mut">Port</span><span className="b">${info?.port || ""}</span></div>
        <div className="kv"><span className="mut">Database</span>
          <span className="b" style=${{ fontSize: 11, wordBreak: "break-all" }}>${info?.dbPath || ""}</span></div>
        <div className="kv"><span className="mut">Ukuran DB</span><span className="b">${info ? (info.dbSizeBytes / 1048576).toFixed(1) + " MB" : "—"}</span></div>
        <div className="kv"><span className="mut">Node upstream</span>
          <span className="b" style=${{ color: info?.nodeUp ? "var(--green)" : "#B45309" }}>
            ${info ? (info.nodeUp ? "active" : "inactive (optional)") : "—"} · ${info?.nodeUpstream || ""}</span></div>
        <div style=${{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <a className="btn" href="/api/backup">download backup</a>
          <button className="btn" onClick=${() => fileRef.current?.click()}>import backup</button>
          <button className="btn danger" onClick=${applyBackup} disabled=${!importNote.includes("saved")}>terapkan & restart</button>
        </div>
        <input ref=${fileRef} type="file" accept=".sqlite,.db,application/octet-stream" style=${{ display: "none" }}
          onChange=${(e) => uploadBackup(e.target.files?.[0])} />
        ${importNote && html`<p className="mut" style=${{ fontSize: 11, marginBottom: 0 }}>${importNote}</p>`}
      </div>
    </div>
    <div className="card">
      <div className="hd"><h3>Routing Strategy</h3><span className="sub">${routing?.routingMode || ""}</span></div>
      <div className="bd" style=${{ display: "grid", gap: 10 }}>
        <div className="seg">
          <button aria-pressed=${routing?.routingMode !== "round_robin"}
            onClick=${() => saveRouting({ routingMode: "fill_first" })}>Fill First</button>
          <button aria-pressed=${routing?.routingMode === "round_robin"}
            onClick=${() => saveRouting({ routingMode: "round_robin" })}>Round Robin</button>
        </div>
        <div className="switch">
          <input type="checkbox" checked=${!!routing?.comboRoundRobin}
            onChange=${(e) => saveRouting({ comboRoundRobin: e.target.checked })} />
          <div><div className="b">Combo Round Robin</div>
            <div className="mut" style=${{ fontWeight: 400, fontSize: 12 }}>rotate combo members instead of always starting with the first</div></div>
        </div>
        <${Field} label="Combo sticky limit" hint="calls per combo model before switching (0 = off)">
          <input type="number" min="0" max="1000" value=${routing?.comboStickyLimit ?? 0}
            onChange=${(e) => saveRouting({ comboStickyLimit: +e.target.value })} /></${Field}>
        <p className="mut" style=${{ fontSize: 11, margin: 0 }}>
          ${routing?.routingMode === "round_robin"
            ? "Connections rotate in turn; combos follow the saved order."
            : "Uses connections in priority order (fill first). Combos start from the first member."}
        </p>
      </div>
    </div>
    <div className="card">
      <div className="hd"><h3>Network</h3><span className="sub">outbound proxy</span></div>
      <div className="bd" style=${{ display: "grid", gap: 10 }}>
        <div className="switch">
          <input type="checkbox" checked=${!!routing?.proxyEnabled}
            onChange=${(e) => saveRouting({ proxyEnabled: e.target.checked })} />
          <div><div className="b">Enable proxy</div>
            <div className="mut" style=${{ fontWeight: 400, fontSize: 12 }}>for OAuth + upstream requests</div></div>
        </div>
        <${Field} label="Proxy URL">
          <input placeholder="http://user:pass@host:port" disabled=${!routing?.proxyEnabled} value=${routing?.proxyUrl || ""}
            onChange=${(e) => setRouting({ ...routing, proxyUrl: e.target.value })}
            onBlur=${(e) => saveRouting({ proxyUrl: e.target.value })} /></${Field}>
        <p className="mut" style=${{ fontSize: 11, margin: 0 }}>
          ${routing?.proxyEnabled ? "proxy active" : "proxy inactive — enable it first to fill the URL"} · relay list is on the Proxy Pools page
        </p>
      </div>
    </div>
    <div className="card">
      <div className="hd"><h3>Change dashboard password</h3></div>
      <div className="bd" style=${{ display: "grid", gap: 10 }}>
        <${Field} label="Password lama"><input type="password" value=${pw.currentPassword}
          onInput=${(e) => setPw({ ...pw, currentPassword: e.target.value })} /></${Field}>
        <${Field} label="New password" hint="at least 6 characters"><input type="password" value=${pw.newPassword}
          onInput=${(e) => setPw({ ...pw, newPassword: e.target.value })} /></${Field}>
        <button className="btn blue" disabled=${!pw.currentPassword || !pw.newPassword} onClick=${changePw}>save password</button>
      </div>
    </div>
  </div>`;
}


/* ---------------------------------------------------------------- accounts */

function Accounts() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [device, setDevice] = useState(null);
  const [importFor, setImportFor] = useState(null);
  const [conn, setConn] = useState({ provider: "antigravity", url: "", callback: "", state: "" });
  const [imp, setImp] = useState({ accessToken: "", refreshToken: "", accountId: "", email: "" });
  const [busy, setBusy] = useState(false);
  const pollRef = useRef(null);

  const load = useCallback(() => api("/api/accounts").then((d) => setRows(d.accounts || [])).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); return () => clearInterval(pollRef.current); }, [load]);

  const startGrok = async () => {
    setErr(""); setMsg(""); setBusy(true);
    try {
      const d = await jpost("/api/oauth/grok-cli/start", {});
      setDevice(d);
      pollRef.current = setInterval(async () => {
        try {
          const res = await jpost("/api/oauth/grok-cli/poll", {});
          if (res.status === "ok") {
            clearInterval(pollRef.current); setDevice(null);
            setMsg(`Grok account added${res.email ? " · " + res.email : ""}`);
            load();
          }
        } catch (e) {
          clearInterval(pollRef.current);
          setDevice(null);
          setErr(e.message);
        }
      }, Math.max(5, d.interval || 5) * 1000);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const startConn = async () => {
    setBusy(true); setErr(""); setMsg("");
    try {
      const d = await jpost(`/api/oauth/${conn.provider}/start`, {});
      setConn({ ...conn, url: d.url, state: d.state, callback: "" });
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const exchangeConn = async () => {
    setBusy(true); setErr("");
    try {
      const d = await jpost(`/api/oauth/${conn.provider}/exchange`, { callback: conn.callback, code: conn.callback });
      setMsg(`${conn.provider} terhubung${d.email ? " · " + d.email : ""}${d.projectId ? " · " + d.projectId : ""}`);
      setConn({ provider: conn.provider, url: "", callback: "", state: "" });
      load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const saveImport = async () => {
    setBusy(true); setErr("");
    try {
      await jpost("/api/accounts/import", { provider: importFor, ...imp });
      setImportFor(null); setImp({ accessToken: "", refreshToken: "", accountId: "", email: "" });
      setMsg("accounts imported"); load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const toggle = async (a) => {
    try { await jpost(`/api/accounts/${a.id}`, { isActive: !a.isActive }, "PUT"); load(); } catch (e) { setErr(e.message); }
  };
  const del = async (a) => {
    if (!confirm(`Delete account ${a.name}?`)) return;
    try { await api(`/api/accounts/${a.id}`, { method: "DELETE" }); setMsg("account deleted"); load(); } catch (e) { setErr(e.message); }
  };

  const byProvider = (p) => rows.filter((a) => a.provider === p);
  return html`<div>
    ${msg && html`<p className="okmsg" style=${{ marginBottom: 12 }}>${msg}</p>`}
    ${err && html`<p className="err" style=${{ marginBottom: 12 }}>${err}</p>`}

    <div className="cols two">
      <div className="card">
        <div className="hd"><h3>Grok CLI · device code</h3><span className="sub">${byProvider("grok-cli").length} accounts</span></div>
        <div className="bd">
          ${device ? html`<div>
            <p style=${{ marginTop: 0, color: "var(--t2)" }}>Open the verification page and enter the code:</p>
            <div style=${{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <code style=${{ fontSize: 22, letterSpacing: 2, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8 }}>${device.userCode}</code>
              <a className="btn blue" href=${device.verifyUrl} target="_blank" rel="noreferrer">buka ${device.verifyUrl.replace(/^https?:\/\//, "")}</a>
            </div>
            <p className="mut" style=${{ fontSize: 12 }}>menunggu otorisasi… halaman ini cek otooffs tiap ${device.interval}s.</p>
            <button className="btn" onClick=${() => { clearInterval(pollRef.current); setDevice(null); }}>batalkan</button>
          </div>` : html`<div>
            <p style=${{ marginTop: 0, color: "var(--t2)" }}>Sign in with an xAI/Grok account (Grok Build). The code shows up here — no terminal needed.</p>
            <button className="btn blue" onClick=${startGrok} disabled=${busy}>${busy ? "…" : "mulai login grok"}</button>
          </div>`}
        </div>
      </div>
      <div className="card">
        <div className="hd"><h3>Connect Antigravity / Codex</h3>
          <span className="sub">${byProvider("codex").length + byProvider("antigravity").length} accounts</span></div>
        <div className="bd">
          <div className="seg" style=${{ marginBottom: 10 }}>
            <button aria-pressed=${conn.provider === "antigravity"} onClick=${() => setConn({ provider: "antigravity", url: "", callback: "", state: "" })}>Antigravity</button>
            <button aria-pressed=${conn.provider === "codex"} onClick=${() => setConn({ provider: "codex", url: "", callback: "", state: "" })}>Codex</button>
          </div>
          ${conn.url ? html`<div>
            <div style=${{ fontSize: 12, fontWeight: 600, color: "var(--t2)", marginBottom: 4 }}>Step 1 — open this URL</div>
            <a href=${conn.url} target="_blank" rel="noreferrer" className="btn blue" style=${{ marginBottom: 8 }}>buka halaman otorisasi ${I.ext}</a>
            <div style=${{ fontSize: 11, color: "var(--t3)", wordBreak: "break-all", marginBottom: 10 }}>${conn.url}</div>
            <div style=${{ fontSize: 12, fontWeight: 600, color: "var(--t2)", marginBottom: 4 }}>Step 2 — tempel callback URL</div>
            <input placeholder=${"http://localhost:443/callback?code=..."} value=${conn.callback}
              onInput=${(e) => setConn({ ...conn, callback: e.target.value })} />
            <div style=${{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn blue" disabled=${!conn.callback || busy} onClick=${exchangeConn}>selesaikan login</button>
              <button className="btn" onClick=${() => setConn({ ...conn, url: "", callback: "" })}>batal</button>
            </div>
          </div>` : html`<div>
            <p style=${{ marginTop: 0, color: "var(--t2)", fontSize: 13 }}>Browser OAuth login: the authorization URL is generated here, then paste the callback URL back.</p>
            <button className="btn blue" onClick=${startConn} disabled=${busy}>mulai connect ${conn.provider}</button>
          </div>`}
          <div style=${{ marginTop: 12, borderTop: "1px solid var(--line-soft)", paddingTop: 10 }}>
            <div className="mut" style=${{ fontSize: 11, marginBottom: 6 }}>or paste a token manually</div>
            <div style=${{ display: "flex", gap: 8 }}>
              <button className="btn sm" onClick=${() => setImportFor("codex")}>impor token codex</button>
              <button className="btn sm" onClick=${() => setImportFor("antigravity")}>impor token antigravity</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="card" style=${{ marginTop: 16 }}><div className="bd tight"><table>
      <thead><tr><th>Provider</th><th>Name</th><th>Email</th><th>Expired</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows.map((a) => html`<tr key=${a.id}>
        <td className="b">${a.provider}</td>
        <td>${a.name}</td>
        <td className="mut">${a.email || a.info || "—"}</td>
        <td className="mut">${a.expiresAt ? new Date(a.expiresAt).toLocaleString("id-ID") : "—"}</td>
        <td><span className=${"pill " + (a.lastError ? "warnp" : a.isActive ? "okp" : "neup")}>${a.lastError ? "error" : a.isActive ? "active" : "off"}</span>
          ${a.lastError && html`<div className="mut" style=${{ fontWeight: 400, fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>${String(a.lastError).slice(0, 60)}</div>`}</td>
        <td className="r" style=${{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <${ActionBtn} onClick=${() => toggle(a)}>${a.isActive ? "offkan" : "enable"}</${ActionBtn}>
          <${ActionBtn} danger=${true} onClick=${() => del(a)}>delete</${ActionBtn}>
        </td></tr>`)}</tbody></table>
      ${rows.length === 0 && html`<div className="empty">no OAuth accounts yet</div>`}
    </div></div>

    ${importFor && html`<${Modal} title=${`Impor token ${importFor}`} onClose=${() => setImportFor(null)}
        onSave=${saveImport} busy=${busy} error=${err}>
      <${Field} label="Access token"><input value=${imp.accessToken} onInput=${(e) => setImp({ ...imp, accessToken: e.target.value })} /></${Field}>
      <${Field} label="Refresh token (opsional)"><input value=${imp.refreshToken} onInput=${(e) => setImp({ ...imp, refreshToken: e.target.value })} /></${Field}>
      <${Field} label=${importFor === "codex" ? "ChatGPT account id" : "Project id (opsional)"}>
        <input value=${imp.accountId} onInput=${(e) => setImp({ ...imp, accountId: e.target.value })} /></${Field}>
      <${Field} label="Email (opsional)"><input value=${imp.email} onInput=${(e) => setImp({ ...imp, email: e.target.value })} /></${Field}>
    </${Modal}>`}
  </div>`;
}

/* ---------------------------------------------------------------- skills */

function SkillsPage() {
  const [data, setData] = useState(null);
  useEffect(() => { api("/api/skills").then(setData).catch(() => setData({ skills: [] })); }, []);
  const skills = data?.skills || [];
  const copy = async (url) => { try { await navigator.clipboard.writeText(url); } catch (e) {} };
  return html`<div>
    <p style=${{ color: "var(--t2)", marginTop: 0 }}>
      Agent skill catalog. Copy the raw URL and paste it into any agent.
      <a href=${data?.repoUrl || "#"} target="_blank" rel="noreferrer">repo ${data?.repoUrl || ""}</a>
    </p>
    <div className="grid2">
      ${skills.map((sk) => html`<div className="card" key=${sk.id} style=${{ padding: 16 }}>
        <div style=${{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="b">${sk.name}</span>
          ${sk.isEntry && html`<span className="pill okp">entry</span>`}
        </div>
        <p className="mut" style=${{ margin: "6px 0 10px", fontWeight: 400, fontSize: 12 }}>${sk.description}</p>
        <div className="mut" style=${{ fontSize: 11, marginBottom: 10 }}>
          ${sk.endpoint ? html`<code>${sk.endpoint}</code>` : "no endpoint"}
        </div>
        <div style=${{ display: "flex", gap: 6 }}>
          <a className="btn sm" href=${(data?.rawBase || "") + "/" + sk.id + "/SKILL.md"} target="_blank" rel="noreferrer">raw</a>
          <a className="btn sm" href=${(data?.blobBase || "") + "/" + sk.id} target="_blank" rel="noreferrer">github</a>
          <${ActionBtn} onClick=${() => copy((data?.rawBase || "") + "/" + sk.id + "/SKILL.md")}>copy url</${ActionBtn}>
        </div>
      </div>`)}
    </div>
  </div>`;
}

/* ---------------------------------------------------------------- cli tools */

function CLITools() {
  const [data, setData] = useState(null);
  useEffect(() => { api("/api/cli-tools").then(setData).catch(() => setData({ tools: [] })); }, []);
  const tools = data?.tools || [];
  return html`<div>
    <div className="card" style=${{ marginBottom: 16 }}>
      <div className="hd"><h3>Endpoint gateway</h3><span className="sub">for CLI config</span></div>
      <div className="bd"><code style=${{ fontSize: 13 }}>${data?.gateway?.endpoint || ""}</code>
        <p className="mut" style=${{ fontSize: 12, marginBottom: 0 }}>Use this as the base URL in your CLI (OpenAI-compatible).</p>
      </div>
    </div>
    <div className="card">
      <div className="hd"><h3>Status config CLI</h3>
        <a className="btn sm" href=${NODE + "/dashboard/cli-tools"} target="_blank" rel="noreferrer">tulis config via Node ${I.ext}</a></div>
      <div className="bd tight"><table>
        <thead><tr><th>CLI</th><th>Config</th><th>Base URL terdeteksi</th><th>Status</th></tr></thead>
        <tbody>${tools.map((t) => html`<tr key=${t.id}>
          <td className="b">${t.name}</td>
          <td className="mut ell" title=${t.path}>${t.path}</td>
          <td className="mut">${t.pointsAt || "—"}</td>
          <td><span className=${"pill " + (t.exists ? "okp" : "neup")}>${t.exists ? "yes" : "no"}</span></td>
        </tr>`)}</tbody></table>
      </div>
    </div>
  </div>`;
}

/* ---------------------------------------------------------------- tunnel */

function TunnelCard() {
  const [data, setData] = useState(null);
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState("");
  const load = useCallback(() => api("/api/tunnel/status").then((d) => {
    setData(d); if (d.cloudflare?.configured) setUrl(d.cloudflare.configured);
  }).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);
  const save = async () => {
    try { await jpost("/api/settings", { tunnelUrl: url }, "PATCH"); setSaved("disave"); load(); }
    catch (e) { setSaved(e.message); }
  };
  const row = (label, p) => html`<div className="kv" key=${label}>
    <span className="mut">${label}</span>
    <span className="b">${p && p.configured
      ? html`<span className=${"pill " + (p.alive ? "okp" : "badp")}>${p.alive ? "hidup" : "off"}</span>
          <span className="mut" style=${{ fontWeight: 400 }}> ${p.status || ""} · ${fmtMs(p.latencyMs)}</span>`
      : html`<span className="pill neup">not set</span>`}</span>
  </div>`;
  return html`<div className="card">
    <div className="hd"><h3>Tunnel</h3><button className="btn sm" onClick=${load}>${I.refresh}</button></div>
    <div className="bd">
      ${row("Cloudflare", data?.cloudflare)}
      ${row("Tailscale", data?.tailscale)}
      <div className="kv"><span className="mut">Served port</span><span className="b">${data?.servedPort || ""}</span></div>
      <div style=${{ display: "flex", gap: 6, marginTop: 10 }}>
        <input placeholder="https://tunnel.contoh.id" value=${url} onInput=${(e) => setUrl(e.target.value)} />
        <button className="btn" onClick=${save}>save</button>
        <button className="btn" onClick=${load}>${I.refresh}</button>
      </div>
      ${saved && html`<p className="mut" style=${{ fontSize: 11, marginBottom: 0 }}>${saved}</p>`}
      <p className="mut" style=${{ fontSize: 11, marginBottom: 0 }}>${data?.publicHint || ""}</p>
    </div>
  </div>`;
}

/* ---------------------------------------------------------------- external */

function NodePage({ path, title, sub }) {
  return html`<div className="card">
    <div className="hd"><h3>${title}</h3><span className="sub">this page is still served by Node</span></div>
    <div className="bd">
      <p style=${{ color: "var(--t2)", marginTop: 0 }}>${sub}</p>
      <a className="btn blue" href=${NODE + path} target="_blank" rel="noreferrer">buka di Node :20129 ${I.ext}</a>
    </div>
  </div>`;
}

/* ---------------------------------------------------------------- shell */

const PAGES = {
  usage: { title: "Usage & Analytics", sub: "Traffic, tokens, and service status from the shared database", icon: I.chart, view: Usage },
  status: { title: "Model Status", sub: "Service monitor · auto-refresh every 15s", icon: I.pulse, view: StatusPage },
  providers: { title: "Providers", sub: "Upstream connectors, credentials, and connection counts", icon: I.server, view: Providers },
  combos: { title: "Combo & Vision Adapter", sub: "Model aliases and failover chains", icon: I.combo, view: Combos },
  keys: { title: "Endpoint & Key", sub: "Gateway API keys and token quotas", icon: I.key, view: Keys },
  quota: { title: "Quota Tracker", sub: "Token usage per key and rate-limited connections", icon: I.data, view: Quota },
  keyusage: { title: "Key Usage", sub: "Sisa token, pemakaian per model, dan request terakhir per API key", icon: I.key, view: KeyUsage },
  saver: { title: "Token Saver", sub: "Caveman & ponytail — prompt injection to save tokens", icon: I.save, view: TokenSaver },
  prompts: { title: "System Prompt Model", sub: "Per-model/combo prompt injected into requests", icon: I.psych, view: SystemPrompts },
  pools: { title: "Proxy Pools", sub: "Outbound relay for OAuth connections", icon: I.layers, view: ProxyPools },
  logs: { title: "Console Log", sub: "Recent request logs from the database", icon: I.term, view: ConsoleLogs },
  settings: { title: "Settings", sub: "Gateway settings and dashboard password", icon: I.gear, view: Settings },
  cli: { title: "CLI Tools", sub: "CLI tool config and gateway base URLs", icon: I.term, view: CLITools },
  skills: { title: "Skills", sub: "Agent skill catalog, ready to copy", icon: I.ext, view: SkillsPage },
  accounts: { title: "Accounts & OAuth", sub: "Provider OAuth login, token import, and credential status", icon: I.key, view: Accounts },
};

const PATH_TO_PAGE = {
  "/dashboard": "usage", "/dashboard/usage": "usage", "/dashboard/providers": "providers",
  "/dashboard/combos": "combos", "/dashboard/keys": "keys", "/dashboard/quota": "quota", "/dashboard/key-usage": "keyusage",
  "/dashboard/token-saver": "saver", "/dashboard/system-prompt-model": "prompts",
  "/dashboard/proxy-pools": "pools", "/dashboard/console": "logs", "/dashboard/settings": "settings",
  "/dashboard/cli-tools": "cli", "/dashboard/skills": "skills", "/dashboard/accounts": "accounts",
};

function initialPage() {
  const h = location.hash.replace("#", "");
  if (PAGES[h]) return h;
  return PATH_TO_PAGE[location.pathname] || "usage";
}

function App() {
  const [page, setPage] = useState(initialPage());
  const [sys, setSys] = useState(null);
  const [authed, setAuthed] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("qz.theme", theme); } catch (e) {}
  }, [theme]);
  const check = useCallback(() => api("/api/auth/session").then((d) => setAuthed(!!d.authenticated)).catch(() => setAuthed(false)), []);
  useEffect(check, [check]);
  useEffect(() => {
    const onHash = () => setPage(initialPage());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setNavOpen(false); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [navOpen]);
  useEffect(() => {
    if (!authed) return;
    const tick = () => api("/api/system/info").then(setSys).catch(() => setSys(null));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [authed]);

  if (authed === null) return html`<p style=${{ padding: 24, color: "var(--t2)" }}>loading…</p>`;
  if (!authed) return html`<${Login} onDone=${() => setAuthed(true)} />`;

  const current = PAGES[page] || PAGES.usage;
  const View = current.view;
  const go = (id, path) => {
    if (path) history.replaceState(null, "", path);
    location.hash = id;
    setPage(id);
    setNavOpen(false);
  };
  const item = (id, label, icon, path) => html`<button key=${id} className="nav"
      aria-current=${page === id ? "page" : undefined} onClick=${() => go(id, path)}>
      ${icon}<span>${label}</span></button>`;

  return html`<div>
    ${!navOpen && html`<button className="sbToggle" aria-label="Buka menu" aria-expanded="false"
      onClick=${() => setNavOpen(true)}>
      <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round"/></svg></button>`}
    ${navOpen && html`<button className="sbBack" aria-label="Tutup menu" onClick=${() => setNavOpen(false)}></button>`}
    <aside className=${"side" + (navOpen ? " open" : "")}>
      <div className="brand">
        <div className="tile">${I.pulse}</div>
        <div><b>QzRouter Proxy</b><small>v0.6.0 · Go :20130</small></div>
        <button className="sbClose" aria-label="Tutup menu" onClick=${() => setNavOpen(false)}>
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>
      </div>
      ${item("keys", "Endpoint & Key", I.key, "/dashboard/keys")}
      ${item("providers", "Providers", I.server, "/dashboard/providers")}
      ${item("combos", "Combo & Vision Adapter", I.combo, "/dashboard/combos")}
      ${item("usage", "Usage", I.chart, "/dashboard/usage")}
      ${item("quota", "Quota Tracker", I.data, "/dashboard/quota")}
      ${item("keyusage", "Key Usage", I.key, "/dashboard/key-usage")}
      ${item("saver", "Token Saver", I.save, "/dashboard/token-saver")}
      ${item("cli", "CLI Tools", I.term, "/dashboard/cli-tools")}
      ${item("prompts", "System Prompt Model", I.psych, "/dashboard/system-prompt-model")}
      <div className="sect">System</div>
      ${item("accounts", "Accounts & OAuth", I.key, "/dashboard/accounts")}
      ${item("pools", "Proxy Pools", I.layers, "/dashboard/proxy-pools")}
      ${item("skills", "Skills", I.ext, "/dashboard/skills")}
      ${item("logs", "Console Log", I.term, "/dashboard/console")}
      ${item("settings", "Settings", I.gear, "/dashboard/settings")}
    </aside>

    <main className="main">
      ${sys && sys.nodeUp === false && html`<div className="banner">
        <b>Node (:20129) off.</b>
        <span>Gateway, dashboard, OAuth & CRUD tetap normal. Nonactive: media (image/speech/transcribe),
        tulis config CLI, pxpipe, antigravity MITM.</span>
      </div>`}
      <div className="top">
        <div>
          <h1>${current.icon}${current.title}</h1>
          <p>${current.sub}</p>
        </div>
        <div className="right">
          <button className="btn" aria-label=${theme === "dark" ? "Mode terang" : "Mode gelap"}
            title=${theme === "dark" ? "Mode terang" : "Mode gelap"}
            onClick=${() => setTheme(theme === "dark" ? "light" : "dark")}>
            ${theme === "dark"
              ? html`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/></svg>`
              : html`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.8 6.8 0 0 0 11 11Z"/></svg>`}
          </button>
          <button className="btn" onClick=${() => window.dispatchEvent(new Event("qz-refresh"))}>${I.refresh} refresh</button>
          <button className="btn" onClick=${async () => { await api("/api/auth/logout", { method: "POST" }).catch(() => {}); setAuthed(false); }}>sign out</button>
        </div>
      </div>
      <${View} key=${page} />
    </main>
  </div>`;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);
