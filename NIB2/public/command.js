/* B9 Command Centre page logic: load state, refresh intel, generate brief,
   hand "Ask NIB2" prompts back to the chat dashboard. */
"use strict";

const el = (id) => document.getElementById(id);

function authHeaders() {
  const pw = localStorage.getItem("nib2_password");
  return pw ? { "x-nib2-auth": pw } : {};
}

async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options.headers || {}) },
  });
  let body = {};
  try { body = await res.json(); } catch { /* non-JSON body */ }
  if (res.status === 401 && body.authRequired) {
    const pw = prompt("NIB2 password:");
    if (pw) {
      localStorage.setItem("nib2_password", pw);
      return api(path, options);
    }
    throw new Error("Password required.");
  }
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = String(s ?? "");
  return d.innerHTML;
}

// "Ask NIB2" — stash the prompt, jump to the chat dashboard.
function askNib2(prompt) {
  localStorage.setItem("nib2_prefill", prompt);
  window.location.href = "index.html";
}

function badge(confidence) {
  const cls = confidence === "live" ? "cc-live" : confidence === "reported" ? "cc-reported" : "cc-idea";
  return `<span class="cc-badge ${cls}">${esc(confidence)}</span>`;
}

function setBody(cardId, html, isEmpty = false) {
  const body = el(cardId).querySelector(".cc-body");
  body.classList.toggle("muted", isEmpty);
  body.innerHTML = html;
}

// Idea lists are clickable: every item generated with a prompt gets an
// "→" button that hands it straight to NIB2. Tolerates the older
// plain-string brief shape (renders without a button).
function renderList(cardId, items) {
  if (!items?.length) return setBody(cardId, "Nothing here yet.", true);
  const body = el(cardId).querySelector(".cc-body");
  body.classList.remove("muted");
  body.innerHTML = `<ul class="cc-list">${items
    .map((item, i) => {
      const text = typeof item === "string" ? item : item.text;
      const hasPrompt = typeof item === "object" && item.prompt;
      return `<li class="cc-idea">${esc(text)} ${badge("idea")}${hasPrompt ? `<button class="cc-idea-exec" data-idx="${i}" title="Send this to NIB2 to execute">→ NIB2</button>` : ""}</li>`;
    })
    .join("")}</ul>`;
  body.querySelectorAll(".cc-idea-exec").forEach((btn) => {
    btn.addEventListener("click", () => askNib2(items[Number(btn.dataset.idx)].prompt));
  });
}

function renderSignals(centre) {
  const intel = centre.intel;
  const brief = centre.brief;
  const parts = [];

  if (intel?.weather) {
    const w = intel.weather;
    const days = (w.fiveDay || []).map((d) => `${esc(d.day)} ${d.high ?? "?"}°/${d.low ?? "?"}°`).join(" · ");
    parts.push(`<div class="cc-weather"><b>${w.temperature}°C</b> ${esc(w.condition || "")} · wind ${w.windSpeed ?? "?"} km/h ${esc(w.windDirection || "")}<div class="cc-days">${days}</div></div>`);
  }

  if (intel?.news?.length) {
    parts.push(`<div class="cc-newshead">Vernon Matters — latest</div><ul class="cc-list cc-news">${intel.news
      .slice(0, 7)
      .map((n) => `<li><a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(n.title)}</a></li>`)
      .join("")}</ul>`);
  }

  if (brief?.vernonSignals?.length) {
    parts.push(`<div class="cc-newshead">What it means for B9</div><ul class="cc-list">${brief.vernonSignals
      .map((s) => `<li>${esc(s.signal)} ${badge(s.confidence)}<span class="cc-src">${esc(s.source)}</span></li>`)
      .join("")}</ul>`);
  }

  if (intel?.errors?.length) parts.push(`<div class="cc-error">Feed issues: ${esc(intel.errors.join("; "))}</div>`);
  if (!parts.length) return setBody("card-signals", "No intel yet — hit 📡 Refresh Vernon Intel.", true);
  setBody("card-signals", parts.join(""));
}

function renderActions(brief) {
  if (!brief?.topActions?.length) return setBody("card-actions", "No brief yet — hit ⚡ Generate Weekly Brief.", true);
  const body = el("card-actions").querySelector(".cc-body");
  body.classList.remove("muted");
  body.innerHTML = brief.topActions
    .map(
      (a, i) => `
      <div class="cc-action">
        <div class="cc-action-head"><span class="cc-rank">${i + 1}</span><b>${esc(a.action)}</b><span class="cc-badge cc-urg-${esc(a.urgency)}">${esc(a.urgency)}</span>${a.prompt ? `<button class="cc-idea-exec cc-action-exec" data-idx="${i}" title="Send this to NIB2 to execute">→ NIB2</button>` : ""}</div>
        <div class="cc-action-why">${esc(a.why)} — <i>${esc(a.benefit)}</i></div>
        <div class="cc-action-help">NIB2: ${esc(a.nib2Help)}</div>
      </div>`
    )
    .join("");
  body.querySelectorAll(".cc-action-exec").forEach((btn) => {
    btn.addEventListener("click", () => askNib2(brief.topActions[Number(btn.dataset.idx)].prompt));
  });
}

function renderQueue(brief) {
  if (!brief?.activationQueue?.length) return setBody("card-queue", "No brief yet.", true);
  const body = el("card-queue").querySelector(".cc-body");
  body.classList.remove("muted");
  body.innerHTML = brief.activationQueue
    .map((q, i) => `
      <div class="cc-queue-item">
        <span>${esc(q.task)}</span>
        <button class="btn cta cta-gold cc-exec" data-idx="${i}">Ask NIB2 →</button>
      </div>`)
    .join("");
  body.querySelectorAll(".cc-exec").forEach((btn) => {
    btn.addEventListener("click", () => askNib2(brief.activationQueue[Number(btn.dataset.idx)].prompt));
  });
}

function renderAll(centre) {
  const fresh = [];
  if (centre.intel?.fetchedAt) fresh.push(`intel ${new Date(centre.intel.fetchedAt).toLocaleString()}`);
  if (centre.briefGeneratedAt) fresh.push(`brief ${new Date(centre.briefGeneratedAt).toLocaleString()}`);
  el("cc-freshness").textContent = fresh.length ? `Last updated: ${fresh.join(" · ")}` : "Nothing generated yet.";

  const brief = centre.brief;
  const headline = el("cc-headline");
  if (brief?.headline) {
    headline.hidden = false;
    headline.textContent = brief.headline;
  }

  renderSignals(centre);
  renderActions(brief);
  renderQueue(brief);
  renderList("card-revenue", brief?.revenueOpportunities);
  renderList("card-premium", brief?.premiumPositioning);
  renderList("card-competitor", brief?.competitiveAdvantage);
  renderList("card-content", brief?.contentIdeas);
  renderList("card-corporate", brief?.corporateTargets);
  renderList("card-members", brief?.memberGrowth);
  renderList("card-tournaments", brief?.tournamentIdeas);
}

// ---------- Live tickers: Dow, S&P 500, Nasdaq, TSX ----------
async function loadTickers() {
  const strip = el("cc-tickers");
  try {
    const m = await api("/markets");
    strip.innerHTML = m.quotes
      .map((q) => {
        const up = (q.change ?? 0) >= 0;
        const pct = q.changePct !== null ? `${up ? "+" : ""}${q.changePct.toFixed(2)}%` : "";
        return `<span class="cc-tick"><span class="cc-tick-label">${esc(q.label)}</span><span class="cc-tick-price">${q.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span><span class="cc-tick-chg ${up ? "cc-up" : "cc-down"}">${up ? "▲" : "▼"} ${pct}</span></span>`;
      })
      .join("") + `<span class="cc-tick-meta">Yahoo Finance · ${new Date(m.fetchedAt).toLocaleTimeString()}</span>`;
  } catch (err) {
    strip.innerHTML = `<span class="muted">Markets unavailable: ${esc(err.message)}</span>`;
  }
}
setInterval(loadTickers, 5 * 60 * 1000); // matches the server's 5-min cache

// ---------- News cards: CBC Sports, Financial Post, CNBC Markets ----------
function renderNewsCard(cardId, feed) {
  if (!feed?.items?.length) return setBody(cardId, "Feed unavailable right now.", true);
  setBody(cardId, `<ul class="cc-list cc-news">${feed.items
    .slice(0, 10)
    .map((n) => `<li><a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(n.title)}</a></li>`)
    .join("")}</ul><div class="weather-meta">${esc(feed.source)}</div>`);
}

async function loadFeeds() {
  try {
    const f = await api("/feeds");
    renderNewsCard("card-sports", f.sports);
    renderNewsCard("card-bizNews", f.business);
    renderNewsCard("card-marketNews", f.markets);
  } catch (err) {
    for (const id of ["card-sports", "card-bizNews", "card-marketNews"]) setBody(id, `Feeds unavailable: ${esc(err.message)}`, true);
  }
}

// ---------- Unread Gmail ----------
async function loadGmailUnread() {
  try {
    const g = await api("/gmail/unread");
    if (!g.connected) {
      return setBody(
        "card-gmail",
        `Gmail isn't connected yet. One-time setup (~10 min, beginner steps in <b>README §5b</b>): Google Cloud project → enable Gmail API → OAuth credentials → paste 2 values into .env.local → visit <code>/api/gmail/auth</code> on the home computer. This card lights up with your unread inbox the moment that's done.`,
        true
      );
    }
    if (!g.emails.length) return setBody("card-gmail", "Inbox zero. Suspiciously impressive.", true);
    setBody("card-gmail", `<ul class="cc-list">${g.emails
      .map((e) => `<li class="cc-mail"><b>${esc(e.from.replace(/<.*>/, "").trim())}</b> — ${esc(e.subject)}<span class="cc-src">${esc(e.snippet.slice(0, 80))}</span></li>`)
      .join("")}</ul>`);
  } catch (err) {
    setBody("card-gmail", `Gmail error: ${esc(err.message)}`, true);
  }
}

// ---------- Today's bookings (manual sync until B9 corporate provides an API) ----------
async function loadBookings() {
  try {
    const b = await api("/bookings");
    if (!b.bookings.length) {
      return setBody(
        "card-bookings",
        `No bookings synced. The B9 admin has no public API yet (ask B9 corporate — see README §5c). Until then, tell NIB2 in chat: <i>"sync today's bookings: 10am bay 1 Smith, 2pm bay 3 corporate demo"</i> — or POST to /api/bookings.`,
        true
      );
    }
    setBody("card-bookings", `<ul class="cc-list">${b.bookings
      .map((x) => `<li><b>${esc(x.time)}</b>${x.bay ? ` · Bay ${esc(x.bay)}` : ""}${x.name ? ` · ${esc(x.name)}` : ""}${x.note ? `<span class="cc-src">${esc(x.note)}</span>` : ""}</li>`)
      .join("")}</ul><div class="weather-meta">${esc(b.source)} · updated ${new Date(b.updatedAt).toLocaleString()}</div>`);
  } catch (err) {
    setBody("card-bookings", `Bookings unavailable: ${esc(err.message)}`, true);
  }
}

async function load() {
  try {
    renderAll(await api("/command-centre"));
  } catch (err) {
    el("cc-freshness").textContent = `Command Centre unavailable: ${err.message}`;
  }
}

el("btn-intel").addEventListener("click", async () => {
  const btn = el("btn-intel");
  btn.disabled = true;
  btn.textContent = "📡 Refreshing…";
  try {
    await api("/command-centre/intel", { method: "POST" });
    await load();
  } catch (err) {
    el("cc-freshness").textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "📡 Refresh Vernon Intel";
  }
});

el("btn-brief").addEventListener("click", async () => {
  const btn = el("btn-brief");
  btn.disabled = true;
  btn.textContent = "⚡ Thinking… (30–60s)";
  document.body.classList.add("processing");
  window.NeuralBG?.setActivity?.(1);
  try {
    renderAll(await api("/command-centre/brief", { method: "POST" }));
  } catch (err) {
    el("cc-freshness").textContent = err.message;
  } finally {
    document.body.classList.remove("processing");
    window.NeuralBG?.setActivity?.(0);
    btn.disabled = false;
    btn.textContent = "⚡ Generate Weekly Brief";
  }
});

load();
loadTickers();
loadFeeds();
loadGmailUnread();
loadBookings();
