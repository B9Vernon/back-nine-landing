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

**Voice output (NIB2 speaking)** works everywhere. It prefers a Canadian English (`en-CA`) voice; if your machine doesn't have one it uses the best available English voice and tells you so, once. Adjust voice, rate, pitch, and volume in the **Voice Settings** panel — defaults are rate 0.92, pitch 0.95, volume 1.0. The 🔊 button mutes/unmutes.

**Voice input (you speaking)** uses the browser's speech recognition:

- Works in **Chrome and Edge**. Firefox doesn't support it.
- Click **🎙 Talk**, speak, and your words appear live, then send automatically when you pause.
- **Important limitation:** browsers only allow microphone access on secure pages. `http://localhost:3900` counts as secure, so voice input **works on the server computer**. Plain `http://192.168.x.x` does **not** count, so on the second computer voice input is disabled and NIB2 tells you — typing (and voice *output*) still work fine.
- Workaround if you really want voice input on computer 2: in Chrome open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, add `http://YOUR-SERVER-IP:3900`, and relaunch Chrome. It works, but it's a browser security override — your call.

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

## 11. Optional: access from anywhere (private cloud)

If you want NIB2 without shared Wi-Fi, two sane options:

- **Tailscale (recommended, free, easiest):** install [Tailscale](https://tailscale.com) on both computers, sign in with the same account, and open `http://SERVER-TAILSCALE-IP:3900` from anywhere. Nothing about NIB2 changes, traffic is encrypted, and nothing is exposed to the public internet.
- **Deploy to Render/Railway:** possible, but then your `data/` files live on their disk and you must set `NIB2_PASSWORD`. For a personal assistant, Tailscale is cleaner and keeps everything on your own hardware.

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
