import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-gray-700">
      <h1 className="mb-4 text-2xl font-bold text-amber-900">About Global Kindness Map</h1>
      <p className="mb-4">
        Global Kindness Map is a free, open-source project: a live world map
        built entirely from real acts of kindness that people choose to
        share. No accounts, no algorithms deciding what you see first — just
        a growing record of good things happening everywhere, at once.
      </p>
      <p className="mb-4">
        Anyone can drop a pin describing something kind they did, received,
        or witnessed. Each story gets its own shareable page, so you can pass
        it along and — hopefully — start a small chain of people doing the
        same.
      </p>
      <p className="mb-4">
        This project is open source. If you would like to improve the
        moderation system, add features, or just poke around the code, the
        repository link is in the footer.
      </p>
    </div>
  );
}
