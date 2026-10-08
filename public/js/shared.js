/* Regras de reservas partilhadas entre o site, o painel e o servidor. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Shared = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var DEFAULT_SETTINGS = {
    capacity: 40,          // lugares disponíveis em simultâneo
    duration: 90,          // minutos que uma mesa fica ocupada
    interval: 30,          // minutos entre horários de reserva
    maxParty: 12,          // máximo de pessoas por reserva feita no site
    maxDaysAhead: 90,      // até quantos dias de antecedência se pode reservar
    lunch: ["12:00", "14:30"],   // primeira e última hora de reserva
    dinner: ["19:00", "22:00"],
    closedWeekdays: [],    // 0 = domingo … 6 = sábado
    blockedDates: []       // [{ date: "2026-12-25", reason: "Natal" }]
  };

  var STATUSES = ["pendente", "confirmada", "sentada", "concluida", "falta", "cancelada"];
  var ACTIVE = ["pendente", "confirmada", "sentada", "concluida"];
  var ZONES = ["any", "sala", "esplanada"];
  var TZ = "Europe/Lisbon";

  function toMin(t) { var p = String(t).split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fromMin(m) { return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
  function isDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + "T12:00:00Z")); }
  function isTime(s) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(s); }

  // Data e hora atuais em Santa Cruz, independentemente do fuso do dispositivo
  function nowLisbon(d) {
    var parts = {};
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short"
    }).formatToParts(d || new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return {
      date: parts.year + "-" + parts.month + "-" + parts.day,
      minutes: (+parts.hour) * 60 + (+parts.minute),
      weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday)
    };
  }

  function addDays(date, n) {
    var d = new Date(date + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function weekdayOf(date) { return new Date(date + "T12:00:00Z").getUTCDay(); }

  function slotsFor(settings) {
    var out = [];
    [["lunch", settings.lunch], ["dinner", settings.dinner]].forEach(function (p) {
      if (!p[1] || !isTime(p[1][0]) || !isTime(p[1][1])) return;
      for (var m = toMin(p[1][0]); m <= toMin(p[1][1]); m += Math.max(5, settings.interval)) {
        out.push({ time: fromMin(m), period: p[0] });
      }
    });
    return out;
  }

  function closedReason(settings, date) {
    var b = (settings.blockedDates || []).find(function (x) { return x.date === date; });
    if (b) return b.reason || "Encerrado";
    if ((settings.closedWeekdays || []).indexOf(weekdayOf(date)) !== -1) return "Encerrado";
    return null;
  }

  // Lugares ocupados em cada horário: conta as reservas cuja permanência se sobrepõe
  function availability(settings, reservations, date, excludeId) {
    var day = reservations.filter(function (r) {
      return r.date === date && ACTIVE.indexOf(r.status) !== -1 && r.id !== excludeId;
    });
    var closed = closedReason(settings, date);
    var today = nowLisbon();
    return slotsFor(settings).map(function (s) {
      var t = toMin(s.time), used = 0;
      day.forEach(function (r) { if (Math.abs(toMin(r.time) - t) < settings.duration) used += r.people; });
      var past = date < today.date || (date === today.date && t <= today.minutes + 30);
      return {
        time: s.time, period: s.period, used: used,
        left: closed || past ? 0 : Math.max(0, settings.capacity - used),
        past: past
      };
    });
  }

  function clean(s, max) { return String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max); }

  // Valida e normaliza uma reserva. `admin` relaxa os limites do site público.
  function validate(input, settings, admin) {
    var e = {}, v = {};
    input = input || {};
    v.name = clean(input.name, 80);
    if (v.name.length < 2) e.name = "Indique o nome.";
    v.phone = clean(input.phone, 24);
    if (!/^\+?[\d\s().-]{6,22}$/.test(v.phone) && !(admin && !v.phone)) e.phone = "Indique um telefone válido.";
    v.email = clean(input.email, 120);
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "E-mail inválido.";
    v.date = clean(input.date, 10);
    if (!isDate(v.date)) e.date = "Escolha uma data.";
    v.time = clean(input.time, 5);
    if (!isTime(v.time)) e.time = "Escolha uma hora.";
    v.people = parseInt(input.people, 10);
    var max = admin ? 200 : settings.maxParty;
    if (!(v.people >= 1 && v.people <= max)) e.people = "Entre 1 e " + max + " pessoas.";
    v.zone = ZONES.indexOf(input.zone) !== -1 ? input.zone : "any";
    v.occasion = clean(input.occasion, 40);
    v.notes = clean(input.notes, 500);

    if (!admin && !e.date && !e.time) {
      var today = nowLisbon().date;
      if (v.date < today) e.date = "Essa data já passou.";
      else if (v.date > addDays(today, settings.maxDaysAhead)) e.date = "Só aceitamos reservas até " + settings.maxDaysAhead + " dias.";
      else if (closedReason(settings, v.date)) e.date = "Estamos encerrados nesse dia.";
      else if (!slotsFor(settings).some(function (s) { return s.time === v.time; })) e.time = "Hora indisponível.";
    }
    if (admin) {
      v.table = clean(input.table, 20);
      v.status = STATUSES.indexOf(input.status) !== -1 ? input.status : "confirmada";
      v.source = clean(input.source, 20) || "telefone";
    }
    return { ok: Object.keys(e).length === 0, errors: e, value: v };
  }

  function mergeSettings(input) {
    var s = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    input = input || {};
    function int(k, lo, hi) { var n = parseInt(input[k], 10); if (n >= lo && n <= hi) s[k] = n; }
    int("capacity", 1, 1000); int("duration", 15, 480); int("interval", 5, 120);
    int("maxParty", 1, 200); int("maxDaysAhead", 1, 730);
    ["lunch", "dinner"].forEach(function (k) {
      var p = input[k];
      if (Array.isArray(p) && isTime(p[0]) && isTime(p[1]) && toMin(p[0]) <= toMin(p[1])) s[k] = [p[0], p[1]];
    });
    if (Array.isArray(input.closedWeekdays)) {
      s.closedWeekdays = input.closedWeekdays.map(Number).filter(function (n, i, a) { return n >= 0 && n <= 6 && a.indexOf(n) === i; });
    }
    if (Array.isArray(input.blockedDates)) {
      s.blockedDates = input.blockedDates.filter(function (b) { return b && isDate(b.date); }).slice(0, 400)
        .map(function (b) { return { date: b.date, reason: clean(b.reason, 60) }; })
        .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    }
    return s;
  }

  function newCode() {
    var abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", out = "";
    for (var i = 0; i < 5; i++) out += abc[Math.floor(Math.random() * abc.length)];
    return "PV-" + out;
  }

  return {
    DEFAULT_SETTINGS: DEFAULT_SETTINGS, STATUSES: STATUSES, ACTIVE: ACTIVE, ZONES: ZONES, TZ: TZ,
    toMin: toMin, fromMin: fromMin, isDate: isDate, isTime: isTime, nowLisbon: nowLisbon,
    addDays: addDays, weekdayOf: weekdayOf, slotsFor: slotsFor, closedReason: closedReason,
    availability: availability, validate: validate, mergeSettings: mergeSettings, newCode: newCode
  };
});
