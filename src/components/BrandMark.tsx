/**
 * The logo, inline, so it renders crisp at any size and needs no network
 * request. Kept in sync with src/app/icon.svg (the favicon) and
 * src/app/apple-icon.tsx (the touch icon).
 *
 * Two variants, because an app icon and a header lockup have opposite
 * needs:
 *
 * - "solid" carries its own dark night ground, so it survives on any
 *   background it gets dropped onto — a browser tab, an iOS home screen,
 *   someone's Slack. This is what icon.svg renders.
 * - "inline" drops the ground and draws the globe in currentColor, so it
 *   sits beside the wordmark as a drawing rather than stamping a dark coin
 *   onto the page. It follows the light/dark theme for free.
 *
 * Gradient ids are suffixed per instance — two marks on one page would
 * otherwise collide on the same ids and one would render unpainted.
 */
export default function BrandMark({
  className = "",
  id = "brand",
  title,
  variant = "solid",
}: {
  className?: string;
  id?: string;
  title?: string;
  variant?: "solid" | "inline";
}) {
  const solid = variant === "solid";
  const halo = `${id}-halo`;
  const lamp = `${id}-lamp`;
  const clip = `${id}-globe`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id={halo} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb347" stopOpacity="0.7" />
          <stop offset="45%" stopColor="#ffb347" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={lamp} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe3b4" />
          <stop offset="100%" stopColor="#ffb347" />
        </linearGradient>
        <clipPath id={clip}>
          <circle cx="32" cy="32" r="30" />
        </clipPath>
      </defs>

      {solid && <circle cx="32" cy="32" r="30" fill="#071018" />}

      <g
        clipPath={`url(#${clip})`}
        fill="none"
        stroke={solid ? "#1d3242" : "currentColor"}
        strokeOpacity={solid ? 1 : 0.4}
        strokeWidth={solid ? 1.4 : 2}
        strokeLinecap="round"
      >
        <line x1="2" y1="32" x2="62" y2="32" />
        <line x1="7" y1="17" x2="57" y2="17" />
        <line x1="7" y1="47" x2="57" y2="47" />
        <ellipse cx="32" cy="32" rx="11" ry="30" />
        <ellipse cx="32" cy="32" rx="23" ry="30" />
      </g>

      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke={solid ? "#24455a" : "currentColor"}
        strokeOpacity={solid ? 1 : 0.65}
        strokeWidth={solid ? 1.6 : 2.4}
      />

      <circle
        cx="22"
        cy="43"
        r="2.4"
        fill="var(--color-glow, #ffb347)"
        opacity="0.42"
      />

      <circle cx="41" cy="22" r="16" fill={`url(#${halo})`} />
      <circle cx="41" cy="22" r="6.6" fill={`url(#${lamp})`} />
    </svg>
  );
}
