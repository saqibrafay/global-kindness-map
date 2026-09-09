"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type CopyState = "idle" | "copied" | "failed";

/** Capability detection never changes, so there is nothing to subscribe to. */
const subscribeToNothing = () => () => {};

export default function ShareButtons({ url, text }: { url: string; text: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  // navigator.share only exists in some browsers (and only over HTTPS).
  // Feature-detected via useSyncExternalStore so the server renders `false`
  // and the client corrects it during hydration — no setState-in-effect.
  const canNativeShare = useSyncExternalStore(
    subscribeToNothing,
    () => typeof navigator !== "undefined" && "share" in navigator,
    () => false
  );

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = setTimeout(() => setCopyState("idle"), 2400);
    return () => clearTimeout(timer);
  }, [copyState]);

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopyState("copied");
        return;
      }
      throw new Error("no clipboard");
    } catch {
      // Clipboard can fail on permissions or a non-secure context. Say so
      // instead of failing silently like the old version did.
      setCopyState("failed");
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "Global Kindness Map", text, url });
    } catch {
      // The person dismissed the sheet — nothing to report.
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const links = [
    {
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(
        "A small act of kindness"
      )}&body=${encodedText}%20${encodedUrl}`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {canNativeShare && (
        <button
          type="button"
          onClick={nativeShare}
          className="btn-ghost px-4 py-2.5 font-mono text-[0.66rem] tracking-[0.14em] uppercase"
        >
          ↗ Share
        </button>
      )}

      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost px-4 py-2.5 font-mono text-[0.66rem] tracking-[0.14em] uppercase"
        >
          {link.label}
        </a>
      ))}

      <button
        type="button"
        onClick={copyLink}
        className="btn-ghost px-4 py-2.5 font-mono text-[0.66rem] tracking-[0.14em] uppercase"
        style={
          copyState === "copied"
            ? { borderColor: "var(--color-glow)", color: "var(--color-glow)" }
            : undefined
        }
      >
        {copyState === "copied"
          ? "✓ Copied"
          : copyState === "failed"
            ? "Copy failed"
            : "Copy link"}
      </button>

      <span className="sr-only" role="status">
        {copyState === "copied"
          ? "Link copied to clipboard"
          : copyState === "failed"
            ? "Could not copy the link"
            : ""}
      </span>
    </div>
  );
}
