"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LocationPickerClient from "./LocationPickerClient";
import {
  KINDNESS_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
  type KindnessCategory,
} from "@/types/pin";

export default function AddKindnessForm({
  chainParentId,
}: {
  chainParentId?: string;
}) {
  const router = useRouter();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [category, setCategory] = useState<KindnessCategory>("help_stranger");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!coords) {
      setError("Please click on the map to drop your pin's location.");
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
          location_label: locationLabel || undefined,
          category,
          message,
          chain_parent_id: chainParentId || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/kindness/${json.pin.id}?new=1`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          1. Click the map where it happened
        </label>
        <LocationPickerClient value={coords} onChange={setCoords} />
        {coords && (
          <p className="mt-1 text-xs text-gray-500">
            Pin at {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="location_label" className="mb-1 block text-sm font-medium text-gray-800">
          City / place (optional)
        </label>
        <input
          id="location_label"
          type="text"
          value={locationLabel}
          onChange={(e) => setLocationLabel(e.target.value)}
          maxLength={120}
          placeholder="e.g. Hyderabad, India"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-800">Category</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {KINDNESS_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                category === cat
                  ? "border-amber-600 bg-amber-100 text-amber-800"
                  : "border-gray-200 text-gray-600 hover:border-amber-300"
              }`}
            >
              {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-800">
          Tell the story (10–500 characters)
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          minLength={10}
          maxLength={500}
          required
          placeholder="What happened? Keep it short and specific — no names or links needed."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{message.length}/500</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {submitting ? "Dropping your pin…" : "Drop kindness pin"}
      </button>
    </form>
  );
}
