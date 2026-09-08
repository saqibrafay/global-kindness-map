"use client";

import { useState } from "react";

export default function ShareButtons({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, non-secure context) — ignore silently.
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:border-amber-400"
      >
        WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:border-amber-400"
      >
        X / Twitter
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:border-amber-400"
      >
        Facebook
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:border-amber-400"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
