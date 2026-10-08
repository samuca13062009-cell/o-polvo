/* O Polvo — painel de gestão de reservas. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function h(tag, props, kids) {
    var el = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "class") el.className = props[k];
      else if (k === "text") el.textContent = props[k];
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), props[k]);
      else if (props[k] !== false && props[k] != null) el.setAttribute(k, props[k] === true ? "" : props[k]);
    });
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }

  var STATUS = {
    pendente: "Por confirmar", confirmada: "Confirmada", sentada: "Na mesa",
    concluida: "Concluída", falta: "Faltou", cancelada: "Cancelada"
  };
  var ZONE = { any: "Sem preferência", sala: "Sala", esplanada: "Esplanada" };
  var WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  var today = Shared.nowLisbon().date;
  var S = {
    reservations: [], settings: Shared.mergeSettings({}), view: "dia", day: today,
    f: { q: "", range: "futuras", from: "", to: "", zone: "", source: "", statuses: {} },
    sort: { key: "when", dir: 1 }, blocked: [], known: null
  };

  function fmtDate(date, opts) {
    return new Intl.DateTimeFormat("pt-PT", Object.assign({ timeZone: "UTC" }, opts)).format(new Date(date + "T12:00:00Z"));
  }
  function isActive(r) { return Shared.ACTIVE.indexOf(r.status) !== -1; }
  function byTime(a, b) { return (a.date + a.time).localeCompare(b.date + b.time) || a.name.localeCompare(b.name); }

  function toast(text, kind, onclick) {
    var el = h("div", { class: "toast " + (kind || ""), text: text, onclick: function () { el.remove(); if (onclick) onclick(); } });
    $("#toasts").appendChild(el);
    setTimeout(function () { el.remove(); }, kind === "new" ? 12000 : 4500);
  }
  function fail(err) {
    if (err && err.status === 401) return showLogin("A sessão expirou. Entre novamente.");
    toast((err && err.message) || "Ocorreu um erro.", "bad");
  }

  /* ---------- Entrada ---------- */
  function showLogin(msg) {
    $("#app").hidden = true; $("#login").hidden = false;
    $("#loginErr").textContent = msg || "";
    $("#password").value = ""; $("#password").focus();
  }
  $("#loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    try { await Store.login($("#password").value); await start(); }
    catch (err) { $("#loginErr").textContent = err.message; }
  });
  $("#logoutBtn").addEventListener("click", async function () {
    await Store.logout();
    if (Store.mode === "local") location.href = "index.html"; else showLogin("");
  });

  /* ---------- Dados ---------- */
  async function refresh(silent) {
    try {
      var data = await Store.load();
      var news = [];
      if (S.known) data.reservations.forEach(function (r) { if (!S.known[r.id]) news.push(r); });
      S.known = {}; data.reservations.forEach(function (r) { S.known[r.id] = 1; });
      S.reservations = data.reservations; S.settings = data.settings;
      news.filter(function (r) { return r.source === "site"; }).forEach(function (r) {
        toast("Nova reserva do site: " + r.name + " · " + r.people + " pess. · " + fmtDate(r.date, { weekday: "short", day: "numeric", month: "short" }) + " " + r.time,
          "new", function () { S.day = r.date; setView("dia"); });
      });
      // não redesenhar por cima de quem está a escrever ou com o diálogo aberto
      if (!silent || (!$("#dlg").open && document.activeElement.tagName !== "INPUT")) render();
      else renderBadge();
      return true;
    } catch (err) { if (!silent || err.status === 401) fail(err); return false; }
  }

  async function start() {
    await Store.init();
    if (!Store.loggedIn) return showLogin("");
    if (!(await refresh())) return;
    $("#login").hidden = true; $("#app").hidden = false;
    var local = Store.mode === "local";
    $("#mode").hidden = !local; $("#banner").hidden = !local;
    S.blocked = S.settings.blockedDates.slice();
    fillConfig();
  }

  async function update(r, patch, message) {
    try {
      await Store.saveReservation(Object.assign({ id: r.id }, patch));
      await refresh();
      if (message) toast(message);
    } catch (err) { fail(err); }
  }

  /* ---------- Vistas ---------- */
  function setView(v) {
    S.view = v;
    $$(".views button").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.view === v)); });
    ["dia", "todas", "config"].forEach(function (n) { $("#view-" + n).hidden = n !== v; });
    render();
  }
  $$(".views button").forEach(function (b) { b.addEventListener("click", function () { setView(b.dataset.view); }); });

  function renderBadge() {
    var n = S.reservations.filter(function (r) { return r.status === "pendente" && r.date >= today; }).length;
    var badge = $("#pendingBadge"); badge.hidden = !n; badge.textContent = n;
    document.title = (n ? "(" + n + ") " : "") + "Reservas · O Polvo";
  }
  function render() {
    today = Shared.nowLisbon().date;
    renderBadge();
    if (S.view === "dia") renderDay();
    if (S.view === "todas") renderAll();
  }

  /* ----- Dia ----- */
  function waLink(r, text) {
    var digits = r.phone.replace(/\D/g, "");
    if (digits.length === 9) digits = "351" + digits;
    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(text);
  }
  function confirmText(r) {
    return "Olá " + r.name.split(" ")[0] + "! A sua reserva no restaurante O Polvo está confirmada: " +
      fmtDate(r.date, { weekday: "long", day: "numeric", month: "long" }) + " às " + r.time + ", " + r.people +
      (r.people === 1 ? " pessoa" : " pessoas") + ". Até breve!";
  }

  function actionsFor(r) {
    var acts = [];
    function act(label, patch, msg, cls) {
      acts.push(h("button", { class: "btn small " + (cls || ""), text: label, onclick: function (e) { e.stopPropagation(); update(r, patch, msg); } }));
    }
    if (r.status === "pendente") { act("Confirmar", { status: "confirmada" }, "Reserva confirmada.", "primary"); act("Recusar", { status: "cancelada" }, "Reserva cancelada."); }
    else if (r.status === "confirmada") { act("Chegou", { status: "sentada" }, null, "primary"); act("Faltou", { status: "falta" }); act("Cancelar", { status: "cancelada" }); }
    else if (r.status === "sentada") act("Concluir", { status: "concluida" }, null, "primary");
    else act("Reabrir", { status: "confirmada" });
    if (r.phone && (r.status === "pendente" || r.status === "confirmada")) {
      acts.push(h("a", { class: "btn small", href: waLink(r, confirmText(r)), target: "_blank", rel: "noopener", text: "WhatsApp", title: "Abrir mensagem de confirmação no WhatsApp", onclick: function (e) { e.stopPropagation(); } }));
    }
    acts.push(h("button", { class: "btn small", text: "Editar", onclick: function (e) { e.stopPropagation(); openDialog(r); } }));
    return acts;
  }

  function card(r) {
    var info = [];
    if (r.table) info.push(h("span", { class: "tagc", text: "Mesa " + r.table }));
    if (r.zone !== "any") info.push(h("span", { class: "tagc", text: ZONE[r.zone] }));
    if (r.occasion) info.push(h("span", { class: "tagc", text: r.occasion }));
    if (r.source === "site") info.push(h("span", { class: "tagc", text: "Site" }));
    if (r.notes) info.push(h("span", { class: "note", text: r.notes }));
    return h("article", { class: "res s-" + r.status, ondblclick: function () { openDialog(r); } }, [
      h("div", { class: "time", text: r.time }),
      h("div", { class: "who" }, [
        h("b", { text: r.name + " · " + r.people + (r.people === 1 ? " pessoa" : " pessoas") }),
        h("br"),
        h("span", {}, [h("span", { class: "pill s-" + r.status, text: STATUS[r.status] }), " ",
          r.phone ? h("a", { href: "tel:" + r.phone.replace(/[^\d+]/g, ""), text: r.phone }) : "sem telefone", " · " + r.code])
      ]),
      h("div", { class: "info" }, info),
      h("div", { class: "acts" }, actionsFor(r))
    ]);
  }

  function renderDay() {
    var day = S.reservations.filter(function (r) { return r.date === S.day; }).sort(byTime);
    var active = day.filter(isActive);
    var people = active.reduce(function (a, r) { return a + r.people; }, 0);
    var pending = day.filter(function (r) { return r.status === "pendente"; }).length;
    var avail = Shared.availability(S.settings, S.reservations, S.day);
    var peak = avail.reduce(function (a, s) { return s.used > a.used ? s : a; }, { used: 0, time: "" });

    $("#dayTitle").textContent = (S.day === today ? "Hoje, " : S.day === Shared.addDays(today, 1) ? "Amanhã, " : "") +
      fmtDate(S.day, { weekday: "long", day: "numeric", month: "long" });
    $("#dayPick").value = S.day;

    var k = $("#kpis"); k.textContent = "";
    function kpi(label, value, small, alert) {
      k.appendChild(h("div", { class: "kpi" + (alert ? " alert" : "") }, [h("span", { text: label }), h("b", { text: String(value) }), small ? h("small", { text: small }) : null]));
    }
    kpi("Reservas", active.length);
    kpi("Pessoas", people);
    kpi("Por confirmar", pending, null, pending > 0);
    kpi("Pico de ocupação", Math.round(peak.used / S.settings.capacity * 100) + "%", peak.used ? peak.time + " · " + peak.used + "/" + S.settings.capacity : "lotação " + S.settings.capacity);

    var occ = $("#occ"); occ.textContent = "";
    var closed = Shared.closedReason(S.settings, S.day);
    avail.forEach(function (s, i) {
      if (i && avail[i - 1].period !== s.period) occ.appendChild(h("div", { class: "gap" }));
      var pct = Math.min(100, s.used / S.settings.capacity * 100);
      occ.appendChild(h("div", { class: "col" + (pct >= 100 ? " full" : pct >= 80 ? " high" : ""), title: s.time + " — " + s.used + " de " + S.settings.capacity + " lugares" }, [
        h("div", { class: "barbox" }, [h("div", { class: "bar", style: "height:" + pct.toFixed(0) + "%" })]),
        h("b", { text: String(s.used || "") }), h("small", { text: s.time })
      ]));
    });

    var list = $("#dayList"); list.textContent = "";
    if (closed) list.appendChild(h("p", { class: "banner", text: "Dia bloqueado para reservas no site" + (closed !== "Encerrado" ? ": " + closed : "") + "." }));
    if (!day.length) {
      list.appendChild(h("p", { class: "empty", text: "Sem reservas para este dia." }));
      return;
    }
    [["Almoço", function (r) { return r.time < "17:00"; }], ["Jantar", function (r) { return r.time >= "17:00"; }]].forEach(function (p) {
      var rows = day.filter(p[1]);
      if (!rows.length) return;
      var act = rows.filter(isActive);
      list.appendChild(h("section", { class: "period" }, [
        h("h2", {}, [p[0], h("small", { text: act.length + (act.length === 1 ? " reserva · " : " reservas · ") + act.reduce(function (a, r) { return a + r.people; }, 0) + " pessoas" })])
      ].concat(rows.map(card))));
    });
  }

  function moveDay(n) { S.day = Shared.addDays(S.day, n); renderDay(); }
  $("#prevDay").addEventListener("click", function () { moveDay(-1); });
  $("#nextDay").addEventListener("click", function () { moveDay(1); });
  $("#todayBtn").addEventListener("click", function () { S.day = today; renderDay(); });
  $("#dayPick").addEventListener("change", function (e) { if (Shared.isDate(e.target.value)) { S.day = e.target.value; renderDay(); } });
  $("#printBtn").addEventListener("click", function () { window.print(); });

  /* ----- Todas ----- */
  var RANGES = [["hoje", "Hoje"], ["amanha", "Amanhã"], ["7dias", "Próximos 7 dias"], ["futuras", "Futuras"], ["passadas", "Passadas"], ["tudo", "Tudo"]];
  function rangeBounds() {
    var f = S.f;
    if (f.from || f.to) return [f.from || "0000", f.to || "9999"];
    switch (f.range) {
      case "hoje": return [today, today];
      case "amanha": return [Shared.addDays(today, 1), Shared.addDays(today, 1)];
      case "7dias": return [today, Shared.addDays(today, 6)];
      case "futuras": return [today, "9999"];
      case "passadas": return ["0000", Shared.addDays(today, -1)];
      default: return ["0000", "9999"];
    }
  }
  function filtered(ignoreStatus) {
    var f = S.f, b = rangeBounds(), q = f.q.trim().toLowerCase();
    var anyStatus = Object.keys(f.statuses).some(function (k) { return f.statuses[k]; });
    return S.reservations.filter(function (r) {
      if (r.date < b[0] || r.date > b[1]) return false;
      if (f.zone && r.zone !== f.zone) return false;
      if (f.source && r.source !== f.source) return false;
      if (!ignoreStatus && anyStatus && !f.statuses[r.status]) return false;
      if (q && [r.name, r.phone, r.email, r.code, r.notes, r.occasion, r.table].join(" ").toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }
  var COLS = [
    ["when", "Data e hora"], ["name", "Nome"], ["people", "Pess."], ["status", "Estado"], ["zone", "Zona / mesa"], ["notes", "Notas"], ["createdAt", "Criada"]
  ];
  function sortVal(r, key) {
    if (key === "when") return r.date + r.time;
    if (key === "status") return Shared.STATUSES.indexOf(r.status);
    return typeof r[key] === "number" ? r[key] : String(r[key] || "").toLowerCase();
  }

  function renderAll() {
    var f = S.f;
    var ranges = $("#ranges"); ranges.textContent = "";
    RANGES.forEach(function (r) {
      ranges.appendChild(h("button", { type: "button", text: r[1], "aria-pressed": String(!f.from && !f.to && f.range === r[0]),
        onclick: function () { f.range = r[0]; f.from = f.to = ""; $("#from").value = $("#to").value = ""; renderAll(); } }));
    });
    var base = filtered(true), chips = $("#statusChips"); chips.textContent = "";
    Shared.STATUSES.forEach(function (s) {
      var n = base.filter(function (r) { return r.status === s; }).length;
      chips.appendChild(h("button", { type: "button", "aria-pressed": String(!!f.statuses[s]),
        onclick: function () { f.statuses[s] = !f.statuses[s]; renderAll(); } }, [STATUS[s], h("small", { text: String(n) })]));
    });

    var rows = filtered().sort(function (a, b) {
      var x = sortVal(a, S.sort.key), y = sortVal(b, S.sort.key);
      return (x < y ? -1 : x > y ? 1 : 0) * S.sort.dir || byTime(a, b);
    });
    var act = rows.filter(isActive);
    $("#count").textContent = rows.length + (rows.length === 1 ? " reserva" : " reservas") + " · " +
      act.reduce(function (a, r) { return a + r.people; }, 0) + " pessoas (sem canceladas e faltas)";

    var table = $("#table"); table.textContent = "";
    table.appendChild(h("thead", {}, [h("tr", {}, COLS.map(function (c) {
      return h("th", { text: c[1], "aria-sort": S.sort.key === c[0] ? (S.sort.dir === 1 ? "ascending" : "descending") : null,
        onclick: function () { S.sort = { key: c[0], dir: S.sort.key === c[0] ? -S.sort.dir : 1 }; renderAll(); } });
    }))]));
    var body = h("tbody");
    rows.forEach(function (r) {
      body.appendChild(h("tr", { onclick: function () { openDialog(r); } }, [
        h("td", { class: "num" }, [fmtDate(r.date, { weekday: "short", day: "2-digit", month: "short", year: r.date.slice(0, 4) !== today.slice(0, 4) ? "numeric" : undefined }) + " · ", h("b", { text: r.time })]),
        h("td", {}, [h("b", { text: r.name }), h("span", { class: "muted", text: [r.phone, r.code].filter(Boolean).join(" · ") })]),
        h("td", { class: "num", text: String(r.people) }),
        h("td", {}, [h("span", { class: "pill s-" + r.status, text: STATUS[r.status] })]),
        h("td", { text: [r.zone !== "any" ? ZONE[r.zone] : "", r.table ? "Mesa " + r.table : ""].filter(Boolean).join(" · ") || "—" }),
        h("td", { class: "notes", text: [r.occasion, r.notes].filter(Boolean).join(" — ") }),
        h("td", { class: "num" }, [new Date(r.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }), h("span", { class: "muted", text: r.source })])
      ]));
    });
    if (!rows.length) body.appendChild(h("tr", {}, [h("td", { colspan: COLS.length, class: "notes", text: "Nenhuma reserva corresponde aos filtros.", style: "text-align:center;padding:36px;max-width:none" })]));
    table.appendChild(body);
  }

  $("#q").addEventListener("input", function (e) { S.f.q = e.target.value; renderAll(); });
  $("#from").addEventListener("change", function (e) { S.f.from = e.target.value; renderAll(); });
  $("#to").addEventListener("change", function (e) { S.f.to = e.target.value; renderAll(); });
  $("#zoneFilter").addEventListener("change", function (e) { S.f.zone = e.target.value; renderAll(); });
  $("#sourceFilter").addEventListener("change", function (e) { S.f.source = e.target.value; renderAll(); });
  $("#clearFilters").addEventListener("click", function () {
    S.f = { q: "", range: "futuras", from: "", to: "", zone: "", source: "", statuses: {} };
    ["q", "from", "to", "zoneFilter", "sourceFilter"].forEach(function (id) { $("#" + id).value = ""; });
    renderAll();
  });
  $("#csvBtn").addEventListener("click", function () {
    var cols = ["code", "date", "time", "name", "phone", "email", "people", "zone", "table", "status", "source", "occasion", "notes", "createdAt"];
    function cell(v) {
      v = String(v == null ? "" : v);
      if (/^[=+\-@\t]/.test(v)) v = "'" + v;   // evita fórmulas ao abrir no Excel
      return '"' + v.replace(/"/g, '""') + '"';
    }
    var lines = [cols.join(";")].concat(filtered().sort(byTime).map(function (r) { return cols.map(function (c) { return cell(r[c]); }).join(";"); }));
    var a = h("a", { href: URL.createObjectURL(new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" })), download: "reservas-o-polvo-" + today + ".csv" });
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- Nova / editar ---------- */
  var dlg = $("#dlg"), form = $("#resForm"), editing = null;
  Shared.STATUSES.forEach(function (s) { $("#statusSelect").appendChild(h("option", { value: s, text: STATUS[s] })); });

  function openDialog(r) {
    editing = r || null;
    var f = form.elements, v = r || { date: S.view === "dia" ? S.day : today, people: 2, zone: "any", status: "confirmada", source: "telefone" };
    ["name", "phone", "people", "date", "time", "zone", "table", "status", "source", "occasion", "email", "notes"].forEach(function (k) { f[k].value = v[k] == null ? "" : v[k]; });
    $$("[data-err]", form).forEach(function (e) { e.textContent = ""; });
    $("#dlgErr").textContent = "";
    $("#dlgTitle").textContent = r ? "Editar reserva" : "Nova reserva";
    $("#dlgMeta").textContent = r ? r.code + " · criada a " + new Date(r.createdAt).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "";
    var del = $("#deleteBtn"); del.hidden = !r; del.classList.remove("armed"); del.textContent = "Apagar";
    var list = $("#timeList"); list.textContent = "";
    Shared.slotsFor(S.settings).forEach(function (s) { list.appendChild(h("option", { value: s.time })); });
    showAvail();
    dlg.showModal();
    f.name.focus();
  }
  function showAvail() {
    var f = form.elements, el = $("#avail"), n = parseInt(f.people.value, 10) || 0;
    el.className = "avail"; el.textContent = "";
    if (!Shared.isDate(f.date.value) || !Shared.isTime(f.time.value)) return;
    var t = Shared.toMin(f.time.value), used = 0;
    S.reservations.forEach(function (r) {
      if (r.date === f.date.value && isActive(r) && (!editing || r.id !== editing.id) && Math.abs(Shared.toMin(r.time) - t) < S.settings.duration) used += r.people;
    });
    var left = S.settings.capacity - used;
    if (n > left) { el.classList.add("over"); el.textContent = "Atenção: a essa hora só há " + Math.max(0, left) + " lugares livres (lotação " + S.settings.capacity + "). Pode guardar na mesma."; }
    else el.textContent = "A essa hora há " + left + " lugares livres de " + S.settings.capacity + ".";
  }
  ["date", "time", "people"].forEach(function (k) { form.elements[k].addEventListener("input", showAvail); });
  $("#dlgClose").addEventListener("click", function () { dlg.close(); });
  $("#dlgCancel").addEventListener("click", function () { dlg.close(); });
  $("#newBtn").addEventListener("click", function () { openDialog(null); });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var f = form.elements, input = editing ? { id: editing.id } : {};
    ["name", "phone", "people", "date", "time", "zone", "table", "status", "source", "occasion", "email", "notes"].forEach(function (k) { input[k] = f[k].value; });
    $$("[data-err]", form).forEach(function (el) { el.textContent = ""; });
    $("#dlgErr").textContent = "";
    var v = Shared.validate(input, S.settings, true);
    if (!v.ok) return showErrors(v.errors);
    $("#dlgSave").disabled = true;
    try {
      var saved = await Store.saveReservation(input);
      dlg.close();
      if (S.view === "dia") S.day = saved.date;
      await refresh();
      toast(editing ? "Reserva atualizada." : "Reserva criada: " + saved.name + ", " + saved.time + ".");
    } catch (err) {
      if (err.status === 401) { dlg.close(); fail(err); }
      else { showErrors(err.errors || {}); $("#dlgErr").textContent = Object.keys(err.errors || {}).length ? "" : err.message; }
    }
    $("#dlgSave").disabled = false;
  });
  function showErrors(errors) {
    Object.keys(errors).forEach(function (k) { var el = $('[data-err="' + k + '"]', form); if (el) el.textContent = errors[k]; });
    var first = Object.keys(errors)[0];
    if (first && form.elements[first]) form.elements[first].focus();
  }

  // Apagar pede um segundo clique em vez de uma caixa de confirmação
  $("#deleteBtn").addEventListener("click", async function (e) {
    var btn = e.currentTarget;
    if (!btn.classList.contains("armed")) {
      btn.classList.add("armed"); btn.textContent = "Clique de novo para apagar";
      setTimeout(function () { btn.classList.remove("armed"); btn.textContent = "Apagar"; }, 4000);
      return;
    }
    try { await Store.removeReservation(editing.id); dlg.close(); await refresh(); toast("Reserva apagada."); }
    catch (err) { dlg.close(); fail(err); }
  });

  /* ---------- Definições ---------- */
  var cfg = $("#configForm");
  WEEKDAYS.forEach(function (name, i) {
    $("#weekdays").appendChild(h("label", {}, [h("input", { type: "checkbox", name: "wd", value: i }), name]));
  });
  function fillConfig() {
    var s = S.settings, f = cfg.elements;
    ["capacity", "duration", "interval", "maxParty", "maxDaysAhead"].forEach(function (k) { f[k].value = s[k]; });
    f.lunch0.value = s.lunch[0]; f.lunch1.value = s.lunch[1]; f.dinner0.value = s.dinner[0]; f.dinner1.value = s.dinner[1];
    $$('[name="wd"]', cfg).forEach(function (c) { c.checked = s.closedWeekdays.indexOf(+c.value) !== -1; });
    renderBlocked();
  }
  function renderBlocked() {
    var ul = $("#blocked"); ul.textContent = "";
    S.blocked.sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (b) {
      ul.appendChild(h("li", {}, [
        h("b", { text: fmtDate(b.date, { weekday: "short", day: "numeric", month: "long", year: "numeric" }) }),
        h("span", { text: b.reason || "" }),
        h("button", { type: "button", class: "btn small", text: "Remover", onclick: function () { S.blocked = S.blocked.filter(function (x) { return x !== b; }); renderBlocked(); } })
      ]));
    });
    if (!S.blocked.length) ul.appendChild(h("li", {}, [h("span", { text: "Nenhuma data bloqueada." })]));
  }
  $("#blockAdd").addEventListener("click", function () {
    var d = $("#blockDate").value;
    if (!Shared.isDate(d)) return $("#blockDate").focus();
    S.blocked = S.blocked.filter(function (b) { return b.date !== d; }).concat([{ date: d, reason: $("#blockReason").value.trim() }]);
    $("#blockDate").value = ""; $("#blockReason").value = "";
    renderBlocked();
  });
  cfg.addEventListener("submit", async function (e) {
    e.preventDefault();
    var f = cfg.elements;
    var input = {
      capacity: f.capacity.value, duration: f.duration.value, interval: f.interval.value, maxParty: f.maxParty.value, maxDaysAhead: f.maxDaysAhead.value,
      lunch: [f.lunch0.value, f.lunch1.value], dinner: [f.dinner0.value, f.dinner1.value],
      closedWeekdays: $$('[name="wd"]:checked', cfg).map(function (c) { return +c.value; }), blockedDates: S.blocked
    };
    try {
      S.settings = await Store.saveSettings(input);
      S.blocked = S.settings.blockedDates.slice();
      fillConfig();
      $("#configMsg").textContent = "Definições guardadas.";
      setTimeout(function () { $("#configMsg").textContent = ""; }, 3500);
    } catch (err) { fail(err); }
  });

  /* ---------- Atalhos e atualização automática ---------- */
  document.addEventListener("keydown", function (e) {
    if (dlg.open || $("#app").hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === "n" || e.key === "N") { e.preventDefault(); openDialog(null); }
    if (e.key === "/") { e.preventDefault(); setView("todas"); $("#q").focus(); }
    if (S.view === "dia" && e.key === "ArrowLeft") moveDay(-1);
    if (S.view === "dia" && e.key === "ArrowRight") moveDay(1);
  });
  setInterval(function () { if (!$("#app").hidden && !document.hidden) refresh(true); }, 15000);
  window.addEventListener("storage", function () { if (Store.mode === "local" && !$("#app").hidden) refresh(true); });

  start();
})();
