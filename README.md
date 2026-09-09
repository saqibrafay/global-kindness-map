# 🌍 Global Kindness Map

A live, open-source world map built from real acts of kindness — dropped
by people everywhere. Anyone can add a pin describing something kind they
did, received, or witnessed; each story gets its own shareable page so it
can be passed on.

No accounts. No algorithm curating what you see. Just a growing record of
good things happening, everywhere, at once.

## Screens

| Route | What it is |
| --- | --- |
| `/` | Hero, live counters, and the map — category filters drive both the markers and the story rail |
| `/atlas` | Country ranking by place-days (see below), category split, and time-of-day rhythm |
| `/add` | Three-step submission: drop a pin, pick a kind, tell the story |
| `/kindness/[id]` | One story, its coordinates, a mini-map, share links and a "pass it on" chain |
| `/about` | What it is, how it's moderated, and what it deliberately doesn't do |

Both a night and a day theme ship, following the OS preference until the
visitor picks one; the choice is remembered locally and applied before
first paint.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Leaflet](https://leafletjs.com) / [react-leaflet](https://react-leaflet.js.org) for the map (OpenStreetMap tiles — no API key needed)
- [Supabase](https://supabase.com) (Postgres) for the database — free tier
- Deploy target: [Vercel](https://vercel.com) — free tier

No API keys are needed for the map: OpenStreetMap tiles are used directly
and restyled in CSS for the night theme, rather than pulling a dark
basemap from a provider that requires a key.

Chosen deliberately to keep this runnable at **zero cost** for a
side-project scale audience.

## Getting started

```bash
git clone https://github.com/saqibrafay/global-kindness-map.git
cd global-kindness-map/kindness-map
npm install
cp .env.example .env.local
```

### 1. Set up Supabase (free)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy your Project URL, anon key, and service role key from
   **Project Settings → API** into `.env.local`.

### 2. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

**You can skip step 1 entirely to look around.** With no Supabase
credentials the app falls back to a built-in set of sample stories, and
pins you add are held in memory until the server restarts. The UI says so
on every page, so sample data is never mistaken for real submissions. Add
real credentials and it switches over automatically — no code change.

### 3. Deploy (free, on Vercel)

1. Push this repo to your own GitHub account.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the same environment variables from `.env.local` in the Vercel
   project settings.
4. Deploy. Set `NEXT_PUBLIC_SITE_URL` to your real deployed URL afterwards
   (needed for correct share links / Open Graph images).

### 4. Ads (optional)

Once your live site has enough content/traffic to be approved for
[Google AdSense](https://www.google.com/adsense/), set
`NEXT_PUBLIC_ADSENSE_CLIENT_ID` and ad slots (see
[`src/components/AdSlot.tsx`](./src/components/AdSlot.tsx)) will activate
automatically.

## Project structure

```
src/
  app/
    page.tsx                  → home page (hero, stats, map + story rail)
    atlas/page.tsx            → country / category / time analytics
    add/page.tsx              → submission form
    kindness/[id]/page.tsx    → shareable individual pin page (+ dynamic OG image)
    not-found.tsx, error.tsx  → styled 404 and error states
    robots.ts, sitemap.ts     → SEO routes
    api/pins/route.ts         → list (GET) + create (POST) pins
    api/pins/[id]/route.ts    → fetch a single pin
  components/                 → map, cards, form, share, theme toggle
    atlas/                    → leaderboard + rhythm chart
    map/markerIcon.ts         → CSS marker icons, tile config
  lib/
    supabase/                 → browser / server / admin Supabase clients
    pins/store.ts             → the only read/write path (Supabase or demo)
    pins/analytics.ts         → Atlas aggregation
    geo/                      → country data + reverse geocoding
    moderation.ts             → validation, profanity filter, rate limiting
  types/pin.ts                → shared types, categories, colour tokens
supabase/schema.sql           → database schema + RLS policies
```

## Brand assets

The logo is a night globe with one warm light on it — the same "one act of
kindness = one light" idea the map markers use. It's vector, so it stays
crisp from a 16px browser tab to a 512px app icon.

| File | Used for |
| --- | --- |
| `src/app/icon.svg` | The source of truth. Favicon, and rasterised by the two below. |
| `src/app/apple-icon.tsx` | 180×180 PNG touch icon for iOS |
| `src/app/opengraph-image.tsx` | 1200×630 share card for the home page |
| `src/components/BrandMark.tsx` | Inline copy for the header |

To change the logo, edit `icon.svg` and mirror the shapes in
`BrandMark.tsx` — the two PNG routes rasterise the SVG, so they follow
automatically. Need a PNG at some other size (a social profile picture,
say)? Open `/icon.svg` in a browser and export, or temporarily change the
`size` in `apple-icon.tsx` and save the result from `/apple-icon`.

## Why the Atlas doesn't rank by pin count

Anyone can ask a language model for three hundred plausible, unique,
well-written kindness stories set in one country and post them in an
evening. Nothing about an individual pin gives that away — not a duplicate
filter, not a profanity filter, not a human reviewer. Ranking countries by
raw submissions would just rank whoever wanted it most.

So `/atlas` orders countries by **place-days**: one point per place
(~55km cell) per calendar day a story arrived from it, counting at most
three places in any single day. Coordinates are attacker-controlled input,
but calendar days are not — so the score is anchored to time.

Measured against `buildAtlas` directly:

| Scenario | Pins | Score |
| --- | --- | --- |
| 300 fabricated stories, one city, one day | 300 | **doesn't rank** |
| 300 fabricated stories, coordinates scattered, one day | 300 | **3** |
| 300 fabricated stories, scattered over a week | 300 | **21** |
| 40 genuine pins, 12 cities, across 90 days | 40 | **40** |

Each row also shows its own shape — *"18 pins · 7 places · 9 days"* — so a
lopsided country is visible to the reader rather than something they have
to take on trust. Countries below `MIN_PLACE_DAYS_TO_RANK` are listed
separately instead of ranked on noise.

None of this makes the number *true*. An anonymous, unverified, open
submission form cannot produce a trustworthy ranking of national kindness,
and the page says so. What it can do is report participation honestly and
make gaming expensive rather than free.

## How writes are protected

The anon/browser Supabase key can only **read** approved pins (enforced by
Row Level Security — see `supabase/schema.sql`). All new pins are created
through the `/api/pins` server route, which:

1. Rate-limits by IP (in-memory — see note below). Two budgets: five
   *saved* pins an hour, and a much higher ceiling on total attempts —
   so a run of rejected drafts can't lock someone out.
2. Validates coordinates, category, and message length.
3. Runs a local profanity filter and blocks links.
4. Optionally screens the message with an AI provider — set either
   `GEMINI_API_KEY` (free tier, no billing setup) or `OPENAI_API_KEY`
   (the Moderation endpoint bills no tokens, but the account still needs
   billing configured or every call returns 429). It **fails open**: if the
   provider is unreachable the local filter still runs and people can
   still post.
5. Resolves the country from the coordinates for `/atlas` (best-effort;
   never blocks the write — see `REVERSE_GEOCODE` in `.env.example`).
6. Writes using the Supabase **service role** key, server-side only.

### A note on what blocks

The hard part isn't catching abuse — it's *not* catching the stories this
site exists for. Generic harm categories fire on any mention of distress
or injury, and the kindest entries here are full of both: *"I sat with
someone crying on the train"*, *"two strangers stopped when my car died on
the motorway"*.

- **Gemini** (`gemini.ts`) is used as a structured classifier, so the policy
  states outright that grief, illness, accidents and unpolished or
  non-native English are all fine. Its own safety filters are set to
  `BLOCK_NONE` for the call — we need it to *classify* harmful text rather
  than refuse to read it, and we don't want it rejecting a distress story
  before our policy gets a say.
- **OpenAI** (`openai.ts`) has fixed categories, so it blocks on the sharp
  ones only (hate, threats, sexual, graphic violence, illicit) and
  deliberately ignores the general `self-harm` and `violence` categories.

Both treat self-harm *intent* separately: that gets a compassionate message
pointing to findahelpline.com rather than a blank refusal.

Verified live against Gemini — 7/7, including three "must pass" stories
that a naive filter would eat.

This keeps moderation logic in one place instead of relying on database
policies to enforce content rules.

## Contributing

Contributions are very welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)
for setup notes and a list of good first issues (better spam detection,
marker clustering for dense areas, i18n, a moderation dashboard, and
more).

## License

[MIT](./LICENSE) — do whatever you like with this, attribution
appreciated but not required.
