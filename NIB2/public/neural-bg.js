/* NIB2 living background — a quiet neural field behind the dashboard.
   Drifting nodes, faint connections, occasional signal pulses traveling
   between them. Respects prefers-reduced-motion. Exposes window.NeuralBG
   so the app can raise activity while NIB2 is thinking. */
"use strict";

(() => {
  const canvas = document.getElementById("neural-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const GREEN = [150, 203, 57];
  const GOLD = [212, 175, 87];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let width = 0, height = 0, dpr = 1;
  let nodes = [];
  let sparks = [];        // pulses traveling along a connection
  let ripples = [];       // expanding rings when a spark arrives
  let activity = 0;       // 0 = idle breathing, 1 = NIB2 is thinking
  let running = false;
  let rafId = null;
  let lastTime = 0;
  const mouse = { x: -9999, y: -9999 };

  const LINK_DIST = 170;  // px — nodes closer than this get a line

  function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedNodes();
    if (reduceMotion.matches) drawStaticFrame();
  }

  function seedNodes() {
    const target = Math.max(28, Math.min(64, Math.round((width * height) / 32000)));
    nodes = [];
    for (let i = 0; i < target; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: 1 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,   // for organic glow timing
        glow: 0,                               // lights up when a signal arrives
      });
    }
    sparks = [];
    ripples = [];
  }

  function neighbors() {
    // O(n²) is fine at <= 64 nodes.
    const pairs = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) pairs.push([i, j, Math.sqrt(d2)]);
      }
    }
    return pairs;
  }

  function spawnSpark(pairs) {
    if (!pairs.length) return;
    const [a, b] = pairs[(Math.random() * pairs.length) | 0];
    const gold = Math.random() < 0.22; // mostly green signals, occasional gold
    sparks.push({ a, b, t: 0, speed: 0.35 + Math.random() * 0.5, color: gold ? GOLD : GREEN });
  }

  function step(dt, time) {
    const pairs = neighbors();

    // --- update nodes: slow drift + gentle cursor response ---
    for (const n of nodes) {
      n.x += n.vx * dt * 60 * 0.2;
      n.y += n.vy * dt * 60 * 0.2;
      // soft wrap
      if (n.x < -20) n.x = width + 20; else if (n.x > width + 20) n.x = -20;
      if (n.y < -20) n.y = height + 20; else if (n.y > height + 20) n.y = -20;

      // cursor: nodes lean very slightly toward the mouse, never jumpy
      const mdx = mouse.x - n.x, mdy = mouse.y - n.y;
      const md2 = mdx * mdx + mdy * mdy;
      if (md2 < 220 * 220 && md2 > 1) {
        const f = 0.0035 * dt * 60 / Math.sqrt(md2);
        n.x += mdx * f * 8;
        n.y += mdy * f * 8;
      }
      n.glow = Math.max(0, n.glow - dt * 1.5);
    }

    // --- spawn signals: rare while idle, frequent while thinking ---
    const spawnChance = (0.25 + activity * 3.2) * dt;
    if (Math.random() < spawnChance && sparks.length < 6 + activity * 10) spawnSpark(pairs);

    // --- update sparks ---
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.t += s.speed * dt;
      if (s.t >= 1) {
        const dest = nodes[s.b];
        dest.glow = 1;
        ripples.push({ x: dest.x, y: dest.y, r: 2, alpha: 0.35, color: s.color });
        sparks.splice(i, 1);
      }
    }

    // --- update ripples ---
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.r += dt * 26;
      r.alpha -= dt * 0.5;
      if (r.alpha <= 0) ripples.splice(i, 1);
    }

    draw(pairs, time);
  }

  function draw(pairs, time) {
    ctx.clearRect(0, 0, width, height);

    // connections
    for (const [i, j, d] of pairs) {
      const a = nodes[i], b = nodes[j];
      const fade = 1 - d / LINK_DIST;
      ctx.strokeStyle = rgba(GREEN, 0.05 + fade * 0.06 + activity * 0.03);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // ripples (signal arrival rings)
    for (const r of ripples) {
      ctx.strokeStyle = rgba(r.color, r.alpha);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // nodes — organic breathing via per-node phase
    for (const n of nodes) {
      const breathe = 0.5 + 0.5 * Math.sin(time * 0.0008 + n.phase);
      const alpha = 0.18 + breathe * 0.14 + n.glow * 0.55 + activity * 0.08;
      const radius = n.r + n.glow * 1.6;
      ctx.fillStyle = rgba(GREEN, Math.min(alpha, 0.85));
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fill();
      if (n.glow > 0.05) {
        ctx.fillStyle = rgba(GREEN, n.glow * 0.12);
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // sparks — bright heads traveling along their line
    for (const s of sparks) {
      const a = nodes[s.a], b = nodes[s.b];
      const x = a.x + (b.x - a.x) * s.t;
      const y = a.y + (b.y - a.y) * s.t;
      ctx.fillStyle = rgba(s.color, 0.9);
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba(s.color, 0.15);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      // short trail
      const tx = a.x + (b.x - a.x) * Math.max(0, s.t - 0.08);
      const ty = a.y + (b.y - a.y) * Math.max(0, s.t - 0.08);
      ctx.strokeStyle = rgba(s.color, 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  // One calm, non-animated frame for reduced-motion users.
  function drawStaticFrame() {
    const pairs = neighbors();
    ctx.clearRect(0, 0, width, height);
    for (const [i, j, d] of pairs) {
      const fade = 1 - d / LINK_DIST;
      ctx.strokeStyle = rgba(GREEN, 0.04 + fade * 0.05);
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[j].x, nodes[j].y);
      ctx.stroke();
    }
    for (const n of nodes) {
      ctx.fillStyle = rgba(GREEN, 0.25);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(time) {
    if (!running) return;
    // Recover if the page loaded while the window had no size (background tab).
    if (width === 0 && window.innerWidth > 0) resize();
    const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
    lastTime = time;
    step(dt, time);
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduceMotion.matches) return;
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  // --- wiring ---
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener("mouseout", () => { mouse.x = -9999; mouse.y = -9999; });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop(); else start();
  });
  reduceMotion.addEventListener?.("change", () => {
    if (reduceMotion.matches) { stop(); drawStaticFrame(); }
    else start();
  });

  window.NeuralBG = {
    // 0 = idle, 1 = thinking. The field visibly "processes" while NIB2 works.
    setActivity(level) { activity = Math.max(0, Math.min(1, level)); },
  };

  resize();
  start();
})();
