/* ============================================================
   Ireland 2027 — app logic
   Vanilla JS, no build step. State lives in localStorage.
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     RATE ASSUMPTIONS  — tune everything here.
     All figures USD, per the group's North-American basis.
     Ranges are [low, high] so the UI can show honest bands.
     ---------------------------------------------------------- */
  const RATES = {
    flights: {
      us_east: [550, 950],    // round-trip to Dublin, US/Canada east
      us_west: [800, 1300],   // west coast
      europe:  [120, 350],    // short hop
    },
    lodgingPerNight: {         // per night for the WHOLE group's rooms, before ÷ people
      hostel: [35, 60],        // per person, dorm-ish
      house:  [50, 90],        // per person in a shared self-catering house
      mid:    [90, 150],       // per person, mid hotel (≈2 share a room)
      nice:   [160, 260],      // per person, nice hotel
    },
    carPerDay: [45, 80],       // per car per day incl. insurance & fuel buffer
    dailySpendPerPerson: [60, 110], // food, pints, entries, the day-to-day
  };

  /* Trip "tiers" the pool can unlock — compared against per-person pool average. */
  const TIERS = [
    { min: 0,    name: "Dreaming stage",  note: "Let's get a few more budgets in to see the shape of it." },
    { min: 1500, name: "Hostels & buses", note: "A scrappy, joyful week — dorms, trains, and great craic." },
    { min: 2500, name: "The shared house", note: "A self-catering base, a hire car, and room to roam. The sweet spot." },
    { min: 4000, name: "Comfortable hotels", note: "Mid-range hotels, two weeks, and no pinching pennies." },
    { min: 6000, name: "The grand tour",   note: "Nice stays, long trip, splurge dinners — go all out." },
  ];

  const DEFAULT_CREW = [
    { name: "Tim Howd", city: "", host: true },
    { name: "Renée Gauthier", city: "" },
    { name: "Neil Morrissey", city: "" },
    { name: "Victoria Sidoti", city: "" },
    { name: "Jacalynn Manning", city: "" },
  ];

  const AVATAR_COLORS = [
    "#2f6b46", "#b5563f", "#3a6e8f", "#8a5a9e",
    "#c08a2d", "#4a7c59", "#a04668", "#5a6b3a",
  ];

  const STORAGE_KEY = "ireland2027.v1";

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through to seed */ }
    return seed();
  }

  function seed() {
    return {
      crew: DEFAULT_CREW.map((p, i) => ({
        id: uid(),
        name: p.name,
        city: p.city,
        host: !!p.host,
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      })),
      budgets: {},      // personId -> number (private)
      vibes: { pubs: true, history: true, scenic: true, nature: false, cities: false, food: false },
    };
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { /* storage might be full or blocked; UI still works in-session */ }
  }

  function uid() { return Math.random().toString(36).slice(2, 9); }

  /* ----------------------------------------------------------
     HELPERS
     ---------------------------------------------------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const fmt$ = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const fmtRange = (lo, hi) => fmt$(lo) + "–" + fmt$(hi);
  const initials = (name) =>
    name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  /* ----------------------------------------------------------
     CREW
     ---------------------------------------------------------- */
  function renderCrew() {
    const grid = $("#crew-list");
    grid.innerHTML = "";
    state.crew.forEach((p) => {
      const card = document.createElement("div");
      card.className = "crew-card";
      card.innerHTML =
        '<div class="crew-avatar" style="background:' + p.color + '">' + initials(p.name) + "</div>" +
        '<div class="crew-info">' +
          (p.host ? '<div class="crew-host">birthday star</div>' : "") +
          '<div class="crew-name"></div>' +
          '<div class="crew-city"></div>' +
        "</div>" +
        '<button class="crew-remove" title="Remove" aria-label="Remove ' + escapeAttr(p.name) + '">×</button>';
      $(".crew-name", card).textContent = p.name;
      $(".crew-city", card).textContent = p.city ? "from " + p.city : "—";
      $(".crew-remove", card).addEventListener("click", () => removePerson(p.id));
      grid.appendChild(card);
    });
    renderBudgetPeople();
    renderBudgetReadout();
    renderEstimate();
  }

  function escapeAttr(s) { return s.replace(/"/g, "&quot;"); }

  function addPerson(name, city) {
    const i = state.crew.length;
    state.crew.push({ id: uid(), name: name.trim(), city: city.trim(), host: false,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length] });
    save();
    renderCrew();
  }

  function removePerson(id) {
    state.crew = state.crew.filter((p) => p.id !== id);
    delete state.budgets[id];
    save();
    renderCrew();
  }

  /* ----------------------------------------------------------
     BUDGET — anonymous pool
     ---------------------------------------------------------- */
  function renderBudgetPeople() {
    const sel = $("#budget-person");
    const prev = sel.value;
    sel.innerHTML = "";
    state.crew.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      const has = typeof state.budgets[p.id] === "number";
      opt.textContent = p.name + (has ? "  ✓ contributed" : "");
      sel.appendChild(opt);
    });
    if (prev && state.crew.some((p) => p.id === prev)) sel.value = prev;
    reflectAmountField();
  }

  function reflectAmountField() {
    const sel = $("#budget-person");
    const input = $("#budget-amount");
    const id = sel.value;
    if (typeof state.budgets[id] === "number") {
      // Mask it — even YOU only see dots once saved, to keep the habit honest.
      input.value = "";
      input.placeholder = "•••• saved — type to change";
    } else {
      input.value = "";
      input.placeholder = "e.g. 2500";
    }
  }

  function saveBudget() {
    const id = $("#budget-person").value;
    const val = parseFloat($("#budget-amount").value);
    if (!id || isNaN(val) || val < 0) {
      flashNote("Pop in a number first 🙂");
      return;
    }
    state.budgets[id] = val;
    save();
    renderBudgetPeople();
    renderBudgetReadout();
    renderEstimate();
    flashNote("Saved privately. Your number is now hidden. 🤫");
  }

  function flashNote(msg) {
    const note = $("#budget-note");
    const original = "Saved on this device only. Truly anonymous group sync is coming in a later version.";
    note.textContent = msg;
    clearTimeout(flashNote._t);
    flashNote._t = setTimeout(() => { note.textContent = original; }, 3200);
  }

  function poolStats() {
    const ids = state.crew.map((p) => p.id);
    const vals = ids.map((id) => state.budgets[id]).filter((v) => typeof v === "number");
    const total = vals.reduce((a, b) => a + b, 0);
    const contributors = vals.length;
    const headcount = state.crew.length;
    const avg = headcount ? total / headcount : 0;
    return { total, contributors, headcount, avg };
  }

  function tierFor(perPerson) {
    let chosen = TIERS[0];
    for (const t of TIERS) if (perPerson >= t.min) chosen = t;
    return chosen;
  }

  function renderBudgetReadout() {
    const { total, contributors, headcount, avg } = poolStats();
    $("#pool-total").textContent = fmt$(total);
    $("#pool-count").textContent = contributors + " / " + headcount;
    $("#pool-avg").textContent = fmt$(avg);
    const tierEl = $("#pool-tier");
    if (contributors === 0) {
      tierEl.innerHTML = "Add a few budgets to see what tier we can reach.";
    } else {
      const t = tierFor(avg);
      tierEl.innerHTML = "With about <strong>" + fmt$(avg) + "</strong> each, we're in <strong>" +
        t.name + "</strong> territory. " + t.note;
    }
  }

  /* ----------------------------------------------------------
     COST ESTIMATOR
     ---------------------------------------------------------- */
  function renderEstimate() {
    const days = parseInt($("#est-days").value, 10);
    const nights = days; // treat nights ≈ days for a rough band
    const lodging = $("#est-lodging").value;
    const cars = parseInt($("#est-cars").value, 10);
    const region = $("#est-region").value;
    const people = Math.max(state.crew.length, 1);

    const flight = RATES.flights[region];
    const lodgePP = RATES.lodgingPerNight[lodging];
    const carDay = RATES.carPerDay;
    const dayPP = RATES.dailySpendPerPerson;

    // Per-person components
    const flightPP = flight;
    const lodgingPP = [lodgePP[0] * nights, lodgePP[1] * nights];
    const carTotal = [carDay[0] * days * cars, carDay[1] * days * cars];
    const carPP = [carTotal[0] / people, carTotal[1] / people];
    const spendPP = [dayPP[0] * days, dayPP[1] * days];

    const totalPP = [
      flightPP[0] + lodgingPP[0] + carPP[0] + spendPP[0],
      flightPP[1] + lodgingPP[1] + carPP[1] + spendPP[1],
    ];
    const groupTotal = [totalPP[0] * people, totalPP[1] * people];

    const cards = [
      { icon: "✈️", name: "Flights", range: flightPP, sub: "round-trip, per person" },
      { icon: "🛏️", name: "Lodging", range: lodgingPP, sub: nights + " nights, per person" },
      { icon: "🚗", name: cars ? "Car hire" : "Transit", range: cars ? carPP : [0, 0], sub: cars ? cars + " car" + (cars > 1 ? "s" : "") + ", split " + people + " ways" : "trains & buses (in daily spend)" },
      { icon: "🍲", name: "Day-to-day", range: spendPP, sub: "food, pints, entries" },
    ];

    const grid = $("#estimate-grid");
    grid.innerHTML = "";
    cards.forEach((c) => {
      const el = document.createElement("div");
      el.className = "est-card";
      el.innerHTML =
        '<div class="est-icon">' + c.icon + "</div>" +
        '<div class="est-name">' + c.name + "</div>" +
        '<div class="est-range">' + fmtRange(c.range[0], c.range[1]) + "</div>" +
        '<div class="est-sub">' + c.sub + "</div>";
      grid.appendChild(el);
    });

    // Verdict — per person, group total, and how the pool stacks up.
    const { total: poolTotal, contributors } = poolStats();
    const midGroup = (groupTotal[0] + groupTotal[1]) / 2;
    let verdict =
      "Ballpark <span class='big-num'>" + fmtRange(totalPP[0], totalPP[1]) + "</span> per person, " +
      "or <strong>" + fmtRange(groupTotal[0], groupTotal[1]) + "</strong> for all " + people +
      " of us over " + days + " days.";
    if (contributors > 0) {
      if (poolTotal >= groupTotal[0]) {
        const head = poolTotal >= midGroup ? "We've got this. 🎉" : "We're nearly there. 💪";
        verdict += " The pool's at <strong>" + fmt$(poolTotal) + "</strong> so far — " + head;
      } else {
        const gap = groupTotal[0] - poolTotal;
        verdict += " Pool's at <strong>" + fmt$(poolTotal) + "</strong>; about <strong>" +
          fmt$(gap) + "</strong> more gets us to the low end.";
      }
    } else {
      verdict += " Add some budgets above and this'll tell you how close we are.";
    }
    $("#estimate-verdict").innerHTML = verdict;
  }

  /* ----------------------------------------------------------
     TRIP PLANNER — variations from the places dataset
     ---------------------------------------------------------- */
  const PLACES = window.IRELAND_PLACES || [];
  const ROUTE_ORDER = window.IRELAND_ROUTE_ORDER || [];
  const VIBES = window.IRELAND_VIBES || {};

  function renderVibeControls() {
    const wrap = $("#vibe-controls");
    wrap.innerHTML = "";
    Object.keys(VIBES).forEach((key) => {
      const v = VIBES[key];
      const on = !!state.vibes[key];
      const el = document.createElement("div");
      el.className = "vibe-toggle" + (on ? " on" : "");
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.innerHTML =
        '<div class="dot"></div>' +
        '<div class="vibe-text"><div class="vibe-name">' + v.label + '</div>' +
        '<div class="vibe-hint">' + v.hint + "</div></div>";
      const toggle = () => {
        state.vibes[key] = !state.vibes[key];
        save();
        el.classList.toggle("on", state.vibes[key]);
      };
      el.addEventListener("click", toggle);
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
      wrap.appendChild(el);
    });
  }

  function selectedVibes() {
    return Object.keys(state.vibes).filter((k) => state.vibes[k]);
  }

  function scorePlace(place, vibes) {
    let score = 0;
    vibes.forEach((v) => { if (place.vibes.indexOf(v) !== -1) score += 1; });
    return score;
  }

  // How many stops a trip wants, given length + pace.
  function stopCount(days, pace) {
    const base = Math.round(days / 2.5); // ~2.5 nights per stop
    if (pace === "slow") return Math.max(2, base - 1);
    if (pace === "packed") return base + 2;
    return base;
  }

  // Build one route variant. `regionBias` (a region string) and numeric `seed`
  // nudge variety so the 2-3 trips come out genuinely different.
  function buildVariant(vibes, days, pace, regionBias, seed, title, flavor) {
    const wanted = stopCount(days, pace);

    // Score every place; apply a small deterministic jitter per-variant for variety.
    // Keep the jitter numeric (seed is a number) so scores never go NaN, and give a
    // gentle nudge to the variant's bias region so each trip leans somewhere different.
    const scored = PLACES.map((p, i) => ({
      place: p,
      score: scorePlace(p, vibes) + (((i + seed) % 3) * 0.34) + (p.region === regionBias ? 0.6 : 0),
    })).sort((a, b) => b.score - a.score);

    // Take the strongest, but cap how many come from any one region so we actually move.
    const picked = [];
    const regionCount = {};
    for (const s of scored) {
      if (picked.length >= wanted) break;
      const r = s.place.region;
      const cap = pace === "packed" ? 3 : 2;
      if ((regionCount[r] || 0) >= cap) continue;
      if (s.score <= 0 && picked.length >= 2) continue; // don't pad with irrelevant stops
      picked.push(s.place);
      regionCount[r] = (regionCount[r] || 0) + 1;
    }
    if (picked.length < 2) { // fallback: just take top scored
      for (const s of scored) { if (picked.indexOf(s.place) === -1) picked.push(s.place); if (picked.length >= Math.max(2, wanted)) break; }
    }

    // Order stops geographically so the drive makes sense.
    picked.sort((a, b) => ROUTE_ORDER.indexOf(a.region) - ROUTE_ORDER.indexOf(b.region));

    // Spread the days across stops.
    const nightsPer = distributeNights(days, picked.length);

    return {
      title,
      flavor,
      route: picked.map((p) => p.name),
      days: buildDayList(picked, nightsPer),
    };
  }

  function distributeNights(days, stops) {
    const base = Math.floor(days / stops);
    const rem = days - base * stops;
    const arr = new Array(stops).fill(base);
    for (let i = 0; i < rem; i++) arr[i % stops] += 1;
    return arr;
  }

  function buildDayList(places, nightsPer) {
    const list = [];
    let dayCursor = 1;
    places.forEach((p, idx) => {
      const n = nightsPer[idx];
      const end = dayCursor + n - 1;
      const span = n === 1 ? "Day " + dayCursor : "Days " + dayCursor + "–" + end;
      list.push({ span, place: p.name, note: p.blurb });
      dayCursor = end + 1;
    });
    return list;
  }

  function generateTrips() {
    const vibes = selectedVibes();
    const days = parseInt($("#est-days").value, 10) || 10;
    const pace = $("#plan-pace").value;
    const results = $("#plan-results");

    if (vibes.length === 0) {
      results.innerHTML = '<div class="trip-card"><h3>Pick a vibe or two first</h3>' +
        '<p class="trip-why">Tap what you\'re into above — pubs, coast, history — and I\'ll sketch some routes.</p></div>';
      return;
    }

    // Three variants with different regional biases for genuinely different shapes.
    const biases = shuffle(ROUTE_ORDER.slice()).slice(0, 3);
    const labels = [
      { title: "The Classic Loop", flavor: "A confident, well-rounded swing through the greatest hits." },
      { title: "The Road Less Driven", flavor: "Same loves, quieter corners — more space to breathe." },
      { title: "The Deep Cut", flavor: "Leans hardest into what you picked. A bit more committed." },
    ];

    const variants = labels.map((lab, i) =>
      buildVariant(vibes, days, pace, biases[i] || ROUTE_ORDER[i] || "West", i, lab.title, lab.flavor));

    results.innerHTML = "";
    variants.forEach((v, i) => results.appendChild(renderTripCard(v, i)));
  }

  function renderTripCard(v, i) {
    const card = document.createElement("div");
    card.className = "trip-card";
    card.style.animationDelay = (i * 0.08) + "s";

    const route = document.createElement("div");
    route.className = "trip-route";
    v.route.forEach((name, idx) => {
      if (idx > 0) {
        const arr = document.createElement("span");
        arr.className = "route-pill arrow";
        arr.textContent = "→";
        route.appendChild(arr);
      }
      const pill = document.createElement("span");
      pill.className = "route-pill";
      pill.textContent = name;
      route.appendChild(pill);
    });

    const days = document.createElement("ul");
    days.className = "trip-days";
    v.days.forEach((d) => {
      const li = document.createElement("li");
      li.className = "trip-day";
      li.innerHTML = '<div class="day-num"></div><div class="day-body">' +
        '<div class="day-place"></div><div class="day-note"></div></div>';
      $(".day-num", li).textContent = d.span;
      $(".day-place", li).textContent = d.place;
      $(".day-note", li).textContent = d.note;
      days.appendChild(li);
    });

    const h = document.createElement("h3");
    h.textContent = v.title;
    const why = document.createElement("p");
    why.className = "trip-why";
    why.textContent = v.flavor;

    card.appendChild(h);
    card.appendChild(why);
    card.appendChild(route);
    card.appendChild(days);
    return card;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ----------------------------------------------------------
     PLACES GRID
     ---------------------------------------------------------- */
  let placeFilter = "all";

  function renderPlaceFilters() {
    const wrap = $("#place-filters");
    wrap.innerHTML = "";
    const filters = [{ key: "all", label: "Everything" }].concat(
      Object.keys(VIBES).map((k) => ({ key: k, label: VIBES[k].label }))
    );
    filters.forEach((f) => {
      const chip = document.createElement("button");
      chip.className = "filter-chip" + (placeFilter === f.key ? " on" : "");
      chip.textContent = f.label;
      chip.addEventListener("click", () => { placeFilter = f.key; renderPlaceFilters(); renderPlaceGrid(); });
      wrap.appendChild(chip);
    });
  }

  function renderPlaceGrid() {
    const grid = $("#place-grid");
    grid.innerHTML = "";
    const list = placeFilter === "all"
      ? PLACES
      : PLACES.filter((p) => p.vibes.indexOf(placeFilter) !== -1);
    list.forEach((p) => {
      const card = document.createElement("div");
      card.className = "place-card";
      const tags = p.vibes.map((v) => '<span class="place-tag">' + ((VIBES[v] && VIBES[v].label) || v) + "</span>").join("");
      card.innerHTML =
        '<div class="place-region">' + p.region + "</div>" +
        "<h3></h3>" +
        '<p class="place-blurb"></p>' +
        '<div class="place-tags">' + tags + "</div>";
      $("h3", card).textContent = p.name;
      $(".place-blurb", card).textContent = p.blurb;
      grid.appendChild(card);
    });
  }

  /* ----------------------------------------------------------
     NAV scroll state + wiring
     ---------------------------------------------------------- */
  function wireNav() {
    const nav = $(".topnav");
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function wireEvents() {
    $("#crew-add").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#crew-name").value;
      if (!name.trim()) return;
      addPerson(name, $("#crew-city").value);
      $("#crew-name").value = "";
      $("#crew-city").value = "";
      $("#crew-name").focus();
    });

    $("#budget-person").addEventListener("change", reflectAmountField);
    $("#budget-save").addEventListener("click", saveBudget);
    $("#budget-amount").addEventListener("keydown", (e) => { if (e.key === "Enter") saveBudget(); });

    ["#est-days", "#est-lodging", "#est-cars", "#est-region"].forEach((sel) =>
      $(sel).addEventListener("change", renderEstimate));

    $("#plan-generate").addEventListener("click", generateTrips);
  }

  /* ----------------------------------------------------------
     INIT
     ---------------------------------------------------------- */
  function init() {
    $("#year").textContent = new Date().getFullYear();
    renderCrew();
    renderVibeControls();
    renderEstimate();
    renderPlaceFilters();
    renderPlaceGrid();
    wireNav();
    wireEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
