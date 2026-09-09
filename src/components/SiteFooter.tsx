import Link from "next/link";

const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL;

const REPO_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/saqibrafay/global-kindness-map";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line-soft">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-xl leading-snug text-paper">
              Somewhere right now, someone is being kind for no reason at all.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-paper-faint">
              Free and open source. No accounts, no algorithm, no ranking —
              just a record of it happening.
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-[0.7rem] tracking-[0.18em] uppercase text-paper-faint"
            aria-label="Footer"
          >
            <Link href="/" className="transition-colors hover:text-glow">
              Map
            </Link>
            <Link href="/add" className="transition-colors hover:text-glow">
              Add a pin
            </Link>
            <Link href="/atlas" className="transition-colors hover:text-glow">
              Atlas
            </Link>
            <Link href="/about" className="transition-colors hover:text-glow">
              About
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-glow"
            >
              Source ↗
            </a>
            {SUPPORT_URL && (
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-glow"
              >
                Support ↗
              </a>
            )}
          </nav>
        </div>

        <div className="hairline my-8" />

        <p className="font-mono text-[0.68rem] tracking-[0.14em] text-paper-faint/70">
          MAP DATA © OPENSTREETMAP CONTRIBUTORS · NO TRACKING · MIT LICENSED
        </p>
      </div>
    </footer>
  );
}
