import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-28 text-center sm:px-8">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1.02] text-balance text-paper">
        Off the edge of the map
      </h1>
      <p className="mt-5 max-w-md leading-relaxed text-paper-dim">
        There is nothing at these coordinates. The story may have been
        removed, or the link picked up a stray character on its way here.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-glow px-7 py-3.5 text-[0.95rem]">
          Back to the map
        </Link>
        <Link href="/add" className="btn-ghost px-6 py-3.5 text-[0.9rem]">
          Add a pin instead
        </Link>
      </div>
    </div>
  );
}
