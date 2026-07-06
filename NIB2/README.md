# NIB2 — Your Private AI Assistant

NIB2 is a JARVIS-inspired assistant that runs privately on your own computers. It gives you:

- **Chat** with Claude (Anthropic API) in a dark, desktop-first command deck
- **Voice input** (push-to-talk) and **voice output** (Canadian English preferred)
- **Shared memory** — preferences, facts, projects, decisions — stored in plain JSON files
- **Task tracking** — NIB2 can create, update, and complete tasks itself while you chat
- **Session handoffs** — one click summarizes your session ("Pickup Where You Left Off") so you can continue tomorrow, or from your other computer

One computer runs the server. Both computers open it in a browser. Same memory, same tasks, same NIB2.

---

## 1. Install (one time, on the server computer)

You need **Node.js 18+** (this machine already has Node 24 installed).

Open PowerShell in this `NIB2` folder and run:

```powershell
npm install
```

## 2. Add your Anthropic API key

1. Get a key at https://platform.claude.com (Settings → API Keys).
2. In the `NIB2` folder, copy `.env.example` to a new file named `.env.local`:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Open `.env.local` in Notepad and paste your key:

   ```
   ANTHROPIC_API_KEY=sk-ant-your-real-key
   ```

The key stays on the server computer only. It is never sent to the browser, and `.env.local` is git-ignored so it can't be committed by accident.

## 3. Run NIB2

```powershell
npm start
```

You'll see something like:

```
  NIB2 online.
  This computer:  http://localhost:3900
  Other computer: http://192.168.1.42:3900
```

Open **http://localhost:3900** in Chrome or Edge. That's NIB2.

To stop the server, press `Ctrl+C` in the terminal. To keep it running, just leave that terminal window open (or minimize it).

**Auto-reload:** `npm start` (and `start-nib2.bat`, below) uses Node's `--watch` flag — NIB2 automatically restarts itself the instant any server-side file changes on disk. You'll never again see a feature that "isn't showing up" because the running process is older than the code. (If you ever need the old no-watch behavior, use `npm run start:once` instead.)

---

## 4. Using NIB2 from your second computer

Both computers must be on the same Wi-Fi/network.

1. On the server computer, run `npm start` and note the **"Other computer"** address it prints (e.g. `http://192.168.1.42:3900`). If you missed it, run `ipconfig` and look for "IPv4 Address".
2. On the second computer, open that address in Chrome or Edge.
3. Done. Both computers now share the same memory, tasks, and handoffs, because everything lives on the server computer.

### Firewall (first time only)

The first time you run NIB2, Windows may show a firewall prompt — click **Allow** for private networks. If you skipped it and computer 2 can't connect, run PowerShell **as Administrator** on the server computer:

```powershell
New-NetFirewallRule -DisplayName "NIB2" -Direction Inbound -Protocol TCP -LocalPort 3900 -Action Allow -Profile Private
```

### If computer 2 still can't connect

- Confirm both machines are on the **same network** (not one on guest Wi-Fi).
- Confirm the server is running (`npm start` terminal is open, no errors).
- Try opening `http://localhost:3900` on the server computer first — if that fails, the server isn't running.
- Your router may isolate devices ("AP isolation" / "client isolation") — turn that off in router settings.
- The server IP can change when the router reboots. Re-check with `ipconfig`, or reserve a fixed IP for the server computer in your router's DHCP settings.

---

## 5. Voice

### Voice output — human voice via ElevenLabs (recommended)

NIB2 can speak with your **ElevenLabs** voice (human-sounding), and falls back to the browser's built-in voice automatically if ElevenLabs isn't set up.

To turn it on:

1. In `.env.local`, add these two lines (the `.env.example` file has them ready to fill):
   ```
   ELEVENLABS_API_KEY=your-elevenlabs-api-key
   ELEVENLABS_VOICE_ID=your-voice-id
   ```
2. **API key:** ElevenLabs → your profile → **API Keys** → copy.
3. **Voice ID:** ElevenLabs → **Voices** → click your chosen voice → copy its **ID**.
4. Restart the server (`Ctrl+C`, then `npm start`).

The **Voice Settings** panel shows which engine is live ("ElevenLabs (human voice)" or "browser fallback"). Your ElevenLabs key stays on the server — the browser only receives finished audio, never the key. The 🔊 button mutes/unmutes; **⏹ Stop voice** interrupts NIB2 instantly. Only the volume slider applies to ElevenLabs (rate/pitch are pre-baked into the rendered audio, so those knobs were removed). Optional: set `ELEVENLABS_MODEL_ID` to `eleven_multilingual_v2` for higher quality (slower) instead of the default fast `eleven_turbo_v2_5`.

If ElevenLabs is not configured, NIB2 uses the browser voice as a fallback (prefers Canadian English `en-CA`).

**Before it reaches ElevenLabs**, every reply passes through `lib/speech-director.js` — it strips markdown properly (not just a character blacklist), turns bullet lists into spoken phrasing ("First, ... Next, ..."), swaps code blocks for a dry one-liner instead of reading code aloud, weaves "NIB" into the reply naturally exactly once, and trims very long replies with a "the full detail is on screen" note. The dashboard still displays your full, untouched markdown reply — only the audio version goes through this pipeline.

### Voice input — talk to NIB2

- Works in **Chrome and Edge**. Firefox doesn't support it.
- Click **🎙 Talk** (or press **Ctrl + Q**), speak, and your words appear live, then send automatically when you pause. The button shows **● Listening…** while active.
- **Ctrl + Q hotkey:** toggles the microphone from anywhere on the page. On Windows browsers Ctrl+Q is free (the quit shortcut is Cmd+Q on Mac only). If a browser ever grabs it, the Talk button always works as the fallback.
- **If the mic is blocked:** click the 🔒/camera icon in the address bar → allow the microphone → try again. NIB2 shows a clean message and never crashes; typing always works.
- **Important limitation:** browsers only allow microphone access on secure pages. `http://localhost:3900` counts as secure, so voice input **works on the server computer**. Plain `http://192.168.x.x` or a Tailscale `http://100.x.x.x` address does **not** count, so on the second computer voice *input* is disabled — typing and voice *output* still work fine.
- Workaround for voice input on computer 2: in Chrome open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, add your server address, relaunch Chrome. It's a browser security override — your call.

## 5b. Gmail (optional — read, search, draft)

NIB2 can read and search your Gmail and **draft** replies (it never sends, deletes, or archives). It uses Google's standard OAuth — your Gmail password is never asked for or stored, only a revocable token kept on the server in `data/gmail-token.json` (git-ignored).

**One-time setup:**

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create a project.
2. **APIs & Services → Library →** search "Gmail API" → **Enable**.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID.**
   - If asked, configure the consent screen (External, add yourself as a test user).
   - Application type: **Web application**.
   - Under **Authorized redirect URIs**, add exactly:
     `http://localhost:3900/api/gmail/callback`
4. Copy the **Client ID** and **Client secret** into `.env.local`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=http://localhost:3900/api/gmail/callback
   ```
5. Restart the server. On the **server computer**, open `http://localhost:3900/api/gmail/auth`, sign in, approve. You'll see "Gmail connected."
6. The header **Gmail** pill turns green. Now you can ask NIB2 things like "summarize my inbox", "find the email from the accountant", "draft a reply to the last email."

Until you do this, the Gmail pill shows "Gmail off" and NIB2 says Gmail isn't connected if asked — nothing breaks.

### Easier alternative: Gmail via n8n

If you already connected Gmail to an **n8n** workflow, skip Google Cloud entirely — NIB2 can read your unread mail through the workflow:

1. In your n8n workflow, add a **Webhook** trigger node: HTTP Method **GET**, Respond **"When Last Node Finishes"**.
2. Connect it to a **Gmail** node: operation **Message → Get Many**, Search `in:inbox is:unread`, **Simplify ON**, limit ~10.
3. Toggle the workflow **Active** (top-right switch), then copy the Webhook node's **Production URL** (not the Test URL).
4. Paste it into `.env.local` as `N8N_GMAIL_WEBHOOK_URL=...`

The Gmail pill turns green ("Gmail on (n8n)"), the Command Centre's Unread Gmail card goes live, and asking NIB2 "what's in my inbox" reads your unread mail aloud. If both Gmail methods are configured, n8n wins.

## 5c. Bookings (B9 admin)

The **Bookings** panel links straight to the B9 booking admin (`franchise.backninegolf.ca`). Live booking *data* inside NIB2 is not wired in yet: the admin site is a login-protected web app, so NIB2 needs proper API access from the booking platform vendor (an API key or export feed) — not screen-scraping a logged-in page. Once you know what platform runs it (check its help/settings pages for "API" or "integrations"), NIB2 can be wired to pull real numbers. Until then NIB2 will say so rather than invent booking data.

---

## 6. Where your data lives

Everything is plain JSON inside the `data/` folder on the server computer:

| File | Contents |
|---|---|
| `data/memory.json` | Preferences, facts, projects, decisions |
| `data/tasks.json` | Your task list (id, title, status, priority, notes, timestamps) |
| `data/sessions.json` | Session handoff summaries |

You can open them in Notepad. If a file ever gets corrupted, NIB2 quarantines it (renamed to `*.corrupt-<timestamp>.bak`) and starts that file fresh instead of crashing — nothing else is touched.

## 7. Session handoffs

Click **📋 Handoff** and NIB2 summarizes the current session — completed work, current state, open issues, decisions, and the recommended next action — always starting with **Pickup Where You Left Off**. The summary is:

1. saved to `data/sessions.json` (and shown in the Session Handoffs panel),
2. downloaded as a markdown file,
3. automatically fed back into NIB2's context in future sessions, so it genuinely picks up where you left off.

## 8. Running the tests

```powershell
npm test
```

This runs the full suite (storage, memory, tasks, sessions, API, error handling) with Node's built-in test runner. No API key needed — the Anthropic client is mocked in tests.

## 9. Changing NIB2's personality

Edit `prompts/nib2-system-prompt.md` and restart the server. That file is NIB2's entire identity — tone, rules, tool behavior, handoff format.

## 10. Optional password gate

On a trusted home network you don't need one. If you want one (e.g. roommates on the same Wi-Fi), set it in `.env.local`:

```
NIB2_PASSWORD=something-you-will-remember
```

Restart the server. Both browsers will prompt for the password once and remember it.

**Honest security note:** this is a shared-password gate over plain HTTP on your LAN — good enough to keep casual snoops out, not enterprise security. Your API key never reaches the browser regardless.

## 11. Two computers (home + office) — recommended setup

**Run NIB2 on ONE computer (home), reach it from BOTH via Tailscale.** This is the confirmed, working setup — one brain, one set of memory/tasks, reachable from anywhere.

Why this and not "sync via GitHub and run on both": running two copies would give you two separate memories/task lists that drift apart, and you'd need Node, keys, and `npm start` on both machines. One server is simpler and keeps everything in sync.

- **Home computer (the server):** runs `npm start`, holds all keys in `.env.local`, and needs internet (for Anthropic, ElevenLabs, Gmail). It must be **on and awake** for the office to reach it.
- **Office computer:** just a browser + Tailscale. No Node, no keys, no code.

Setup: install [Tailscale](https://tailscale.com) on both, sign in with the **same account**, then open `http://YOUR-HOME-TAILSCALE-IP:3900` from the office. Traffic is encrypted and nothing is exposed to the public internet. (Your home Tailscale address is in `NIB2-Office-Setup-Guide.md`.)

**Note on the integrations and internet:** ElevenLabs, Gmail, and Anthropic all run from the **server** (home) computer's internet connection. The office computer never needs any keys — it's just viewing the home server's screen.

**Alternative — private cloud (only if you don't want the home PC always on):** deploy to Render/Railway/Fly.io and set `NIB2_PASSWORD`. Then `data/` lives on their disk (less private) and you'd re-add your keys there as environment variables. For a personal assistant, the home-server + Tailscale route is cleaner and keeps everything on your own hardware.

## 12. Troubleshooting

| Problem | Fix |
|---|---|
| "No API key — see .env.local" in the header | Create `.env.local` with `ANTHROPIC_API_KEY=...`, restart the server |
| "The Anthropic API key was rejected" | The key is wrong or revoked — paste it again carefully |
| "Rate limited by the Anthropic API" | Wait a minute; you're sending requests faster than your plan allows |
| Chat says "Server unreachable" | The `npm start` terminal was closed — start it again |
| Voice input button disabled | Wrong browser (use Chrome/Edge) or you're on `http://192.168...` — see section 5 |
| `npm start` says port in use | Another NIB2 is already running, or change `NIB2_PORT` in `.env.local` |
| Tasks/memory look wrong | Open the JSON files in `data/` — they're human-readable and editable |

---

## Project layout

```
NIB2/
├── server.js              # Express server (dashboard + API), binds to your LAN
├── routes/api.js          # /api/chat, /api/tasks, /api/memory, /api/sessions, /api/status
├── lib/
│   ├── claude.js          # Anthropic API client + tool loop (NIB2's brain-stem)
│   ├── voice.js           # ElevenLabs text-to-speech (server-side; key never leaves)
│   ├── speech-director.js # Prepares reply text for speech (strip markdown, pace, address NIB once)
│   ├── weather.js         # Live Vernon BC current conditions + 5-day outlook (Environment Canada)
│   ├── gmail.js           # Gmail OAuth: read / search / draft (never sends)
│   ├── store.js           # Safe JSON storage (atomic writes, corruption quarantine)
│   ├── memory.js          # readMemory/writeMemory/savePreference/getRelevantContext
│   ├── tasks.js           # addTask/updateTask/completeTask
│   └── sessions.js        # createSessionSummary/latestHandoff
├── prompts/nib2-system-prompt.md   # NIB2's identity — edit to change personality
├── public/                # The dashboard (index.html, app.js, styles.css)
├── data/                  # memory.json, tasks.json, sessions.json
├── tests/                 # npm test
├── .env.example           # Template for .env.local
└── package.json
```
