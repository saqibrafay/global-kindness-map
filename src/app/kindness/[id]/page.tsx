import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPin, listPins } from "@/lib/pins/store";
import { CATEGORY_COLOR_VARS, CATEGORY_EMOJI, CATEGORY_LABELS } from "@/types/pin";
import { formatCoords, formatDate, timeAgo } from "@/lib/time";
import ShareButtons from "@/components/ShareButtons";
import MapClient from "@/components/MapClient";
import StoryCard from "@/components/StoryCard";
import AdSlot from "@/components/AdSlot";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pin = await getPin(id);

  if (!pin) {
    return { title: "Story not found" };
  }

  const title = `${CATEGORY_EMOJI[pin.category]} ${CATEGORY_LABELS[pin.category]}${
    pin.location_label ? ` in ${pin.location_label}` : ""
  }`;
  const description = pin.message.slice(0, 160);

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { title, description },
  };
}

export default async function KindnessPinPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const pin = await getPin(id);

  if (!pin) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pinUrl = `${siteUrl}/kindness/${pin.id}`;
  const color = CATEGORY_COLOR_VARS[pin.category];

  const others = (await listPins()).filter((p) => p.id !== pin.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10 pb-4 sm:px-8 sm:pt-14">
      {isNew === "1" && (
        <div
          role="status"
          className="panel mb-8 flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-4"
          style={{ borderColor: "color-mix(in oklab, var(--color-glow) 40%, transparent)" }}
        >
          <span className="font-mono text-[0.62rem] tracking-[0.18em] text-glow uppercase">
            ✦ It&rsquo;s on the map
          </span>
          <p className="text-sm text-paper-dim">
            Your light is live. Send this page to one person and it keeps going.
          </p>
        </div>
      )}

      <article>
        {/* Masthead line */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span
            className="inline-flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.18em] uppercase"
            style={{ color }}
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ background: color, boxShadow: `0 0 12px 2px ${color}` }}
            />
            {CATEGORY_EMOJI[pin.category]} {CATEGORY_LABELS[pin.category]}
          </span>
          <time
            dateTime={pin.created_at}
            suppressHydrationWarning
            className="font-mono text-[0.68rem] tracking-[0.14em] text-paper-faint uppercase"
          >
            {formatDate(pin.created_at)} · {timeAgo(pin.created_at)}
          </time>
        </div>

        {/* The story itself */}
        <blockquote className="mt-8">
          <p className="font-display text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.28] text-balance text-paper">
            <span aria-hidden="true" style={{ color }}>
              &ldquo;
            </span>
            {pin.message}
            <span aria-hidden="true" style={{ color }}>
              &rdquo;
            </span>
          </p>
        </blockquote>

        <div className="hairline my-10" />

        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          {/* Where */}
          <div>
            <p className="eyebrow">Where</p>
            <p className="mt-3 font-display text-2xl text-paper">
              {pin.location_label || "Somewhere on Earth"}
            </p>
            <p className="mt-1.5 font-mono text-[0.72rem] tracking-[0.1em] text-paper-faint">
              {formatCoords(pin.latitude, pin.longitude)}
            </p>

            <div className="mt-5 h-[240px] overflow-hidden rounded-2xl border border-line-soft">
              <MapClient
                pins={[pin]}
                center={[pin.latitude, pin.longitude]}
                zoom={9}
              />
            </div>

            {pin.chain_parent_id && (
              <p className="mt-4">
                <Link
                  href={`/kindness/${pin.chain_parent_id}`}
                  className="font-mono text-[0.68rem] tracking-[0.14em] text-paper-faint uppercase underline-offset-4 hover:text-glow hover:underline"
                >
                  ⇠ Passed on from another story
                </Link>
              </p>
            )}
          </div>

          {/* Act on it */}
          <div>
            <p className="eyebrow">Pass it on</p>
            <h2 className="mt-3 font-display text-2xl leading-snug text-balance text-paper">
              Send this to one person, or add the kindness you saw today
            </h2>

            <div className="mt-6">
              <ShareButtons
                url={pinUrl}
                text="Someone did something kind — see it (and add your own) on the Global Kindness Map"
              />
            </div>

            <Link
              href={`/add?chain=${pin.id}`}
              className="btn-glow mt-7 w-full px-6 py-4 text-[0.95rem] sm:w-auto"
            >
              Add your own pin →
            </Link>

            <div className="mt-8">
              <AdSlot label="Story page ad" />
            </div>
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section aria-labelledby="more-heading" className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <h2 id="more-heading" className="font-display text-2xl text-paper">
              Elsewhere on the map
            </h2>
            <Link
              href="/"
              className="font-mono text-[0.68rem] tracking-[0.14em] text-paper-faint uppercase underline-offset-4 hover:text-glow hover:underline"
            >
              See all →
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {others.map((other) => (
              <StoryCard key={other.id} pin={other} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-16 text-center">
        <Link
          href="/"
          className="font-mono text-[0.7rem] tracking-[0.16em] text-paper-faint uppercase underline-offset-4 hover:text-glow hover:underline"
        >
          ← Back to the full map
        </Link>
      </p>
    </div>
  );
}
