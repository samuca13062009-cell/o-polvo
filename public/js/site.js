/* O Polvo, site público: idioma, estado do dia, menu interativo e reservas. */
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

  /* ---------- Movimento ---------- */
  var motion = document.documentElement.classList.contains("motion");
  var EASE = "cubic-bezier(.16, 1, .3, 1)";
  function anim(el, frames, ms) {
    if (motion && el && el.animate) el.animate(frames, { duration: ms || 320, easing: EASE });
  }
  // o toldinho de um item escolhido desce para o lugar
  function drop(el) { anim(el, [{ backgroundPosition: "center -6px, 0 0" }, { backgroundPosition: "center 3px, 0 0" }], 420); }
  function rise(el, from) { anim(el, [{ transform: "translateY(" + (from || 60) + "%)", opacity: 0 }, { transform: "none", opacity: 1 }], 300); }

  // parte os títulos em palavras, para entrarem uma a uma
  function splitHeads() {
    if (!motion) return;
    $$("h2").forEach(function (h2) {
      if (h2.querySelector(".w")) return;
      var i = 0, walker = document.createTreeWalker(h2, NodeFilter.SHOW_TEXT), nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (node) {
        var frag = document.createDocumentFragment();
        node.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(" ") : h("span", { class: "w", style: "--i:" + i++, text: part }));
        });
        node.parentNode.replaceChild(frag, node);
      });
    });
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
    splitHeads();
  }
  $$(".lang button").forEach(function (b) {
    b.addEventListener("click", function () {
      lang = b.dataset.lang;
      try { localStorage.setItem("opolvo.lang", lang); } catch (_) { /* sem armazenamento */ }
      if (motion && document.startViewTransition) {
        var vt = document.startViewTransition(applyLang), quiet = function () { /* transição saltada: o idioma muda na mesma */ };
        vt.ready.catch(quiet); vt.finished.catch(quiet);
      } else applyLang();
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
    P.services.forEach(function (s, i) { sv.appendChild(h("li", { text: L(s[0], s[1]), style: "--i:" + i })); });
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
    bar.setAttribute("data-fim", fmtHour(s.day.close));
    P.moments.forEach(function (m, i) {
      var to = Math.min(i + 1 < P.moments.length ? P.moments[i + 1].from : s.day.close, s.day.close);
      if (to <= m.from) return;
      var on = s.open && s.pos >= m.from && s.pos < to;
      if (on) current = m;
      bar.appendChild(h("span", { class: on ? "now" : (s.open && s.pos >= to ? "past" : ""), style: "flex:" + (to - m.from), "data-h": fmtHour(m.from), text: L(m.pt, m.en) }));
    });
    if (s.open) bar.appendChild(h("i", { style: "left:" + ((s.pos - s.day.open) / span * 100).toFixed(2) + "%" }));
    bar.appendChild(h("u", { style: "left:" + ((sun / 60 - s.day.open) / span * 100).toFixed(2) + "%", title: L("Pôr do sol", "Sunset") }));
    $("#rhythmNow").textContent = s.open
      ? L("Agora no Polvo: ", "Right now at O Polvo: ") + (current ? L(current.pt, current.en).toLowerCase() : "") +
        L(". O sol põe-se às ", ". The sun sets at ") + Shared.fromMin(sun) + "."
      : L("Estamos fechados neste momento. Abrimos às ", "We're closed right now. We open at ") + fmtHour(s.opens) + ".";
  }

  /* ---------- Menu ---------- */
  var cat = "all", term = "", picks = {};
  var menuAnim = false, bump = null, shownTotal = 0, totalRaf = 0, totalEnd = 0;
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  var TABS = P.categories.concat([{ id: "polvo", pt: "Só polvo", en: "Octopus only" }]);
  function inCat(d, c) { return c === "all" || (c === "polvo" ? !!d.polvo : d.cat === c); }

  function renderTabs() {
    var box = $("#tabs"); box.textContent = "";
    TABS.forEach(function (c) {
      var n = P.menu.filter(function (d) { return inCat(d, c.id); }).length;
      box.appendChild(h("button", {
        type: "button", role: "tab", "aria-selected": String(cat === c.id),
        onclick: function () { cat = c.id; menuAnim = true; renderTabs(); renderMenu(); drop($('#tabs [aria-selected="true"]')); }
      }, [L(c.pt, c.en), h("small", { text: String(n) })]));
    });
  }

  function setQty(id, n) {
    if (n <= 0) delete picks[id]; else picks[id] = Math.min(n, 20);
    bump = id;
    renderMenu(); renderTray();
  }

  function renderMenu() {
    var list = $("#menuList"); list.textContent = "";
    list.classList.toggle("entra", menuAnim);
    var needle = norm(term), shown = 0, row = 0;
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
          n ? h("button", { type: "button", "aria-label": L("Retirar ", "Remove ") + L(d.pt, d.en), class: "menos", onclick: function () { setQty(d.id, n - 1); } }) : null,
          n ? h("b", { text: String(n), class: bump === d.id ? "salta" : "" }) : null,
          h("button", { type: "button", "aria-label": L("Juntar ", "Add ") + L(d.pt, d.en), class: "mais", onclick: function () { setQty(d.id, n + 1); } })
        ]);
        group.appendChild(h("div", { class: "dish" + (n ? " sel" : ""), style: "--i:" + Math.min(row++, 16) }, [
          name, h("span", { class: "price", text: money.format(d.price) }), qty
        ]));
      });
      list.appendChild(group);
    });
    if (!shown) list.appendChild(h("p", { class: "menu-empty", text: L("Nenhum prato corresponde à procura.", "No dish matches your search.") }));
    menuAnim = false; bump = null;
  }

  // o total da mesa conta até ao novo valor
  function showTotal(total) {
    var el = $("#trayTotal"), from = shownTotal, start = performance.now();
    cancelAnimationFrame(totalRaf); clearTimeout(totalEnd);
    // garante o valor certo mesmo que o separador esteja em segundo plano
    totalEnd = setTimeout(function () { cancelAnimationFrame(totalRaf); shownTotal = total; el.textContent = money.format(total); }, 600);
    if (!motion || from === total) { shownTotal = total; el.textContent = money.format(total); return; }
    (function step(now) {
      var p = Math.min(1, (now - start) / 420), e = 1 - Math.pow(1 - p, 3);
      shownTotal = from + (total - from) * e;
      el.textContent = money.format(shownTotal);
      if (p < 1) totalRaf = requestAnimationFrame(step); else shownTotal = total;
    })(start);
  }

  function pickList() {
    return P.menu.filter(function (d) { return picks[d.id]; }).map(function (d) { return { d: d, n: picks[d.id] }; });
  }
  function renderTray() {
    var items = pickList(), tray = $("#tray");
    tray.hidden = !items.length;
    if (!items.length) { shownTotal = 0; return; }
    var count = items.reduce(function (a, x) { return a + x.n; }, 0);
    var total = items.reduce(function (a, x) { return a + x.n * x.d.price; }, 0);
    $("#trayCount").textContent = L("A sua mesa · ", "Your table · ") + count + " " + (count === 1 ? L("prato", "dish") : L("pratos", "dishes"));
    $("#trayItems").textContent = items.map(function (x) { return x.n + "× " + L(x.d.pt, x.d.en); }).join(", ");
    showTotal(total);
  }
  $("#menuSearch").addEventListener("input", function (e) { term = e.target.value; menuAnim = true; renderMenu(); });
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
  var loadSeq = 0, lastBooking = null, slotsAnim = false, lastSummary = "";

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
    state.loading = false; slotsAnim = true;
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
    drop($('#days [aria-checked="true"]'));
  }
  $("#otherDate").addEventListener("change", function (e) { pickDate(e.target.value); });

  function renderSlots() {
    var box = $("#slots"); box.textContent = "";
    if (state.loading && !state.slots) { box.appendChild(h("p", { class: "slots-msg", text: L("A ver a disponibilidade…", "Checking availability…") })); return; }
    if (state.loadError) { box.appendChild(h("p", { class: "slots-msg", text: L("Não foi possível ver a disponibilidade. Ligue 261 931 400.", "Couldn't check availability. Please call 261 931 400.") })); return; }
    if (state.closed) { box.appendChild(h("p", { class: "slots-msg", text: L("Não aceitamos reservas neste dia", "No bookings on this day") + (state.closed !== "Encerrado" ? ": " + state.closed : "") + "." })); return; }
    var sun = sunSlot(), any = false, n = 0;
    box.classList.toggle("entra", slotsAnim); slotsAnim = false;
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
          class: "slot" + (isSun && free ? " sun" : "") + (free && !isSun && s.left <= 8 ? " few" : ""), style: "--i:" + n++,
          onclick: function () { state.time = s.time; setErr("time", ""); renderSlots(); renderSummary(); drop($('#slots [aria-checked="true"]')); }
        }, [h("b", { text: s.time }), h("small", { text: note })]));
      });
      box.appendChild(h("h4", { text: p[1] }));
      box.appendChild(row);
    });
    if (!any) box.appendChild(h("p", { class: "slots-msg", text: L("Já não há horários para este dia. Escolha outro.", "No times left for this day. Pick another.") }));
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
    if (lastSummary && el.textContent !== lastSummary) rise(el, 30);
    lastSummary = el.textContent;
  }

  function renderSunset() {
    var sun = sunset(state.date), slot = sunSlot(), isToday = state.date === today;
    $("#sunsetTitle").textContent = (isToday ? L("Hoje o sol põe-se às ", "Today the sun sets at ")
      : L("Pôr do sol a ", "Sunset on ") + fmtDate(state.date, { day: "numeric", month: "short" }) + L(": ", ": ")) + Shared.fromMin(sun);
    $("#sunsetText").textContent = slot
      ? L("Reserve para as " + slot.time + " e veja-o da mesa.", "Book for " + slot.time + " and watch it from your table.")
      : L("Nesta data põe-se fora das horas de refeição. A vista está cá o dia todo.", "On this date it sets outside meal times. The view is here all day.");
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
      ? L("A esplanada depende do tempo. Se for preciso, passamos a mesa para a sala.", "The terrace depends on the weather. If need be, we'll move your table indoors.") : "";
    renderDays(); renderSlots(); renderSummary(); renderSunset();
    if (lastBooking) $("#doneText").textContent = lastBooking.text();
  }

  $("#pMinus").addEventListener("click", function () { state.people--; renderWidget(); rise($("#pOut"), -70); });
  $("#pPlus").addEventListener("click", function () { state.people++; renderWidget(); rise($("#pOut"), 70); });
  $$("#zones button").forEach(function (b) { b.addEventListener("click", function () { state.zone = b.dataset.zone; renderWidget(); drop(b); }); });

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
      var plate = $("#doneCode"); plate.textContent = ""; plate.setAttribute("aria-label", res.code || "");
      String(res.code || "—").split("").forEach(function (ch, i) { plate.appendChild(h("span", { class: "c", "aria-hidden": "true", style: "--i:" + i, text: ch })); });
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
      title: L("Mapa: O Polvo, Santa Cruz", "Map: O Polvo, Santa Cruz"), loading: "lazy", referrerpolicy: "no-referrer-when-downgrade",
      src: "https://www.google.com/maps?q=" + encodeURIComponent(P.place.mapQuery) + "&z=16&output=embed"
    }));
  });

  /* ---------- Navegação e entradas ---------- */
  var nav = $("#nav"), gust = 0, lastY = window.scrollY, revealCheck = function () {};
  function onScroll() {
    revealCheck();
    var y = window.scrollY, room = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("stuck", y > 40);
    nav.style.setProperty("--prog", room > 0 ? Math.min(1, y / room).toFixed(4) : "0");
    gust += Math.max(-1.5, Math.min(1.5, (y - lastY) * 0.02)); lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // O toldo ao vento: uma brisa lenta, mais as rajadas de quem mexe o ponteiro ou desloca a página
  (function () {
    var toldo = $(".hero .toldo");
    if (!motion || !toldo) return;
    var wind = 0, vel = 0, raf = 0, seen = true, lastX = null, t0 = performance.now();
    function tick(now) {
      raf = 0;
      var t = (now - t0) / 1000;
      gust = Math.max(-5, Math.min(5, gust)) * 0.93;
      vel = (vel + (Math.sin(t * 0.8) * 0.5 + Math.sin(t * 1.9 + 1.3) * 0.22 + gust - wind) * 0.05) * 0.9;
      wind += vel;
      toldo.style.setProperty("--vento", wind.toFixed(3));
      toldo.style.setProperty("--sy", (1 + Math.sin(t * 1.3) * 0.012 + Math.abs(wind) * 0.008).toFixed(4));
      wake();
    }
    function wake() { if (!raf && seen && !document.hidden) raf = requestAnimationFrame(tick); }
    window.addEventListener("pointermove", function (e) {
      if (lastX != null) gust += Math.max(-0.6, Math.min(0.6, (e.clientX - lastX) * 0.012));
      lastX = e.clientX;
    }, { passive: true });
    document.addEventListener("visibilitychange", wake);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { seen = en[0].isIntersecting; wake(); }).observe(toldo);
    wake();
  })();

  // Entradas ao deslocar a página
  function setupReveal() {
    if (!motion) return;
    // medido à mão: um IntersectionObserver não vê o que está cortado por clip-path
    var waiting = [];
    revealCheck = function () {
      var line = window.innerHeight * 0.9;
      waiting = waiting.filter(function (el) {
        if (el.getBoundingClientRect().top > line) return true;
        el.classList.add("in");
        return false;
      });
    };
    function mark(sel, cls, from) {
      $$(sel).forEach(function (el) {
        el.classList.add(cls);
        if (from != null) el.style.setProperty("--i", from + Array.prototype.indexOf.call(el.parentNode.children, el));
        waiting.push(el);
      });
    }
    window.addEventListener("resize", revealCheck);
    mark("h2", "rvh");
    mark(".pontos article, .bloco", "rv-rule", 0);
    mark(".servicos", "rv-list");
    mark(".faixa, .res-pitch, .map", "wipe");
    mark(".res-pitch-in > p, .poente", "rv", 3);
    mark(".menu-topo .search, .menu-tip, .tabs, #menuList, .menu-foot, .widget fieldset, .submit, .foto", "rv");
    mark(".foot-grid > div", "rv", 0);
    mark(".toldo-fim", "rvt");
    revealCheck();
  }
  setTimeout(function () { $("#rhythm").classList.remove("intro"); }, 3600);
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $$(".nav-links a").forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { spy.observe(s); });
  }

  applyLang();
  setupReveal();
  loadDay();
  setInterval(renderDay, 60000);
})();
