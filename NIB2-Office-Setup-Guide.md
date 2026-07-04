# NIB2 — Office Computer Setup Guide

This file lives in your OneDrive-synced folder, so it will show up automatically at
**onedrive.com** (sign in with the same Microsoft account as this computer). Open it
from the office computer's browser if you need these steps without asking again.

Your home computer stays the "server" the whole time — NIB2 itself never runs on
the office computer. The office computer only needs Tailscale + a browser.

---

## Part 1 — Do this ONCE, on your HOME computer

**Step 1 — Install Tailscale here**
Where: your browser, home computer.
Go to tailscale.com/download → download the Windows installer → run it → sign in
with any account (Google, Microsoft, or GitHub — you'll reuse this exact account
on the office computer).

**Step 2 — Get this computer's Tailscale address**
Where: click the Tailscale icon in your Windows system tray (bottom-right corner,
near the clock — you may need to click the little "^" arrow to see hidden icons).
Click on this computer's name in the list. It shows an address like `100.x.x.x`.

    MY HOME COMPUTER'S TAILSCALE ADDRESS:  _______________________
    (write it here once you have it)

**Step 3 — Open the firewall (one time, needs admin)**
Where: right-click PowerShell → "Run as Administrator" → paste this, press Enter:

```powershell
New-NetFirewallRule -DisplayName "NIB2" -Direction Inbound -Protocol TCP -LocalPort 3900 -Action Allow -Profile Any
```

**Step 4 — Make sure NIB2 is actually running**
Where: a normal (non-admin) PowerShell window, in the NIB2 folder.
```powershell
cd C:\Users\idrop\OneDrive\Desktop\ClaudeDeskTop\NIB2
npm start
```
Leave this window open. If it's closed, NIB2 is off everywhere, including the office.

---

## Part 2 — Do this ONCE, on your OFFICE computer

**Step 5 — Install Tailscale there too**
Where: your browser, office computer.
Same as Step 1 — tailscale.com/download → install → sign in with the **same account**.
Nothing else installs on this machine. No Node, no npm, no code, no git.

**Step 6 — Open NIB2**
Where: Chrome or Edge, office computer.
Go to:
```
http://100.x.x.x:3900
```
(replace `100.x.x.x` with the address you wrote down in Step 2)

You should see the same NIB2 dashboard — same tasks, same memory, same look — as
the one on your home computer.

---

## Every day after that

- Home computer: keep it turned on, awake, and the `npm start` PowerShell window open.
- Office computer: just go to `http://100.x.x.x:3900` in a browser. Nothing to install
  or reconnect — Tailscale stays connected in the background once it's set up.

## If the office computer can't connect

1. Confirm the home computer is on, awake, and `npm start` is still running.
2. Confirm Tailscale is running on BOTH computers (check the tray icon — it should
   say "Connected").
3. Double check you copied the address exactly, including `:3900` at the end.
4. Re-run Step 2 — Tailscale addresses don't normally change, but confirm it hasn't.
