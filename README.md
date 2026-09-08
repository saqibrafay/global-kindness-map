# 🌍 Global Kindness Map

A live, open-source world map built from real acts of kindness — dropped
by people everywhere. Anyone can add a pin describing something kind they
did, received, or witnessed; each story gets its own shareable page so it
can be passed on.

No accounts. No algorithm curating what you see. Just a growing record of
good things happening, everywhere, at once.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Leaflet](https://leafletjs.com) / [react-leaflet](https://react-leaflet.js.org) for the map (OpenStreetMap tiles — no API key needed)
- [Supabase](https://supabase.com) (Postgres) for the database — free tier
- Deploy target: [Vercel](https://vercel.com) — free tier

Chosen deliberately to keep this runnable at **zero cost** for a
side-project scale audience.

## Getting started

```bash
git clone <your-fork-url>
cd kindness-map
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

Visit [http://localhost:3000](http://localhost:3000). The map will be
empty until you add your first pin via **+ Add kindness**.

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
    page.tsx                 → home page (map + feed)
    add/page.tsx              → submission form
    kindness/[id]/page.tsx    → shareable individual pin page (+ dynamic OG image)
    api/pins/route.ts         → list (GET) + create (POST) pins
    api/pins/[id]/route.ts    → fetch a single pin
  components/                → map, feed, form, share button components
  lib/
    supabase/                → browser / server / admin Supabase clients
    moderation.ts             → validation, profanity filter, rate limiting
  types/pin.ts                → shared types + category list
supabase/schema.sql            → database schema + RLS policies
```

## How writes are protected

The anon/browser Supabase key can only **read** approved pins (enforced by
Row Level Security — see `supabase/schema.sql`). All new pins are created
through the `/api/pins` server route, which:

1. Rate-limits by IP (in-memory — see note below).
2. Validates coordinates, category, and message length.
3. Runs a basic profanity filter and blocks links.
4. Writes using the Supabase **service role** key, server-side only.

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
