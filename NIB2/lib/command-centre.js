// B9 Command Centre — NIB2's weekly operating intelligence for Back Nine Vernon.
//
// What it does:
//   gatherIntel()  — pulls REAL live signals: Vernon weather (Environment
//                    Canada) + Vernon Matters headlines. Nothing invented.
//   generateBrief() — feeds those signals plus B9's stored memory, goals, and
//                    open tasks to Claude and gets back a structured weekly
//                    brief (strict JSON schema, so the dashboard renders it).
//   readCentre()/   — the whole centre state persists in
//   writeCentre()     data/command-centre.json with freshness stamps.
//
// Honesty rules baked into the generator prompt: live data is labelled live,
// generated suggestions are labelled ideas, no invented Vernon events, no
// fabricated stats, no made-up competitor claims. Corporate targets are
// business *categories*, not named companies with invented details.

import { readJson, writeJson } from "./store.js";
import { getVernonWeather } from "./weather.js";
import { getVernonNews } from "./vernon-intel.js";
import { readMemory } from "./memory.js";
import { getOpenTasks } from "./tasks.js";
import { MODEL } from "./claude.js";

const FILE = "command-centre.json";
const EMPTY = { updatedAt: null, intel: null, brief: null, briefGeneratedAt: null };

export const B9_STRATEGY_PRIORITIES = [
  "More memberships",
  "More bookings",
  "More corporate memberships",
  "More tournaments/leagues",
  "More private events",
  "More member retention",
  "More local awareness",
  "Stronger premium positioning",
  "Better use of Full Swing technology",
  "Better use of Beyond the Grass",
  "More dominance in the Vernon/Okanagan leisure market",
];

export function readCentre() {
  return readJson(FILE, EMPTY);
}

export function writeCentre(centre) {
  writeJson(FILE, centre);
  return centre;
}

// Pull fresh REAL signals. Each source fails independently — one dead feed
// never blanks the other.
export async function gatherIntel({ weatherFn = getVernonWeather, newsFn = getVernonNews } = {}) {
  const intel = { fetchedAt: new Date().toISOString(), weather: null, news: null, errors: [] };
  try {
    intel.weather = await weatherFn();
  } catch (err) {
    intel.errors.push(`weather: ${err.message}`);
  }
  try {
    intel.news = await newsFn();
  } catch (err) {
    intel.errors.push(`news: ${err.message}`);
  }
  const centre = readCentre();
  centre.intel = intel;
  centre.updatedAt = intel.fetchedAt;
  writeCentre(centre);
  return intel;
}

// Strict JSON schema so the brief always renders — no free-form parsing.
const BRIEF_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string", description: "One sharp sentence: the week's operating picture for B9." },
    vernonSignals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          signal: { type: "string" },
          source: { type: "string", description: "Where this comes from: a provided headline title, 'weather feed', or 'idea'" },
          confidence: { type: "string", enum: ["live", "reported", "idea"] },
        },
        required: ["signal", "source", "confidence"],
        additionalProperties: false,
      },
    },
    topActions: {
      type: "array",
      description: "Exactly 5 practical actions, best first.",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          why: { type: "string" },
          benefit: { type: "string" },
          urgency: { type: "string", enum: ["now", "this-week", "this-month"] },
          nib2Help: { type: "string", description: "How NIB2 can help execute, or 'owner action' if it can't" },
        },
        required: ["action", "why", "benefit", "urgency", "nib2Help"],
        additionalProperties: false,
      },
    },
    revenueOpportunities: { type: "array", items: { type: "string" } },
    premiumPositioning: { type: "array", items: { type: "string" } },
    competitiveAdvantage: { type: "array", items: { type: "string" } },
    contentIdeas: { type: "array", items: { type: "string" } },
    corporateTargets: { type: "array", items: { type: "string" } },
    memberGrowth: { type: "array", items: { type: "string" } },
    tournamentIdeas: { type: "array", items: { type: "string" } },
    activationQueue: {
      type: "array",
      description: "Concrete things NIB should ask NIB2 to do next, with a ready-to-send prompt.",
      items: {
        type: "object",
        properties: {
          task: { type: "string" },
          prompt: { type: "string", description: "The exact chat message NIB can send to NIB2 to execute this" },
        },
        required: ["task", "prompt"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "headline", "vernonSignals", "topActions", "revenueOpportunities",
    "premiumPositioning", "competitiveAdvantage", "contentIdeas",
    "corporateTargets", "memberGrowth", "tournamentIdeas", "activationQueue",
  ],
  additionalProperties: false,
};

function briefPrompt(intel, memory, openTasks) {
  const news = (intel.news || [])
    .map((n) => `- "${n.title}" (${n.date || "no date"})${n.category ? ` [${n.category}]` : ""}`)
    .join("\n") || "(news feed unavailable this run)";

  const w = intel.weather;
  const weather = w
    ? `Current: ${w.temperature}°C, ${w.condition || "n/a"}, humidity ${w.humidity}%, wind ${w.windSpeed} km/h ${w.windDirection || ""}.\n5-day: ${(w.fiveDay || []).map((d) => `${d.day} ${d.high ?? "?"}°/${d.low ?? "?"}° ${d.summary ?? ""}`).join(" | ")}`
    : "(weather feed unavailable this run)";

  const mem = [
    ...memory.projects.map((p) => `PROJECT: ${p.text}`),
    ...memory.facts.map((f) => `FACT: ${f.text}`),
    ...memory.decisions.map((d) => `DECISION: ${d.text}`),
  ].join("\n\n");

  const tasks = openTasks.map((t) => `- [${t.priority}] ${t.title}`).join("\n") || "(none)";

  return `You are NIB2's strategy engine generating the weekly operating brief for Back Nine Vernon (B9) — a premium, membership-led, 24/7 indoor golf facility in Vernon, BC (Okanagan), powered by Full Swing simulators and connected to Beyond the Grass.

## Live signals (REAL data — the only facts you may cite)

### Vernon Matters headlines (mixed local + national; use only the locally relevant ones)
${news}

### Vernon BC weather (Environment Canada, live)
${weather}

## B9 knowledge base (stored memory)
${mem}

## NIB's open tasks
${tasks}

## Strategy priorities (every recommendation must serve at least one)
${B9_STRATEGY_PRIORITIES.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## Hard honesty rules
- The ONLY facts you may state are the headlines and weather above, and the stored B9 knowledge. Everything else is an idea and must be labelled confidence "idea".
- Signals sourced from a headline: confidence "reported", source = that headline's title. Weather-derived: confidence "live", source "weather feed".
- Do NOT invent Vernon events, stats, dates, or competitor claims. Do not name specific local companies as corporate targets — name business CATEGORIES (e.g. "realtors", "breweries", "dental clinics") with how to find/approach them.
- Never negative about competitors — only where B9 structurally wins (24/7, weather-proof, premium, data-driven, private bays).
- Weather is a weapon: cold/rain/heat/smoke = "escape outside conditions" angles; great weather = evenings/night-owl/league angles. Use the actual forecast above.
- Tone: premium, confident, modern, dry wit welcome, zero salesy cringe.
- activationQueue prompts must be self-contained messages NIB can paste to NIB2 verbatim (e.g. "Draft 3 Instagram post captions for a mid-week heat-wave escape offer: private cool bay, cold drinks, 2-hour prime slot.").
- Exactly 5 topActions. Keep every list item tight — one to two sentences.`;
}

// Generate the weekly brief. `client` is an Anthropic client (injectable for tests).
export async function generateBrief({ client, weatherFn, newsFn } = {}) {
  const intel = await gatherIntel({ ...(weatherFn && { weatherFn }), ...(newsFn && { newsFn }) });
  if (!intel.weather && !intel.news) {
    const err = new Error(`No live signals available (${intel.errors.join("; ")}). Brief not generated — it would be guesswork.`);
    err.code = "no_signals";
    throw err;
  }

  const memory = readMemory();
  const openTasks = getOpenTasks();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    output_config: { format: { type: "json_schema", schema: BRIEF_SCHEMA } },
    messages: [{ role: "user", content: briefPrompt(intel, memory, openTasks) }],
  });

  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Brief generation returned no content.");
  const brief = JSON.parse(text);

  const centre = readCentre();
  centre.brief = brief;
  centre.briefGeneratedAt = new Date().toISOString();
  centre.updatedAt = centre.briefGeneratedAt;
  writeCentre(centre);
  return centre;
}
