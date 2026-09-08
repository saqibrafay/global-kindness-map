import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CATEGORY_EMOJI, CATEGORY_LABELS, type KindnessPin } from "@/types/pin";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";

interface Props {
  params: Promise<{ id: string }>;
}

async function getPin(id: string): Promise<KindnessPin | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("kindness_pins")
      .select("*")
      .eq("id", id)
      .eq("approved", true)
      .single();

    if (error || !data) return null;
    return data as KindnessPin;
  } catch (err) {
    // Supabase env vars not configured — treat as "not found" rather than crashing.
    console.error(err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pin = await getPin(id);

  if (!pin) {
    return { title: "Kindness pin not found" };
  }

  const title = `${CATEGORY_EMOJI[pin.category]} ${CATEGORY_LABELS[pin.category]}`;
  const description = pin.message.slice(0, 160);

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function KindnessPinPage({ params }: Props) {
  const { id } = await params;
  const pin = await getPin(id);

  if (!pin) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pinUrl = `${siteUrl}/kindness/${pin.id}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-amber-700">
          {CATEGORY_EMOJI[pin.category]} {CATEGORY_LABELS[pin.category]}
        </p>
        <blockquote className="mt-3 text-xl leading-relaxed text-gray-800">
          “{pin.message}”
        </blockquote>
        {pin.location_label && (
          <p className="mt-4 text-sm text-gray-500">📍 {pin.location_label}</p>
        )}

        <div className="mt-8 space-y-3">
          <p className="text-sm font-medium text-gray-700">Share this story:</p>
          <ShareButtons
            url={pinUrl}
            text="Someone did something kind — see it (and add your own) on the Global Kindness Map"
          />
        </div>

        <Link
          href={`/add?chain=${pin.id}`}
          className="mt-6 inline-block rounded-full bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
        >
          Pass it on — add your own kindness pin →
        </Link>
      </div>

      <div className="mt-6">
        <AdSlot label="Story page ad" />
      </div>

      <p className="mt-8 text-center">
        <Link href="/" className="text-sm text-amber-700 underline underline-offset-2">
          ← Back to the full map
        </Link>
      </p>
    </div>
  );
}
