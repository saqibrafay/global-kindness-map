"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled render error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-28 text-center sm:px-8">
      <p className="eyebrow">Something broke</p>
      <h1 className="mt-5 font-display text-[clamp(2.2rem,5.5vw,3.4rem)] leading-[1.05] text-balance text-paper">
        The lights went out for a second
      </h1>
      <p className="mt-5 max-w-md leading-relaxed text-paper-dim">
        An unexpected error stopped this page from rendering. Trying again
        usually fixes it.
      </p>
      {error.digest && (
        <p className="mt-4 font-mono text-[0.68rem] tracking-[0.12em] text-paper-faint">
          REF {error.digest}
        </p>
      )}
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-glow px-7 py-3.5 text-[0.95rem]">
          Try again
        </button>
        <Link href="/" className="btn-ghost px-6 py-3.5 text-[0.9rem]">
          Back to the map
        </Link>
      </div>
    </div>
  );
}
