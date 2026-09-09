"use client";

import { useEffect, useRef } from "react";

/**
 * Google AdSense slot.
 *
 * Inert until BOTH env vars are set, so the open-source project runs
 * cleanly with no ads configured:
 *   NEXT_PUBLIC_ADSENSE_CLIENT_ID  (ca-pub-XXXXXXXXXXXXXXXX)
 *   NEXT_PUBLIC_ADSENSE_SLOT_ID    (the numeric ad unit id)
 *
 * The loader script itself is added site-wide in src/app/layout.tsx.
 * The previous version rendered an <ins> without a slot id and never
 * called the adsbygoogle push, so a configured unit would never fill.
 */
export default function AdSlot({
  label = "Ad",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;
  const pushed = useRef(false);

  const active = Boolean(clientId && slotId);

  useEffect(() => {
    if (!active || pushed.current) return;
    pushed.current = true;
    try {
      const w = window as typeof window & { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch (err) {
      console.error("[ads] failed to request an ad:", err);
    }
  }, [active]);

  if (!active) {
    return (
      <div
        className={`flex min-h-20 w-full items-center justify-center rounded-2xl border border-dashed border-line-soft px-4 py-5 text-center ${className}`}
      >
        <p className="font-mono text-[0.62rem] tracking-[0.16em] text-paper-faint/70 uppercase">
          {label} · set NEXT_PUBLIC_ADSENSE_CLIENT_ID + _SLOT_ID to enable
        </p>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
      aria-label={label}
    />
  );
}
