# Contributing to Global Kindness Map

Thanks for considering a contribution — this project is meant to grow
with its community.

## Setup

See the "Getting started" section in [README.md](./README.md) — you'll
need a free Supabase project to run the app locally with real data (the
map still loads with an empty state if you skip this).

```bash
npm install
npm run dev
npm run lint
```

## Ways to contribute

- **Report bugs / suggest features** via GitHub Issues.
- **Submit pull requests** — small, focused PRs are easiest to review.
- **Improve moderation** — the current profanity/spam filter
  (`src/lib/moderation.ts`) is intentionally basic. It could use:
  smarter spam detection, multi-language profanity lists, and a shared
  (not in-memory) rate limiter for production scale.
- **Add marker clustering** for the map so dense areas (e.g. big cities)
  render cleanly instead of overlapping pins.
- **Add a moderation dashboard** for flagging/removing inappropriate
  pins (currently all pins are auto-approved).
- **Internationalization** — the UI is English-only today.
- **Accessibility passes** on the map and form (keyboard navigation,
  screen reader labels).

## Code style

- TypeScript, functional React components.
- Tailwind for styling — avoid introducing a second styling system.
- Keep new dependencies minimal — this project intentionally favors free,
  low-maintenance tools.

## Pull request guidelines

1. Fork the repo and create a branch off `main`.
2. Keep PRs focused on one change.
3. Run `npm run lint` before submitting.
4. Describe what you changed and why in the PR description.

By contributing, you agree your contributions will be licensed under the
project's [MIT license](./LICENSE).
