/**
 * Placeholder ad slot.
 *
 * Once your site is approved for Google AdSense:
 * 1. Add your AdSense client id (ca-pub-XXXXXXXXXXXXXXXX) to
 *    NEXT_PUBLIC_ADSENSE_CLIENT_ID in your env vars.
 * 2. The <script> tag for AdSense is already loaded site-wide from
 *    src/app/layout.tsx when that env var is set.
 * 3. Replace the placeholder <div> below with your real <ins class="adsbygoogle">
 *    unit and call (adsbygoogle = window.adsbygoogle || []).push({}) — see
 *    https://support.google.com/adsense/answer/9274634
 *
 * Until then, this renders nothing visually intrusive so the open-source
 * project runs cleanly without ads configured.
 */
export default function AdSlot({ label = "Ad" }: { label?: string }) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!adsenseClientId) {
    return (
      <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs text-gray-400">
        {label} placeholder — set NEXT_PUBLIC_ADSENSE_CLIENT_ID to enable ads
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle block"
      style={{ display: "block" }}
      data-ad-client={adsenseClientId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
