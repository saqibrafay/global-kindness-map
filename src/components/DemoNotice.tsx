/**
 * Shown whenever the app is running on the built-in sample data, so nobody
 * mistakes seed stories for real submissions. It disappears on its own as
 * soon as Supabase credentials are present.
 */
export default function DemoNotice({ className = "" }: { className?: string }) {
  return (
    <div
      className={`panel flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-3.5 ${className}`}
      role="status"
    >
      <span className="font-mono text-[0.62rem] tracking-[0.18em] text-glow uppercase">
        Sample data
      </span>
      <p className="text-sm text-paper-dim">
        Supabase isn&rsquo;t connected, so these are example stories and
        anything you add lives in memory until the server restarts.
      </p>
      <code className="rounded-md border border-line-soft bg-ink px-2 py-1 font-mono text-[0.68rem] text-paper-faint">
        .env.local
      </code>
    </div>
  );
}
