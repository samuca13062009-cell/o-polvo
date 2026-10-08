/* O polvo do topo da página: oito tentáculos que seguem o ponteiro e um jato de tinta ao clique. */
(function () {
  "use strict";
  var canvas = document.getElementById("octo");
  if (!canvas || !canvas.getContext) return;
  var hero = canvas.parentElement, ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var N = 26;                       // segmentos por tentáculo
  var W = 0, H = 0, dpr = 1, R = 60, t = 0;
  var home = { x: 0, y: 0 }, body = { x: 0, y: 0, vx: 0, vy: 0 };
  var ptr = { x: 0, y: 0, on: false };
  var arms = [], ink = [], bubbles = [];
  var raf = 0, inView = true;

  function build() {
    arms = [];
    for (var i = 0; i < 8; i++) {
      var a = Math.PI * (0.95 - 0.9 * i / 7);   // leque da esquerda para a direita, por baixo
      var arm = { a: a, k: 3.3 + (i % 2) * 0.7 + (i === 3 || i === 4 ? 0.4 : 0), phase: i * 1.7, pts: [], tip: { x: 0, y: 0 }, reach: 0 };
      for (var j = 0; j <= N; j++) arm.pts.push({ x: 0, y: 0 });
      arms.push(arm);
    }
    for (var b = 0; b < 28; b++) bubbles.push({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 3.5, s: 0.15 + Math.random() * 0.5 });
  }

  function basePoint(arm) {
    return { x: body.x + Math.cos(arm.a) * R * 0.68, y: body.y + R * 0.42 + Math.sin(arm.a) * R * 0.24 };
  }

  function layout() {
    var rect = hero.getBoundingClientRect();
    W = rect.width; H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    var wide = W >= 900;
    R = wide ? Math.min(W * 0.082, H * 0.145) : Math.min(W * 0.14, H * 0.085);
    home.x = wide ? W * 0.73 : W * 0.6;
    home.y = wide ? H * 0.4 : H * 0.72;
    var first = !arms.length;
    if (first) build();
    body.x = home.x; body.y = home.y; body.vx = body.vy = 0;
    arms.forEach(function (arm) {
      arm.len = R * arm.k; arm.seg = arm.len / N;
      var b = basePoint(arm);
      for (var j = 0; j <= N; j++) {
        arm.pts[j].x = b.x + Math.cos(arm.a) * arm.seg * j;
        arm.pts[j].y = b.y + Math.sin(arm.a) * arm.seg * j;
      }
      arm.tip.x = arm.pts[N].x; arm.tip.y = arm.pts[N].y;
    });
  }

  function step() {
    t += 1 / 60;
    // corpo: flutua em torno do sítio e inclina-se ligeiramente para o ponteiro
    var tx = home.x + Math.sin(t * 0.5) * R * 0.12, ty = home.y + Math.sin(t * 0.8) * R * 0.1;
    if (ptr.on) { tx += (ptr.x - home.x) * 0.05; ty += (ptr.y - home.y) * 0.05; }
    body.vx = (body.vx + (tx - body.x) * 0.012) * 0.92;
    body.vy = (body.vy + (ty - body.y) * 0.012) * 0.92;
    body.x += body.vx; body.y += body.vy;

    // os três tentáculos mais próximos estendem-se até ao ponteiro
    var order = arms.map(function (arm, i) {
      var b = basePoint(arm);
      return { i: i, d: Math.hypot(ptr.x - b.x, ptr.y - b.y) };
    }).sort(function (p, q) { return p.d - q.d; });
    arms.forEach(function (arm) { arm.want = false; });
    if (ptr.on) for (var k = 0; k < 3; k++) if (order[k].d < arms[order[k].i].len * 1.02) arms[order[k].i].want = true;

    arms.forEach(function (arm) {
      var b = basePoint(arm), p = arm.pts, j;
      var sway = arm.a + Math.sin(t * 0.55 + arm.phase) * 0.28;
      var gx = b.x + Math.cos(sway) * arm.len * 0.8, gy = b.y + Math.sin(sway) * arm.len * 0.8 + R * 0.3;
      if (arm.want) { gx = ptr.x; gy = ptr.y; }
      arm.reach += ((arm.want ? 1 : 0) - arm.reach) * 0.08;
      arm.tip.x += (gx - arm.tip.x) * 0.075; arm.tip.y += (gy - arm.tip.y) * 0.075;

      // ondulação ao longo do tentáculo
      for (j = 1; j < N; j++) {
        var f = j / N, w = Math.sin(t * 1.5 - j * 0.42 + arm.phase) * 0.55 * f;
        p[j].x += Math.cos(arm.a + Math.PI / 2) * w; p[j].y += Math.sin(arm.a + Math.PI / 2) * w + 0.12 * f;
      }
      // cinemática inversa (FABRIK): da ponta para a base e de volta
      p[N].x = arm.tip.x; p[N].y = arm.tip.y;
      for (j = N - 1; j >= 0; j--) pull(p[j], p[j + 1], arm.seg);
      p[0].x = b.x; p[0].y = b.y;
      for (j = 1; j <= N; j++) pull(p[j], p[j - 1], arm.seg);
    });

    for (var n = ink.length - 1; n >= 0; n--) {
      var q = ink[n];
      q.x += q.vx; q.y += q.vy; q.vx *= 0.955; q.vy = q.vy * 0.955 - 0.01; q.r += 0.55; q.life -= 0.011;
      if (q.life <= 0) ink.splice(n, 1);
    }
    bubbles.forEach(function (bb) { bb.y -= bb.s / Math.max(H, 1); if (bb.y < -0.02) { bb.y = 1.02; bb.x = Math.random(); } });
  }

  function pull(p, anchor, len) {
    var dx = p.x - anchor.x, dy = p.y - anchor.y, d = Math.hypot(dx, dy) || 0.0001;
    p.x = anchor.x + dx / d * len; p.y = anchor.y + dy / d * len;
  }

  function drawArm(arm, shade) {
    var src = arm.pts, p = arm.draw || (arm.draw = src.map(function () { return {}; })), L = [], Rt = [], j, w0 = R * 0.36;
    // suaviza a linha só para o desenho, para a ponta não fazer cotovelos
    for (j = 0; j <= N; j++) { p[j].x = src[j].x; p[j].y = src[j].y; }
    for (var pass = 0; pass < 3; pass++) {
      for (j = 1; j < N; j++) { p[j].x = (p[j - 1].x + 2 * p[j].x + p[j + 1].x) / 4; p[j].y = (p[j - 1].y + 2 * p[j].y + p[j + 1].y) / 4; }
    }
    p[N].x = (p[N - 1].x * 2 + p[N].x) / 3; p[N].y = (p[N - 1].y * 2 + p[N].y) / 3;
    for (j = 0; j <= N; j++) {
      var a = p[Math.max(0, j - 1)], c = p[Math.min(N, j + 1)];
      var dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 1;
      var nx = -dy / d, ny = dx / d, w = w0 * Math.pow(1 - j / N, 1.05) + 1.1;
      L.push([p[j].x + nx * w, p[j].y + ny * w]); Rt.push([p[j].x - nx * w, p[j].y - ny * w]);
      p[j].nx = nx; p[j].ny = ny; p[j].w = w;
    }
    ctx.beginPath();
    ctx.moveTo(L[0][0], L[0][1]);
    for (j = 1; j <= N; j++) ctx.lineTo(L[j][0], L[j][1]);
    for (j = N; j >= 0; j--) ctx.lineTo(Rt[j][0], Rt[j][1]);
    ctx.closePath();
    ctx.fillStyle = shade; ctx.fill();
    // ventosas
    ctx.fillStyle = "rgba(250, 221, 198, .78)";
    var side = arm.a > Math.PI / 2 ? 1 : -1;
    for (j = 2; j < N - 2; j += 2) {
      if (p[j].w < 3) break;
      ctx.beginPath();
      ctx.arc(p[j].x + p[j].nx * p[j].w * 0.38 * side, p[j].y + p[j].ny * p[j].w * 0.38 * side, p[j].w * 0.24, 0, 6.2832);
      ctx.fill();
    }
  }

  function drawHead() {
    var x = body.x, y = body.y, breath = Math.sin(t * 1.5) * 0.028, tilt = Math.max(-0.25, Math.min(0.25, body.vx * 0.05));
    var g = ctx.createRadialGradient(x - R * 0.35, y - R * 1.1, R * 0.1, x, y - R * 0.3, R * 1.7);
    g.addColorStop(0, "#f09a72"); g.addColorStop(0.45, "#d9643f"); g.addColorStop(1, "#a23c22");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y + R * 0.28, R * 0.86, R * 0.56, 0, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x - tilt * R, y - R * 0.55, R * 0.94 * (1 + breath), R * 1.16 * (1 - breath), tilt, 0, 6.2832); ctx.fill();
    // pintas
    ctx.fillStyle = "rgba(255, 214, 186, .22)";
    [[-0.38, -1.05, 0.13], [0.22, -1.3, 0.09], [0.45, -0.8, 0.07], [-0.1, -0.72, 0.06], [-0.55, -0.55, 0.05]].forEach(function (s) {
      ctx.beginPath(); ctx.arc(x + s[0] * R - tilt * R, y + s[1] * R, s[2] * R, 0, 6.2832); ctx.fill();
    });
    // olhos, com a pupila horizontal típica do polvo
    var lx = ptr.on ? ptr.x - x : 0, ly = ptr.on ? ptr.y - y : R, ld = Math.hypot(lx, ly) || 1;
    var ox = lx / ld * R * 0.055, oy = ly / ld * R * 0.04;
    var blink = (t % 5.2) < 0.13 ? 0.15 : 1;
    [-1, 1].forEach(function (s) {
      var ex = x + s * R * 0.4, ey = y + R * 0.1;
      ctx.fillStyle = "#f6f0e3";
      ctx.beginPath(); ctx.ellipse(ex, ey, R * 0.2, R * 0.17 * blink, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#071a2b";
      ctx.beginPath(); ctx.ellipse(ex + ox, ey + oy * blink, R * 0.115, R * 0.058 * blink, 0, 0, 6.2832); ctx.fill();
    });
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(246, 240, 227, .16)"; ctx.lineWidth = 1;
    bubbles.forEach(function (b) {
      ctx.beginPath(); ctx.arc(b.x * W + Math.sin(t + b.x * 40) * 6, b.y * H, b.r, 0, 6.2832); ctx.stroke();
    });
    [0, 7, 1, 6, 2, 5, 3, 4].forEach(function (i, n) { drawArm(arms[i], n < 4 ? "#b9482c" : "#cf5a37"); });
    drawHead();
    ink.forEach(function (q) {
      ctx.fillStyle = "rgba(3, 12, 22, " + (q.life * 0.42).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.2832); ctx.fill();
    });
  }

  function squirt() {
    var dx = ptr.x - body.x, dy = ptr.y - body.y, d = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx);
    for (var i = 0; i < 46; i++) {
      var s = 1.5 + Math.random() * 7, aa = a + (Math.random() - 0.5) * 1.1;
      ink.push({ x: body.x, y: body.y + R * 0.3, vx: Math.cos(aa) * s, vy: Math.sin(aa) * s, r: 5 + Math.random() * 14, life: 0.6 + Math.random() * 0.4 });
    }
    body.vx -= dx / d * 15; body.vy -= dy / d * 15;   // recua com o jato
  }

  function frame() {
    raf = 0;
    step(); draw();
    if (inView && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && !reduce && inView && !document.hidden) raf = requestAnimationFrame(frame); }

  function still() { for (var i = 0; i < 240; i++) step(); draw(); }

  function setPtr(e) {
    var r = canvas.getBoundingClientRect();
    ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = true;
  }

  layout();
  if (reduce) { still(); window.addEventListener("resize", function () { layout(); still(); }); return; }

  hero.addEventListener("pointermove", setPtr);
  hero.addEventListener("pointerleave", function () { ptr.on = false; });
  hero.addEventListener("pointercancel", function () { ptr.on = false; });
  hero.addEventListener("pointerdown", function (e) {
    if (e.target.closest("a, button")) return;
    setPtr(e); squirt();
    if (e.pointerType !== "mouse") setTimeout(function () { ptr.on = false; }, 1400);
  });
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
  document.addEventListener("visibilitychange", wake);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; wake(); }).observe(hero);
  }
  wake();
})();
