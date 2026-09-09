/**
 * Optional "support this project" panel.
 *
 * Renders nothing unless NEXT_PUBLIC_SUPPORT_URL is set, so a fork doesn't
 * ship a donate link pointing at somebody else's account.
 *
 * Deliberately quieter than the "Add your light" call to action next to
 * it — on a site about giving something away, asking for money should
 * never be the loudest thing on the page.
 */
export default function SupportCallout({ className = "" }: { className?: string }) {
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL;
  if (!supportUrl) return null;

  return (
    <section
      aria-labelledby="support-heading"
      className={`rounded-2xl border border-line-soft bg-ink-2/50 p-6 sm:p-7 ${className}`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-line-soft text-lg"
        >
          ☕
        </span>

        <div className="min-w-0 flex-1">
          <p className="eyebrow">Running costs</p>
          <h2
            id="support-heading"
            className="mt-2 font-display text-xl leading-snug text-balance text-paper"
          >
            This map costs almost nothing to run, on purpose
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-paper-dim">
            Every piece of it was chosen to sit inside a free tier —
            OpenStreetMap for the map, a free database, a free host. What
            isn&rsquo;t free is the domain, the hosting once it outgrows
            that tier, and the evenings. If the project is worth something
            to you, a coffee helps keep it up. If it isn&rsquo;t, adding a
            pin helps more.
          </p>

          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost mt-5 px-5 py-2.5 font-mono text-[0.66rem] tracking-[0.14em] uppercase"
          >
            Buy me a coffee ↗
          </a>
        </div>
      </div>
    </section>
  );
}
