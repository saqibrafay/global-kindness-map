import type { Metadata } from "next";
import AddKindnessForm from "@/components/AddKindnessForm";

export const metadata: Metadata = {
  title: "Add a kindness pin",
};

export default async function AddKindnessPage({
  searchParams,
}: {
  searchParams: Promise<{ chain?: string }>;
}) {
  const { chain } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-center text-2xl font-bold text-amber-900">
        Add a kindness pin
      </h1>
      <p className="mb-8 text-center text-gray-600">
        Share something real — a small good deed you did, received, or
        witnessed. It only takes a minute, and it might inspire someone
        across the world.
      </p>
      <AddKindnessForm chainParentId={chain} />
    </div>
  );
}
