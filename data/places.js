/* ============================================================
   Ireland 2027 — starter places dataset
   ------------------------------------------------------------
   This is the SEED. Renée's travel binder will grow this list.
   Keep the same shape and the planner + Places grid pick it up
   automatically — no other code changes needed.

   Each place:
     id           unique slug
     name         display name
     region       broad area, used to stitch routes (see ROUTE_ORDER)
     vibes        any of: pubs, history, nature, cities, food, scenic
     blurb        one warm sentence
     costTier     1 (easy) · 2 (moderate) · 3 (splurge)  — rough on-the-ground cost
   ============================================================ */

window.IRELAND_PLACES = [
  {
    id: "dublin",
    name: "Dublin",
    region: "East",
    vibes: ["pubs", "history", "cities", "food"],
    blurb: "The capital — Temple Bar sessions, Trinity's Book of Kells, and Guinness at the source.",
    costTier: 3,
  },
  {
    id: "kilkenny",
    name: "Kilkenny",
    region: "Southeast",
    vibes: ["history", "pubs", "cities"],
    blurb: "A medieval city built around a castle, with a famously walkable 'Medieval Mile' of pubs.",
    costTier: 2,
  },
  {
    id: "cork",
    name: "Cork",
    region: "South",
    vibes: ["food", "cities", "pubs"],
    blurb: "Ireland's foodie heart — the English Market, harbour views, and a fierce local pride.",
    costTier: 2,
  },
  {
    id: "kinsale",
    name: "Kinsale",
    region: "South",
    vibes: ["food", "scenic", "history"],
    blurb: "A pastel harbour town that punches far above its weight on seafood and charm.",
    costTier: 2,
  },
  {
    id: "killarney-np",
    name: "Killarney National Park",
    region: "Southwest",
    vibes: ["nature", "scenic", "history"],
    blurb: "Lakes, mountains, and Muckross House — wild deer and jaunting carts included.",
    costTier: 1,
  },
  {
    id: "ring-of-kerry",
    name: "Ring of Kerry",
    region: "Southwest",
    vibes: ["scenic", "nature"],
    blurb: "A 180km loop of coastline, mountain passes, and postcard villages.",
    costTier: 1,
  },
  {
    id: "dingle",
    name: "Dingle Peninsula",
    region: "Southwest",
    vibes: ["scenic", "pubs", "nature", "food"],
    blurb: "Trad music in tiny pubs, a friendly dolphin's old haunt, and the staggering Slea Head Drive.",
    costTier: 2,
  },
  {
    id: "cliffs-of-moher",
    name: "Cliffs of Moher",
    region: "West",
    vibes: ["scenic", "nature"],
    blurb: "214 metres of sheer Atlantic drama — the shot everyone pictures when they think of Ireland.",
    costTier: 1,
  },
  {
    id: "the-burren",
    name: "The Burren",
    region: "West",
    vibes: ["nature", "scenic", "history"],
    blurb: "A lunar limestone landscape hiding wildflowers, ancient tombs, and hidden pubs.",
    costTier: 1,
  },
  {
    id: "galway",
    name: "Galway",
    region: "West",
    vibes: ["pubs", "food", "cities", "history"],
    blurb: "The west's beating heart — buskers, oysters, and the best night out in the country.",
    costTier: 2,
  },
  {
    id: "aran-islands",
    name: "Aran Islands",
    region: "West",
    vibes: ["nature", "scenic", "history"],
    blurb: "Stone-walled islands where Irish is still spoken and Dún Aonghasa clings to a cliff edge.",
    costTier: 2,
  },
  {
    id: "connemara",
    name: "Connemara",
    region: "West",
    vibes: ["nature", "scenic"],
    blurb: "Bogs, ponies, and the Twelve Bens — Ireland's wildest, most cinematic stretch.",
    costTier: 1,
  },
  {
    id: "kylemore-abbey",
    name: "Kylemore Abbey",
    region: "West",
    vibes: ["history", "scenic"],
    blurb: "A fairytale castle-abbey mirrored in a Connemara lake, with Victorian walled gardens.",
    costTier: 2,
  },
  {
    id: "westport",
    name: "Westport & Achill",
    region: "Northwest",
    vibes: ["scenic", "nature", "pubs"],
    blurb: "A planned Georgian town beside Croagh Patrick, gateway to Achill's huge Atlantic beaches.",
    costTier: 1,
  },
  {
    id: "sligo",
    name: "Sligo & Yeats Country",
    region: "Northwest",
    vibes: ["nature", "scenic", "history"],
    blurb: "Surf beaches under the flat-topped Benbulben, and the poet W.B. Yeats's beloved hills.",
    costTier: 1,
  },
  {
    id: "donegal",
    name: "Donegal & Slieve League",
    region: "Northwest",
    vibes: ["nature", "scenic"],
    blurb: "Sea cliffs nearly three times the height of Moher, and almost nobody around to see them.",
    costTier: 1,
  },
  {
    id: "derry",
    name: "Derry / Londonderry",
    region: "North",
    vibes: ["history", "cities", "pubs"],
    blurb: "The only fully walled city in Ireland, with powerful, walkable modern history.",
    costTier: 2,
  },
  {
    id: "giants-causeway",
    name: "Giant's Causeway",
    region: "North",
    vibes: ["scenic", "nature", "history"],
    blurb: "40,000 hexagonal basalt columns and a legend about a giant's road — on the Causeway Coast.",
    costTier: 1,
  },
  {
    id: "belfast",
    name: "Belfast",
    region: "North",
    vibes: ["history", "cities", "food", "pubs"],
    blurb: "Titanic Quarter, Game of Thrones country nearby, and a brilliant, gritty bar scene.",
    costTier: 2,
  },
  {
    id: "boyne-valley",
    name: "Boyne Valley & Newgrange",
    region: "East",
    vibes: ["history", "nature"],
    blurb: "A 5,200-year-old passage tomb older than the pyramids, lit by the winter solstice sun.",
    costTier: 1,
  },
];

/* Rough geographic order for stitching a sensible driving loop.
   The planner walks this order so routes never zig-zag across the island. */
window.IRELAND_ROUTE_ORDER = [
  "East",
  "Southeast",
  "South",
  "Southwest",
  "West",
  "Northwest",
  "North",
];

/* Human-friendly labels + descriptions for each vibe used in the planner. */
window.IRELAND_VIBES = {
  pubs:    { label: "Pubs & live music", hint: "Trad sessions, late nights, craic" },
  history: { label: "History & castles",  hint: "Ruins, tombs, walled cities" },
  nature:  { label: "Nature & hikes",     hint: "Mountains, parks, wild walks" },
  scenic:  { label: "Coast & scenery",    hint: "Cliffs, drives, big views" },
  cities:  { label: "Cities & buzz",      hint: "Galleries, shops, nightlife" },
  food:    { label: "Food & markets",     hint: "Seafood, markets, good tables" },
};
