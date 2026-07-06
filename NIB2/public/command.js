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

function renderList(cardId, items) {
  if (!items?.length) return setBody(cardId, "Nothing here yet.", true);
  setBody(cardId, `<ul class="cc-list">${items.map((i) => `<li>${esc(i)} ${badge("idea")}</li>`).join("")}</ul>`);
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
  setBody(
    "card-actions",
    brief.topActions
      .map(
        (a, i) => `
      <div class="cc-action">
        <div class="cc-action-head"><span class="cc-rank">${i + 1}</span><b>${esc(a.action)}</b><span class="cc-badge cc-urg-${esc(a.urgency)}">${esc(a.urgency)}</span></div>
        <div class="cc-action-why">${esc(a.why)} — <i>${esc(a.benefit)}</i></div>
        <div class="cc-action-help">NIB2: ${esc(a.nib2Help)}</div>
      </div>`
      )
      .join("")
  );
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
