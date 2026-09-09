import type { Metadata, Viewport } from "next";
import { Fraunces, Karla, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Global Kindness Map — the world at night, lit by small acts",
    template: "%s · Global Kindness Map",
  },
  description:
    "A live, open-source world map of real acts of kindness — dropped by people everywhere. Add your own and pass it on.",
  keywords: [
    "kindness",
    "world map",
    "acts of kindness",
    "open source",
    "community",
  ],
  openGraph: {
    title: "Global Kindness Map",
    description:
      "A live, open-source world map of real acts of kindness — dropped by people everywhere.",
    siteName: "Global Kindness Map",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Kindness Map",
    description:
      "A live, open-source world map of real acts of kindness — dropped by people everywhere.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f2e9" },
    { media: "(prefers-color-scheme: dark)", color: "#05090c" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${karla.variable} ${plexMono.variable}`}
      // The inline theme script below stamps data-theme onto <html> before
      // React hydrates, which React would otherwise report as an
      // unpatchable attribute mismatch. This is the one element where that
      // divergence is intentional.
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col bg-ink text-paper">
        {/*
          Applies a saved theme before anything paints, so switching to day
          mode doesn't flash the night palette on every navigation.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />

        <a
          href="#main"
          className="sr-only rounded-full px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1000] focus:bg-glow focus:font-semibold focus:text-ink"
        >
          Skip to content
        </a>

        <SiteHeader />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter />

        {/*
          AdSense is injected via next/script rather than a hand-written
          <head>, which previously produced stray whitespace text nodes in
          <head> and broke hydration for the whole document.
        */}
        {adsenseClientId && (
          <Script
            id="adsbygoogle-init"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
