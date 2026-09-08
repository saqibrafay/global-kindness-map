import { getSupabaseServerClient } from "@/lib/supabase/server";
import MapClient from "@/components/MapClient";
import KindnessFeed from "@/components/KindnessFeed";
import AdSlot from "@/components/AdSlot";
import type { KindnessPin } from "@/types/pin";

export const revalidate = 30; // refresh the map/feed at most every 30s

async function getPins(): Promise<KindnessPin[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("kindness_pins")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Failed to load pins:", error);
      return [];
    }
    return (data ?? []) as KindnessPin[];
  } catch (err) {
    // Supabase env vars not configured yet — show an empty map instead of crashing,
    // so the app is still explorable right after `git clone`.
    console.error(err);
    return [];
  }
}

export default async function HomePage() {
  const pins = await getPins();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-amber-900 sm:text-4xl">
          A living map of kindness, from everywhere
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Every pin is a real act of kindness someone did or witnessed —
          dropped by people around the world. Add yours, then share it and
          keep the chain going.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MapClient pins={pins} />
        </div>
        <div className="flex flex-col gap-4">
          <KindnessFeed pins={pins} />
          <AdSlot label="Sidebar ad" />
        </div>
      </div>
    </div>
  );
}
