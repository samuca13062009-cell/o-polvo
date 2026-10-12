/* O Polvo — servidor do site e das reservas. Sem dependências: `node server.js`. */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Shared = require("./public/js/shared.js");

const ROOT = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "reservas.json");
const CONFIG_FILE = path.join(__dirname, "config.json");
const SESSION_MS = 12 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/* ---------- Configuração ---------- */
function loadConfig() {
  let cfg = {};
  try { cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")); } catch (_) { /* primeira execução */ }
  if (!cfg.adminPassword) {
    // Sem palavra-passe por omissão: gera-se uma na primeira execução
    cfg = { port: cfg.port || 4173, adminPassword: crypto.randomBytes(9).toString("base64url") };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
    console.log("\n  Foi criada uma palavra-passe de administração em config.json.\n  Abra o ficheiro para a ver ou alterar.\n");
  }
  return cfg;
}
const config = loadConfig();
const PORT = +process.env.PORT || config.port || 4173;
// Dias que uma reserva fica guardada depois da data da refeição (ver Política de Privacidade)
const RETENTION_DAYS = config.retentionDays > 0 ? +config.retentionDays : 90;

/* ---------- Base de dados (ficheiro JSON) ---------- */
let db = { settings: Shared.mergeSettings({}), reservations: [] };
try {
  const raw = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  db.settings = Shared.mergeSettings(raw.settings);
  db.reservations = Array.isArray(raw.reservations) ? raw.reservations : [];
} catch (_) { /* ainda não existe */ }

function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

// Apaga as reservas cuja data já passou há mais do que o prazo de conservação
function purgeOld() {
  const limit = Shared.addDays(Shared.nowLisbon().date, -RETENTION_DAYS);
  const kept = db.reservations.filter((r) => !(Shared.isDate(r.date) && r.date < limit));
  if (kept.length !== db.reservations.length) { db.reservations = kept; save(); }
}
purgeOld();
setInterval(purgeOld, DAY_MS).unref();

/* ---------- Sessões e limites ---------- */
const sessions = new Map();
const hits = new Map();

function limited(key, max, windowMs) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of sessions) if (v < now) sessions.delete(k);
  for (const [k, v] of hits) if (!v.some((t) => now - t < 3600000)) hits.delete(k);
}, 600000).unref();

function isAdmin(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || "");
  const exp = m && sessions.get(m[1]);
  return !!exp && exp > Date.now();
}
function passwordOk(given) {
  const a = crypto.createHash("sha256").update(String(given)).digest();
  const b = crypto.createHash("sha256").update(String(config.adminPassword)).digest();
  return crypto.timingSafeEqual(a, b);
}

/* ---------- Utilitários HTTP ---------- */
function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > 64 * 1024) { reject(new Error("too large")); req.destroy(); } else chunks.push(c);
    });
    req.on("end", () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

const publicSettings = () => {
  const s = db.settings;
  return { maxParty: s.maxParty, maxDaysAhead: s.maxDaysAhead, closedWeekdays: s.closedWeekdays, blockedDates: s.blockedDates };
};
const publicSlots = (date) =>
  Shared.availability(db.settings, db.reservations, date).map((s) => ({ time: s.time, period: s.period, left: s.left, past: s.past }));

/* ---------- API ---------- */
async function api(req, res, url) {
  const ip = req.socket.remoteAddress || "?";
  const route = req.method + " " + url.pathname;

  if (route === "GET /api/public") {
    const date = url.searchParams.get("date");
    return send(res, 200, {
      settings: publicSettings(),
      closed: Shared.isDate(date) ? Shared.closedReason(db.settings, date) : null,
      slots: Shared.isDate(date) ? publicSlots(date) : []
    });
  }

  if (route === "POST /api/reservations") {
    if (limited("new:" + ip, 8, 3600000)) return send(res, 429, { error: "Demasiados pedidos. Tente mais tarde ou ligue-nos." });
    const body = await readBody(req);
    if (body.website) return send(res, 200, { ok: true }); // armadilha para bots
    const v = Shared.validate(body, db.settings, false);
    if (!v.ok) return send(res, 400, { error: "Verifique os dados.", errors: v.errors });
    const slot = publicSlots(v.value.date).find((s) => s.time === v.value.time);
    if (!slot || slot.left < v.value.people) {
      return send(res, 409, { error: "Esse horário acabou de ficar sem lugares.", errors: { time: "Sem lugares." } });
    }
    const now = new Date().toISOString();
    const r = Object.assign(v.value, {
      id: crypto.randomUUID(), code: Shared.newCode(), status: "pendente", source: "site", table: "",
      consentAt: now, policyVersion: Shared.POLICY_VERSION, createdAt: now, updatedAt: now
    });
    db.reservations.push(r);
    save();
    return send(res, 201, { ok: true, code: r.code, reservation: { date: r.date, time: r.time, people: r.people, zone: r.zone, name: r.name } });
  }

  if (route === "POST /api/admin/login") {
    if (limited("login:" + ip, 8, 600000)) return send(res, 429, { error: "Demasiadas tentativas. Aguarde 10 minutos." });
    const body = await readBody(req);
    if (!passwordOk(body.password || "")) return send(res, 401, { error: "Palavra-passe incorreta." });
    const token = crypto.randomBytes(32).toString("base64url");
    sessions.set(token, Date.now() + SESSION_MS);
    return send(res, 200, { token });
  }

  if (!url.pathname.startsWith("/api/admin/")) return send(res, 404, { error: "Não encontrado." });
  if (!isAdmin(req)) return send(res, 401, { error: "Sessão expirada." });

  if (route === "POST /api/admin/logout") {
    sessions.delete((req.headers.authorization || "").slice(7));
    return send(res, 200, { ok: true });
  }
  if (route === "GET /api/admin/reservations") return send(res, 200, { reservations: db.reservations, settings: db.settings });
  if (route === "PUT /api/admin/settings") {
    db.settings = Shared.mergeSettings(await readBody(req));
    save();
    return send(res, 200, { settings: db.settings });
  }
  if (route === "POST /api/admin/reservations") {
    const v = Shared.validate(await readBody(req), db.settings, true);
    if (!v.ok) return send(res, 400, { error: "Verifique os dados.", errors: v.errors });
    const now = new Date().toISOString();
    const r = Object.assign(v.value, { id: crypto.randomUUID(), code: Shared.newCode(), createdAt: now, updatedAt: now });
    db.reservations.push(r);
    save();
    return send(res, 201, { reservation: r });
  }

  const m = /^\/api\/admin\/reservations\/([\w-]{8,64})$/.exec(url.pathname);
  if (m) {
    const i = db.reservations.findIndex((r) => r.id === m[1]);
    if (i === -1) return send(res, 404, { error: "Reserva não encontrada." });
    if (req.method === "DELETE") {
      db.reservations.splice(i, 1);
      save();
      return send(res, 200, { ok: true });
    }
    if (req.method === "PUT") {
      const v = Shared.validate(Object.assign({}, db.reservations[i], await readBody(req)), db.settings, true);
      if (!v.ok) return send(res, 400, { error: "Verifique os dados.", errors: v.errors });
      db.reservations[i] = Object.assign(db.reservations[i], v.value, { updatedAt: new Date().toISOString() });
      save();
      return send(res, 200, { reservation: db.reservations[i] });
    }
  }
  return send(res, 404, { error: "Não encontrado." });
}

/* ---------- Ficheiros estáticos ---------- */
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".ico": "image/x-icon", ".pdf": "application/pdf", ".woff2": "font/woff2"
};
function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/index.html";
  if (rel === "/admin") rel = "/admin.html";
  if (rel === "/privacidade" || rel === "/termos" || rel === "/cookies") rel += ".html";
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("Página não encontrada"); }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "SAMEORIGIN", "Permissions-Policy": "geolocation=(), camera=(), microphone=()"
    });
    res.end(req.method === "HEAD" ? undefined : buf);
  });
}

http.createServer((req, res) => {
  let url;
  try { url = new URL(req.url, "http://localhost"); } catch (_) { res.writeHead(400); return res.end(); }
  if (url.pathname.startsWith("/api/")) {
    return api(req, res, url).catch(() => { if (!res.headersSent) send(res, 400, { error: "Pedido inválido." }); });
  }
  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); return res.end(); }
  serveStatic(req, res, url);
}).listen(PORT, () => {
  console.log("  O Polvo está no ar:");
  console.log("    Site   →  http://localhost:" + PORT);
  console.log("    Admin  →  http://localhost:" + PORT + "/admin\n");
});
