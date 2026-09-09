import type { MetadataRoute } from "next";
import { listPins } from "@/lib/pins/store";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/add`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/atlas`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Cap the story entries so a busy map can't produce an unbounded sitemap.
  const pins = (await listPins()).slice(0, 500);

  return [
    ...staticRoutes,
    ...pins.map((pin) => ({
      url: `${siteUrl}/kindness/${pin.id}`,
      lastModified: new Date(pin.created_at),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
