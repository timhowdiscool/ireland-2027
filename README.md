# Ireland 2027 🍀

A little site to plan a 40th birthday trip to Ireland with the people who matter most —
built so the planning feels light, shared, and guilt-free.

**Live site:** _(add your Netlify URL here once deployed)_

## What it does

- **Crew** — add/remove who's coming (seeded with the founding five). The headcount quietly
  powers the budget and trip planner.
- **The pool** — everyone enters a private budget; once saved it's masked to dots. The site
  only ever shows the **group total, average, and the trip tier we can reach** — so no one
  feels exposed about who's putting in what.
- **The rough numbers** — honest USD ballpark ranges for flights, lodging, car hire, and
  daily spend. Compares the pool to the estimate so we know how close we are.
- **The planner** — pick what you love (pubs, coast, history…) and it sketches 2–3 different
  routes from the places list, sized to the trip length and pace. Re-roll for more.
- **The places** — a starter list of Irish destinations, filterable by vibe. _Renée's binder
  grows this later._

## Tech

Deliberately **zero-build**: plain HTML, CSS, and vanilla JS. No framework, no bundler, no
install step. Open `index.html` and it just works.

```
index.html        the whole page
style.css         styling (Ireland palette)
app.js            all the logic + state (localStorage)
data/places.js    the destinations dataset (window.IRELAND_PLACES)
assets/           favicon + optional hero.jpg (see assets/README.md)
netlify.toml      Netlify publish config
```

## Run it locally

Just open `index.html` in your browser. That's it. Everything (crew, budgets, planner)
persists in your browser's localStorage.

## Deploy to Netlify

1. Push this repo to GitHub (see below).
2. In Netlify: **Add new site → Import an existing project → pick this repo.**
3. Build command: _(leave empty)_ · Publish directory: `.` — already set in `netlify.toml`.
4. Deploy. Done.

## Tuning the estimates

All cost assumptions live in one clearly-labeled `RATES` object at the top of `app.js`
(flights by region, lodging/night by style, car/day, daily spend). Adjust freely — every
number on the page recalculates live.

## Phase 2 ideas (not built yet)

- **Truly anonymous, cross-device budgets** via a free [Supabase](https://supabase.com)
  project: a `contributions` table with row-level security so each device can write its own
  number and read only the aggregate — never anyone else's figure. Today's localStorage
  version keeps numbers on one device.
- **Ingest Renée's travel binder** into `data/places.js` (same shape) to make the planner
  richer and more personal.
- Real hero photo, share links, RSVP / notifications.

---

Open hearts, open minds. Sláinte.
