"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LocationPickerClient from "./LocationPickerClient";
import type { Coords } from "./LocationPickerMap";
import {
  KINDNESS_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
  CATEGORY_COLOR_VARS,
  categoryTint,
  type KindnessCategory,
} from "@/types/pin";
import { formatCoords } from "@/lib/time";

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 500;

export default function AddKindnessForm({
  chainParentId,
}: {
  chainParentId?: string;
}) {
  const router = useRouter();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [category, setCategory] = useState<KindnessCategory>("help_stranger");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touchedMessage, setTouchedMessage] = useState(false);

  const trimmedLength = message.trim().length;
  const messageTooShort = trimmedLength > 0 && trimmedLength < MESSAGE_MIN;
  const canSubmit = Boolean(coords) && trimmedLength >= MESSAGE_MIN && !submitting;

  const remaining = MESSAGE_MAX - message.length;
  const counterTone = useMemo(() => {
    if (remaining < 0) return "text-danger";
    if (remaining < 60) return "text-glow";
    return "text-paper-faint";
  }, [remaining]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTouchedMessage(true);

    if (!coords) {
      setError("Pick the spot on the map first — that's what puts your story on it.");
      return;
    }
    if (trimmedLength < MESSAGE_MIN) {
      setError(`Tell us a little more — at least ${MESSAGE_MIN} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: coords.lat,
          longitude: coords.lng,
          location_label: locationLabel.trim() || undefined,
          category,
          message,
          chain_parent_id: chainParentId || null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/kindness/${json.pin.id}?new=1`);
      router.refresh();
    } catch {
      setError("Network error — check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12" noValidate>
      {chainParentId && (
        <div className="panel flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3.5">
          <span className="font-mono text-[0.62rem] tracking-[0.18em] text-glow uppercase">
            Passing it on
          </span>
          <p className="text-sm text-paper-dim">
            Your pin will be linked to the story that sent you here.
          </p>
          <Link
            href={`/kindness/${chainParentId}`}
            className="font-mono text-[0.66rem] tracking-[0.12em] text-paper-faint uppercase underline-offset-4 hover:text-glow hover:underline"
          >
            View it ↗
          </Link>
        </div>
      )}

      {/* --------------------------------------------------------- 01 Place */}
      <Step n="01" title="Where did it happen?">
        <LocationPickerClient value={coords} onChange={setCoords} category={category} />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p
            className="font-mono text-[0.68rem] tracking-[0.12em] uppercase"
            aria-live="polite"
          >
            {coords ? (
              <span className="text-glow">◈ {formatCoords(coords.lat, coords.lng)}</span>
            ) : (
              <span className="text-paper-faint">No pin dropped yet</span>
            )}
          </p>
          {coords && (
            <button
              type="button"
              onClick={() => setCoords(null)}
              className="font-mono text-[0.66rem] tracking-[0.12em] text-paper-faint uppercase hover:text-glow"
            >
              Reset pin
            </button>
          )}
        </div>

        <div className="mt-6">
          <label
            htmlFor="location_label"
            className="mb-2 block font-mono text-[0.66rem] tracking-[0.16em] text-paper-faint uppercase"
          >
            Name the place <span className="normal-case">(optional)</span>
          </label>
          <input
            id="location_label"
            type="text"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            maxLength={120}
            placeholder="e.g. Hyderabad, India"
            className="field"
            autoComplete="off"
          />
        </div>
      </Step>

      {/* ------------------------------------------------------ 02 Category */}
      <Step n="02" title="What kind of kindness?">
        <div
          role="radiogroup"
          aria-label="Category"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {KINDNESS_CATEGORIES.map((cat) => {
            const on = category === cat;
            const color = CATEGORY_COLOR_VARS[cat];
            return (
              <button
                key={cat}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setCategory(cat)}
                className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200"
                style={{
                  borderColor: on ? color : "var(--color-line-soft)",
                  backgroundColor: on ? categoryTint(cat, 10) : "transparent",
                  color: on ? "var(--color-paper)" : "var(--color-paper-dim)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full transition-shadow"
                  style={{
                    background: color,
                    boxShadow: on ? `0 0 12px 2px ${color}` : "none",
                    opacity: on ? 1 : 0.5,
                  }}
                />
                <span aria-hidden="true">{CATEGORY_EMOJI[cat]}</span>
                <span>{CATEGORY_LABELS[cat]}</span>
              </button>
            );
          })}
        </div>
      </Step>

      {/* ------------------------------------------------------- 03 The story */}
      <Step n="03" title="Tell it plainly">
        <label
          htmlFor="message"
          className="mb-2 block font-mono text-[0.66rem] tracking-[0.16em] text-paper-faint uppercase"
        >
          The story
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => setTouchedMessage(true)}
          rows={6}
          maxLength={MESSAGE_MAX}
          required
          aria-invalid={touchedMessage && messageTooShort ? true : undefined}
          aria-describedby="message-help message-count"
          placeholder="What happened? Keep it short and specific. No names, no links — just the thing itself."
          className="field resize-y leading-relaxed"
        />

        <div className="mt-2 flex items-start justify-between gap-4">
          <p id="message-help" className="text-xs text-paper-faint">
            {touchedMessage && messageTooShort ? (
              <span className="text-danger">
                A little more — {MESSAGE_MIN - trimmedLength} more character
                {MESSAGE_MIN - trimmedLength === 1 ? "" : "s"} to go.
              </span>
            ) : (
              "Between 10 and 500 characters. Links are not allowed."
            )}
          </p>
          <p
            id="message-count"
            className={`shrink-0 font-mono text-[0.68rem] ${counterTone}`}
            aria-live="polite"
          >
            {message.length}/{MESSAGE_MAX}
          </p>
        </div>
      </Step>

      {/* ----------------------------------------------------------- Submit */}
      <div className="space-y-4">
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-glow w-full px-6 py-4 text-[1rem]"
        >
          {submitting ? "Dropping your pin…" : "Drop kindness pin"}
        </button>

        <p className="text-center text-xs leading-relaxed text-paper-faint">
          Posted anonymously. Nothing about you is stored — no account, no
          email, no IP kept beyond a short spam check.
        </p>
      </div>
    </form>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-baseline gap-4">
        <span className="font-mono text-[0.72rem] tracking-[0.2em] text-glow">{n}</span>
        <h2 className="font-display text-2xl text-paper">{title}</h2>
      </div>
      {children}
    </section>
  );
}
