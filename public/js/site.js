/* O Polvo — site público: idioma, estado do dia, menu interativo e reservas. */
(function () {
  "use strict";
  var P = window.POLVO;
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

  /* ---------- Idioma ---------- */
  var lang = "pt";
  try {
    var q = new URLSearchParams(location.search).get("lang");
    lang = q || localStorage.getItem("opolvo.lang") || ((navigator.language || "pt").slice(0, 2) === "pt" ? "pt" : "en");
  } catch (_) { /* fica em português */ }
  if (lang !== "en") lang = "pt";
  function L(pt, en) { return lang === "en" ? en : pt; }
  function locale() { return lang === "en" ? "en-GB" : "pt-PT"; }

  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-en]").forEach(function (el) {
      if (el.dataset.pt == null) el.dataset.pt = el.innerHTML;
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.pt;
    });
    $$("[data-en-placeholder]").forEach(function (el) {
      if (el.dataset.ptPlaceholder == null) el.dataset.ptPlaceholder = el.placeholder;
      el.placeholder = lang === "en" ? el.dataset.enPlaceholder : el.dataset.ptPlaceholder;
    });
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    renderStatic(); renderDay(); renderTabs(); renderMenu(); renderTray(); renderWidget();
  }
  $$(".lang button").forEach(function (b) {
    b.addEventListener("click", function () {
      lang = b.dataset.lang;
      try { localStorage.setItem("opolvo.lang", lang); } catch (_) { /* sem armazenamento */ }
      applyLang();
    });
  });

  /* ---------- Datas e horas ---------- */
  function fmtHour(hh) { hh = hh % 24; return String(Math.floor(hh)).padStart(2, "0") + ":" + String(Math.round((hh % 1) * 60)).padStart(2, "0"); }
  function fmtDate(date, opts) {
    return new Intl.DateTimeFormat(locale(), Object.assign({ timeZone: "UTC" }, opts)).format(new Date(date + "T12:00:00Z"));
  }
  var money = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

  // Hora do pôr do sol em Santa Cruz (algoritmo NOAA), em minutos locais
  function sunset(date) {
    var d = new Date(date + "T12:00:00Z"), rad = Math.PI / 180;
    var n = Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5);
    var g = 2 * Math.PI / 365 * (n - 1 + 0.25);
    var eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    var decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    var lat = P.place.lat * rad;
    var ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(lat) * Math.cos(decl)) - Math.tan(lat) * Math.tan(decl)) / rad;
    var utc = 720 - 4 * (P.place.lng - ha) - eq;
    return Shared.nowLisbon(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, Math.round(utc)))).minutes;
  }

  // Dia de serviço em curso (depois da meia-noite ainda conta o dia anterior)
  function service() {
    var n = Shared.nowLisbon(), hr = n.minutes / 60, wd = n.weekday;
    var y = P.hours[(wd + 6) % 7];
    if (y.close > 24 && hr < y.close - 24) return { open: true, day: y, pos: hr + 24, weekday: (wd + 6) % 7 };
    var d = P.hours[wd];
    if (hr >= d.open && hr < d.close) return { open: true, day: d, pos: hr, weekday: wd };
    return { open: false, day: d, pos: hr, weekday: wd, opens: hr < d.open ? d.open : P.hours[(wd + 1) % 7].open };
  }

  /* ---------- Blocos estáticos dependentes do idioma ---------- */
  function renderStatic() {
    var sv = $("#services"); sv.textContent = "";
    [0, 1].forEach(function (copy) {
      P.services.forEach(function (s) { sv.appendChild(h("li", { text: L(s[0], s[1]), "aria-hidden": copy ? "true" : null })); });
    });
    var pay = $("#pay"); pay.textContent = "";
    P.payments.forEach(function (p) { pay.appendChild(h("li", { text: L(p[0], p[1]) })); });
    $("#year").textContent = Shared.nowLisbon().date.slice(0, 4);
  }

  function renderDay() {
    var s = service(), today = Shared.nowLisbon(), sun = sunset(today.date);
    var chip = $("#openChip");
    chip.classList.toggle("open", s.open);
    chip.lastElementChild.textContent = s.open
      ? L("Aberto agora · até às ", "Open now · until ") + fmtHour(s.day.close)
      : L("Fechado · abre às ", "Closed · opens at ") + fmtHour(s.opens);
    $("#sunChip").lastElementChild.textContent = L("Pôr do sol hoje às ", "Sunset today at ") + Shared.fromMin(sun);

    // Horário semanal, de segunda a domingo
    var table = $("#hours"); table.textContent = "";
    [1, 2, 3, 4, 5, 6, 0].forEach(function (wd) {
      var name = new Intl.DateTimeFormat(locale(), { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + wd)));
      table.appendChild(h("tr", { class: wd === s.weekday ? "today" : "" }, [
        h("td", { text: name.charAt(0).toUpperCase() + name.slice(1) }),
        h("td", { text: fmtHour(P.hours[wd].open) + " – " + fmtHour(P.hours[wd].close) })
      ]));
    });

    // Barra do dia
    var bar = $("#rhythmBar"), span = s.day.close - s.day.open, current = null; bar.textContent = "";
    P.moments.forEach(function (m, i) {
      var to = Math.min(i + 1 < P.moments.length ? P.moments[i + 1].from : s.day.close, s.day.close);
      if (to <= m.from) return;
      var on = s.open && s.pos >= m.from && s.pos < to;
      if (on) current = m;
      bar.appendChild(h("span", { class: on ? "now" : "", style: "flex:" + (to - m.from), text: L(m.pt, m.en) }));
    });
    if (s.open) bar.appendChild(h("i", { style: "left:" + ((s.pos - s.day.open) / span * 100).toFixed(2) + "%" }));
    bar.appendChild(h("u", { style: "left:" + ((sun / 60 - s.day.open) / span * 100).toFixed(2) + "%", title: L("Pôr do sol", "Sunset") }));
    $("#rhythmNow").textContent = s.open
      ? L("Agora no Polvo: ", "Right now at O Polvo: ") + (current ? L(current.pt, current.en).toLowerCase() : "") +
        L(". O ponto dourado marca o pôr do sol, às ", ". The golden dot marks sunset, at ") + Shared.fromMin(sun) + "."
      : L("Estamos fechados neste momento — abrimos às ", "We're closed right now — we open at ") + fmtHour(s.opens) + ".";
  }

  /* ---------- Menu ---------- */
  var cat = "all", term = "", picks = {};
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  var TABS = P.categories.concat([{ id: "polvo", pt: "Só polvo", en: "Octopus only" }]);
  function inCat(d, c) { return c === "all" || (c === "polvo" ? !!d.polvo : d.cat === c); }

  function renderTabs() {
    var box = $("#tabs"); box.textContent = "";
    TABS.forEach(function (c) {
      var n = P.menu.filter(function (d) { return inCat(d, c.id); }).length;
      box.appendChild(h("button", {
        type: "button", role: "tab", "aria-selected": String(cat === c.id),
        onclick: function () { cat = c.id; renderTabs(); renderMenu(); }
      }, [L(c.pt, c.en), h("small", { text: String(n) })]));
    });
  }

  function setQty(id, n) {
    if (n <= 0) delete picks[id]; else picks[id] = Math.min(n, 20);
    renderMenu(); renderTray();
  }

  function renderMenu() {
    var list = $("#menuList"); list.textContent = "";
    var needle = norm(term), shown = 0;
    ["peixe", "carnes", "sopas"].forEach(function (c) {
      var items = P.menu.filter(function (d) {
        return d.cat === c && inCat(d, cat) && (!needle || norm(d.pt + " " + d.en + " " + (d.gloss || "")).indexOf(needle) !== -1);
      });
      if (!items.length) return;
      shown += items.length;
      var head = P.categories.find(function (x) { return x.id === c; });
      var group = h("div", { class: "menu-group" }, [h("h3", { text: L(head.pt, head.en) })]);
      items.forEach(function (d) {
        var n = picks[d.id] || 0;
        var name = h("span", { class: "name" }, [L(d.pt, d.en)]);
        if (lang === "en" && d.gloss) name.appendChild(h("i", { text: d.gloss }));
        if (d.for2) name.appendChild(h("span", { class: "tag two", text: L("2 pessoas", "for 2") }));
        var qty = h("span", { class: "qty" }, [
          n ? h("button", { type: "button", "aria-label": L("Retirar ", "Remove ") + L(d.pt, d.en), text: "−", onclick: function () { setQty(d.id, n - 1); } }) : null,
          n ? h("b", { text: String(n) }) : null,
          h("button", { type: "button", "aria-label": L("Juntar ", "Add ") + L(d.pt, d.en), text: "+", onclick: function () { setQty(d.id, n + 1); } })
        ]);
        group.appendChild(h("div", { class: "dish" + (n ? " sel" : "") }, [
          name, h("span", { class: "dots" }), h("span", { class: "price", text: money.format(d.price) }), qty
        ]));
      });
      list.appendChild(group);
    });
    if (!shown) list.appendChild(h("p", { class: "menu-empty", text: L("Nenhum prato corresponde à procura.", "No dish matches your search.") }));
  }

  function pickList() {
    return P.menu.filter(function (d) { return picks[d.id]; }).map(function (d) { return { d: d, n: picks[d.id] }; });
  }
  function renderTray() {
    var items = pickList(), tray = $("#tray");
    tray.hidden = !items.length;
    if (!items.length) return;
    var count = items.reduce(function (a, x) { return a + x.n; }, 0);
    var total = items.reduce(function (a, x) { return a + x.n * x.d.price; }, 0);
    $("#trayCount").textContent = L("A sua mesa · ", "Your table · ") + count + " " + (count === 1 ? L("prato", "dish") : L("pratos", "dishes"));
    $("#trayItems").textContent = items.map(function (x) { return x.n + "× " + L(x.d.pt, x.d.en); }).join(", ");
    $("#trayTotal").textContent = money.format(total);
  }
  $("#menuSearch").addEventListener("input", function (e) { term = e.target.value; renderMenu(); });
  $("#trayClear").addEventListener("click", function () { picks = {}; renderMenu(); renderTray(); });
  $("#trayGo").addEventListener("click", function () {
    var notes = form.elements.notes;
    var line = "Pré-seleção: " + pickList().map(function (x) { return x.n + "× " + x.d.pt; }).join(", ");
    var rest = notes.value.split("\n").filter(function (l) { return l.indexOf("Pré-seleção:") !== 0; }).join("\n").trim();
    notes.value = (line + (rest ? "\n" + rest : "")).slice(0, 500);
    $("#reservas").scrollIntoView();
  });

  /* ---------- Reservas ---------- */
  var form = $("#resForm");
  var today = Shared.nowLisbon().date;
  var state = { people: 2, date: today, time: null, zone: "any", slots: null, closed: null, settings: { maxParty: 12, maxDaysAhead: 90, closedWeekdays: [], blockedDates: [] }, loading: true };
  var loadSeq = 0, lastBooking = null;

  function isClosed(date) { return !!Shared.closedReason(state.settings, date); }

  async function loadDay() {
    var seq = ++loadSeq;
    state.loading = true; renderSlots();
    try {
      var data = await Store.publicDay(state.date);
      if (seq !== loadSeq) return;
      state.settings = data.settings; state.slots = data.slots; state.closed = data.closed; state.loadError = false;
    } catch (_) {
      if (seq !== loadSeq) return;
      state.slots = null; state.loadError = true;
    }
    state.loading = false;
    renderWidget();
  }

  function sunSlot() {
    if (!state.slots) return null;
    var sun = sunset(state.date), best = null;
    state.slots.forEach(function (s) {
      var m = Shared.toMin(s.time);
      if (m > sun - 5 || sun - m > 90) return;
      if (!best || Math.abs(sun - 40 - m) < Math.abs(sun - 40 - Shared.toMin(best.time))) best = s;
    });
    return best;
  }

  function renderDays() {
    var box = $("#days"); box.textContent = "";
    for (var i = 0; i < 14; i++) {
      (function (date) {
        box.appendChild(h("button", {
          type: "button", class: "day", role: "radio", "aria-checked": String(state.date === date), disabled: isClosed(date),
          "aria-label": fmtDate(date, { weekday: "long", day: "numeric", month: "long" }),
          onclick: function () { pickDate(date); }
        }, [
          h("small", { text: i === 0 ? L("Hoje", "Today") : fmtDate(date, { weekday: "short" }).slice(0, 3) }),
          h("b", { text: String(+date.slice(8)) }),
          h("small", { text: fmtDate(date, { month: "short" }).replace(".", "") })
        ]));
      })(Shared.addDays(today, i));
    }
    var other = $("#otherDate");
    other.min = today; other.max = Shared.addDays(today, state.settings.maxDaysAhead); other.value = state.date;
  }
  function pickDate(date) {
    if (!Shared.isDate(date) || date < today) return;
    state.date = date; state.time = null;
    setErr("date", ""); renderDays(); loadDay();
  }
  $("#otherDate").addEventListener("change", function (e) { pickDate(e.target.value); });

  function renderSlots() {
    var box = $("#slots"); box.textContent = "";
    if (state.loading && !state.slots) { box.appendChild(h("p", { class: "slots-msg", text: L("A ver a disponibilidade…", "Checking availability…") })); return; }
    if (state.loadError) { box.appendChild(h("p", { class: "slots-msg", text: L("Não foi possível ver a disponibilidade. Ligue 261 931 400.", "Couldn't check availability. Please call 261 931 400.") })); return; }
    if (state.closed) { box.appendChild(h("p", { class: "slots-msg", text: L("Não aceitamos reservas neste dia", "No bookings on this day") + (state.closed !== "Encerrado" ? " — " + state.closed : "") + "." })); return; }
    var sun = sunSlot(), any = false;
    [["lunch", L("Almoço", "Lunch")], ["dinner", L("Jantar", "Dinner")]].forEach(function (p) {
      var slots = state.slots.filter(function (s) { return s.period === p[0] && !s.past; });
      if (!slots.length) return;
      any = true;
      var row = h("div", { class: "slot-row", role: "radiogroup", "aria-label": p[1] });
      slots.forEach(function (s) {
        var free = s.left >= state.people, isSun = sun && sun.time === s.time;
        var note = !free ? (s.left === 0 ? L("Esgotado", "Full") : L("Só " + s.left + " lugares", "Only " + s.left + " seats"))
          : isSun ? L("Pôr do sol", "Sunset") : s.left <= 8 ? L("Últimos lugares", "Last seats") : "";
        if (!free && state.time === s.time) state.time = null;
        row.appendChild(h("button", {
          type: "button", role: "radio", disabled: !free, "aria-checked": String(state.time === s.time),
          class: "slot" + (isSun && free ? " sun" : "") + (free && !isSun && s.left <= 8 ? " few" : ""),
          onclick: function () { state.time = s.time; setErr("time", ""); renderSlots(); renderSummary(); }
        }, [h("b", { text: s.time }), h("small", { text: note })]));
      });
      box.appendChild(h("h4", { text: p[1] }));
      box.appendChild(row);
    });
    if (!any) box.appendChild(h("p", { class: "slots-msg", text: L("Já não há horários para este dia — escolha outro.", "No times left for this day — pick another.") }));
  }

  function zoneName(z) { return { any: L("Sem preferência", "No preference"), sala: L("Sala", "Dining room"), esplanada: L("Esplanada", "Terrace") }[z]; }
  function summaryText() {
    return state.people + " " + (state.people === 1 ? L("pessoa", "guest") : L("pessoas", "guests")) + " · " +
      fmtDate(state.date, { weekday: "long", day: "numeric", month: "long" }) + " · " + state.time +
      (state.zone !== "any" ? " · " + zoneName(state.zone) : "");
  }
  function renderSummary() {
    var el = $("#summary");
    el.classList.toggle("wait", !state.time);
    el.textContent = state.time ? summaryText() : L("Escolha o dia e a hora para continuar.", "Pick a day and a time to continue.");
  }

  function renderSunset() {
    var sun = sunset(state.date), slot = sunSlot(), isToday = state.date === today;
    $("#sunsetTitle").textContent = (isToday ? L("Hoje o sol põe-se às ", "Today the sun sets at ")
      : L("Pôr do sol a ", "Sunset on ") + fmtDate(state.date, { day: "numeric", month: "short" }) + L(": ", ": ")) + Shared.fromMin(sun);
    $("#sunsetText").textContent = slot
      ? L("Reserve para as " + slot.time + " e veja-o da mesa.", "Book for " + slot.time + " and watch it from your table.")
      : L("Nesta data põe-se fora das horas de refeição — a vista, essa, está cá o dia todo.", "On this date it sets outside meal times — the view, though, is here all day.");
  }

  function renderWidget() {
    var max = state.settings.maxParty;
    if (state.people > max) state.people = max;
    $("#pOut").textContent = state.people;
    $("#pMinus").disabled = state.people <= 1;
    $("#pPlus").disabled = state.people >= max;
    $("#pNote").textContent = state.people >= max ? L("Mais de " + max + "? Ligue 261 931 400.", "More than " + max + "? Call 261 931 400.") : "";
    $$("#zones button").forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.zone === state.zone)); });
    $("#zoneHint").textContent = state.zone === "esplanada"
      ? L("A esplanada depende do tempo — se for preciso, passamos a mesa para a sala.", "The terrace depends on the weather — if need be, we'll move your table indoors.") : "";
    renderDays(); renderSlots(); renderSummary(); renderSunset();
    if (lastBooking) $("#doneText").textContent = lastBooking.text();
  }

  $("#pMinus").addEventListener("click", function () { state.people--; renderWidget(); });
  $("#pPlus").addEventListener("click", function () { state.people++; renderWidget(); });
  $$("#zones button").forEach(function (b) { b.addEventListener("click", function () { state.zone = b.dataset.zone; renderWidget(); }); });

  function setErr(key, msg) {
    var el = $('[data-err="' + key + '"]', form);
    if (el) el.textContent = msg || "";
    var input = form.elements[key];
    if (input && input.classList) input.classList.toggle("bad", !!msg);
  }
  var ERR_EN = { name: "Please enter your name.", phone: "Please enter a valid phone number.", email: "Invalid e-mail.", date: "Please choose a date.", time: "Please choose a time.", people: "Invalid party size." };

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var f = form.elements, btn = $("#submitBtn");
    var input = {
      name: f.name.value, phone: f.phone.value, email: f.email.value, occasion: f.occasion.value, notes: f.notes.value,
      website: f.website.value, date: state.date, time: state.time || "", people: state.people, zone: state.zone
    };
    ["name", "phone", "email", "date", "time"].forEach(function (k) { setErr(k, ""); });
    $("#formErr").textContent = "";
    var settings = Object.assign({}, Shared.DEFAULT_SETTINGS, state.settings, { lunch: ["00:00", "23:59"], dinner: null, interval: 1 });
    var v = Shared.validate(input, settings, false), errors = v.errors;
    if (!v.ok) return showErrors(errors, "");
    btn.disabled = true;
    try {
      var res = await Store.book(input);
      lastBooking = { code: res.code, date: state.date, time: state.time, people: state.people, text: summaryText };
      var snapshot = summaryText();
      lastBooking.text = function () { return snapshot; };
      $("#doneText").textContent = snapshot;
      $("#doneCode").textContent = res.code || "—";
      form.hidden = true; $("#done").hidden = false; $("#done").focus();
      $("#widget").scrollIntoView({ block: "center" });
    } catch (err) {
      showErrors(err.errors || {}, err.message);
      if (err.status === 409) { state.time = null; loadDay(); }
    }
    btn.disabled = false;
  });
  function showErrors(errors, message) {
    var first = null;
    Object.keys(errors).forEach(function (k) {
      setErr(k, lang === "en" ? (ERR_EN[k] || errors[k]) : errors[k]);
      if (!first) first = form.elements[k] || $('[data-err="' + k + '"]', form);
    });
    $("#formErr").textContent = message && !Object.keys(errors).length ? message : "";
    if (first && first.focus && first.tagName) first.focus();
    if (first && first.scrollIntoView) first.scrollIntoView({ block: "center" });
  }

  $("#againBtn").addEventListener("click", function () {
    lastBooking = null; state.time = null;
    form.elements.notes.value = ""; form.hidden = false; $("#done").hidden = true;
    loadDay();
  });
  $("#icsBtn").addEventListener("click", function () {
    if (!lastBooking) return;
    var b = lastBooking, start = b.date.replace(/-/g, "") + "T" + b.time.replace(":", "") + "00";
    var endMin = Shared.toMin(b.time) + 90, endDate = endMin >= 1440 ? Shared.addDays(b.date, 1) : b.date;
    var end = endDate.replace(/-/g, "") + "T" + Shared.fromMin(endMin % 1440).replace(":", "") + "00";
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//O Polvo//Reservas//PT", "BEGIN:VEVENT",
      "UID:" + b.code + "@opolvo", "DTSTAMP:" + new Date().toISOString().replace(/[-:]|\.\d{3}/g, ""),
      "DTSTART;TZID=Europe/Lisbon:" + start, "DTEND;TZID=Europe/Lisbon:" + end,
      "SUMMARY:O Polvo — mesa para " + b.people, "LOCATION:Urbanização do Pisão\\, Lote 2\\, 2560-042 Santa Cruz",
      "DESCRIPTION:Reserva " + b.code + " (a confirmar pelo restaurante). Tel. 261 931 400", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = h("a", { href: URL.createObjectURL(new Blob([ics], { type: "text/calendar" })), download: "o-polvo-" + b.code + ".ics" });
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- Mapa (só carrega a pedido) ---------- */
  $("#mapBtn").addEventListener("click", function () {
    var box = $("#map"); box.textContent = "";
    box.appendChild(h("iframe", {
      title: L("Mapa — O Polvo, Santa Cruz", "Map — O Polvo, Santa Cruz"), loading: "lazy", referrerpolicy: "no-referrer-when-downgrade",
      src: "https://www.google.com/maps?q=" + encodeURIComponent(P.place.mapQuery) + "&z=16&output=embed"
    }));
  });

  /* ---------- Tentáculos decorativos (os mesmos do menu impresso) ---------- */
  function tentacle(o) {
    var N = 420, ds = o.len / N, x = o.x, y = o.y, hd = o.heading * Math.PI / 180;
    var Lp = [], Rp = [], suckers = "", next = 0, dist = 0, f = function (n) { return n.toFixed(1); };
    for (var i = 0; i <= N; i++) {
      var s = i / N;
      hd += (o.sway * (1 - s) * Math.cos(s * Math.PI * 1.4) + o.curl * Math.pow(s, o.pow)) * ds;
      x += Math.cos(hd) * ds; y += Math.sin(hd) * ds; dist += ds;
      var w = o.width * Math.pow(1 - s, 0.8) + 0.5, nx = -Math.sin(hd), ny = Math.cos(hd);
      Lp.push(f(x + nx * w / 2) + "," + f(y + ny * w / 2));
      Rp.push(f(x - nx * w / 2) + "," + f(y - ny * w / 2));
      if (dist >= next && w > 2) {
        suckers += '<circle cx="' + f(x + o.side * nx * w * 0.2) + '" cy="' + f(y + o.side * ny * w * 0.2) + '" r="' + f(w * 0.17) + '"/>';
        next = dist + w * 0.56;
      }
    }
    return '<path fill="' + o.fill + '" d="M' + Lp.join(" L") + " L" + Rp.reverse().join(" L") + 'Z"/>' +
      '<g fill="none" stroke="' + o.ring + '" stroke-width=".7">' + suckers + "</g>";
  }
  $(".deco-menu").innerHTML = tentacle({ x: 206, y: 24, heading: 172, len: 215, width: 24, sway: -0.018, curl: 0.17, pow: 3, side: 1, fill: "#eadfc8", ring: "#f6f0e3" });
  $(".deco-res").innerHTML = tentacle({ x: -6, y: 170, heading: -8, len: 230, width: 26, sway: 0.018, curl: -0.16, pow: 3, side: -1, fill: "#1f5f82", ring: "#0e2a43" });

  /* ---------- Navegação e entradas ---------- */
  var nav = $("#nav");
  function onScroll() { nav.classList.toggle("stuck", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if ("IntersectionObserver" in window) {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); reveal.unobserve(en.target); } });
    }, { threshold: 0.2 });
    $$(".reveal").forEach(function (el) { reveal.observe(el); });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $$(".nav-links a").forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { spy.observe(s); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  applyLang();
  loadDay();
  setInterval(renderDay, 60000);
})();
