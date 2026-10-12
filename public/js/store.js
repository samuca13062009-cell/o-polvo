/* Acesso aos dados. Usa o servidor quando existe; caso contrário (ficheiro aberto
   diretamente) guarda neste browser, em modo de demonstração. */
(function () {
  "use strict";
  var LS_DB = "opolvo.db.v1", SS_TOKEN = "opolvo.token";
  var mode = null;

  function localDb() {
    var raw = {};
    try { raw = JSON.parse(localStorage.getItem(LS_DB)) || {}; } catch (_) { /* vazio */ }
    return { settings: Shared.mergeSettings(raw.settings), reservations: raw.reservations || [] };
  }
  function localSave(db) { try { localStorage.setItem(LS_DB, JSON.stringify(db)); } catch (_) { /* cheio ou bloqueado */ } }
  function uid() { return (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2)); }
  function token() { try { return sessionStorage.getItem(SS_TOKEN); } catch (_) { return null; } }

  function fail(message, errors, status) {
    var e = new Error(message); e.errors = errors || {}; e.status = status; return e;
  }

  async function call(method, url, body, auth) {
    var headers = {};
    if (body) headers["Content-Type"] = "application/json";
    if (auth) headers.Authorization = "Bearer " + (token() || "");
    var res;
    try { res = await fetch(url, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined }); }
    catch (_) { throw fail("Sem ligação ao servidor.", null, 0); }
    var data = {};
    try { data = await res.json(); } catch (_) { /* sem corpo */ }
    if (!res.ok) throw fail(data.error || "Ocorreu um erro.", data.errors, res.status);
    return data;
  }

  async function init() {
    if (mode) return mode;
    if (location.protocol === "file:") return (mode = "local");
    try {
      var res = await fetch("/api/public");
      var data = await res.json();
      mode = res.ok && data.settings ? "api" : "local";
    } catch (_) { mode = "local"; }
    return mode;
  }

  var Store = {
    init: init,
    get mode() { return mode; },

    /* ----- Site público ----- */
    async publicDay(date) {
      await init();
      if (mode === "api") return call("GET", "/api/public?date=" + encodeURIComponent(date));
      var db = localDb(), s = db.settings;
      return {
        settings: { maxParty: s.maxParty, maxDaysAhead: s.maxDaysAhead, closedWeekdays: s.closedWeekdays, blockedDates: s.blockedDates },
        closed: Shared.closedReason(s, date),
        slots: Shared.availability(s, db.reservations, date)
      };
    },
    async book(input) {
      await init();
      if (mode === "api") return call("POST", "/api/reservations", input);
      var db = localDb(), v = Shared.validate(input, db.settings, false);
      if (!v.ok) throw fail("Verifique os dados.", v.errors, 400);
      var slot = Shared.availability(db.settings, db.reservations, v.value.date).find(function (s) { return s.time === v.value.time; });
      if (!slot || slot.left < v.value.people) throw fail("Esse horário já não tem lugares.", { time: "Sem lugares." }, 409);
      var now = new Date().toISOString();
      var r = Object.assign(v.value, { id: uid(), code: Shared.newCode(), status: "pendente", source: "site", table: "", consentAt: now, policyVersion: Shared.POLICY_VERSION, createdAt: now, updatedAt: now });
      db.reservations.push(r); localSave(db);
      return { ok: true, code: r.code, reservation: r };
    },

    /* ----- Administração ----- */
    get loggedIn() { return mode === "local" || !!token(); },
    async login(password) {
      await init();
      if (mode === "local") return true;
      var data = await call("POST", "/api/admin/login", { password: password });
      try { sessionStorage.setItem(SS_TOKEN, data.token); } catch (_) { /* sem sessionStorage */ }
      return true;
    },
    async logout() {
      if (mode === "api") { try { await call("POST", "/api/admin/logout", null, true); } catch (_) { /* já expirou */ } }
      try { sessionStorage.removeItem(SS_TOKEN); } catch (_) { /* nada */ }
    },
    async load() {
      await init();
      if (mode === "api") return call("GET", "/api/admin/reservations", null, true);
      return localDb();
    },
    async saveReservation(input) {
      if (mode === "api") {
        var data = input.id
          ? await call("PUT", "/api/admin/reservations/" + input.id, input, true)
          : await call("POST", "/api/admin/reservations", input, true);
        return data.reservation;
      }
      var db = localDb(), now = new Date().toISOString();
      var prev = input.id && db.reservations.find(function (r) { return r.id === input.id; });
      var v = Shared.validate(Object.assign({}, prev || {}, input), db.settings, true);
      if (!v.ok) throw fail("Verifique os dados.", v.errors, 400);
      var r;
      if (prev) r = Object.assign(prev, v.value, { updatedAt: now });
      else { r = Object.assign(v.value, { id: uid(), code: Shared.newCode(), createdAt: now, updatedAt: now }); db.reservations.push(r); }
      localSave(db);
      return r;
    },
    async removeReservation(id) {
      if (mode === "api") return call("DELETE", "/api/admin/reservations/" + id, null, true);
      var db = localDb();
      db.reservations = db.reservations.filter(function (r) { return r.id !== id; });
      localSave(db);
    },
    async saveSettings(settings) {
      if (mode === "api") return (await call("PUT", "/api/admin/settings", settings, true)).settings;
      var db = localDb();
      db.settings = Shared.mergeSettings(settings); localSave(db);
      return db.settings;
    }
  };

  window.Store = Store;
})();
