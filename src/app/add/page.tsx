import type { Metadata } from "next";
import Link from "next/link";
import AddKindnessForm from "@/components/AddKindnessForm";
import DemoNotice from "@/components/DemoNotice";
import { isDemoMode } from "@/lib/pins/store";

export const metadata: Metadata = {
  title: "Add a kindness pin",
  description:
    "Drop a pin on the Global Kindness Map — a real act of kindness you did, received, or watched happen. No account needed.",
};

export default async function AddKindnessPage({
  searchParams,
}: {
  searchParams: Promise<{ chain?: string }>;
}) {
  const { chain } = await searchParams;
  const demo = isDemoMode();

  return (
    <div className="mx-auto max-w-3xl px-5 pt-14 pb-4 sm:px-8 sm:pt-20">
      <header className="mb-12">
        <p className="eyebrow">Add to the map</p>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,5.5vw,3.4rem)] leading-[1.02] text-balance text-paper">
          One more light, from wherever you are
        </h1>
        <p className="mt-5 max-w-xl leading-relaxed text-paper-dim">
          Something small and real: a deed you did, one someone did for you,
          or one you only watched happen. It stays on the map for whoever
          reads it next.
        </p>
      </header>

      {demo && <DemoNotice className="mb-10" />}

      <AddKindnessForm chainParentId={chain} />

      <p className="mt-14 text-center">
        <Link
          href="/"
          className="font-mono text-[0.7rem] tracking-[0.16em] text-paper-faint uppercase underline-offset-4 hover:text-glow hover:underline"
        >
          ← Back to the map
        </Link>
      </p>
    </div>
  );
}
