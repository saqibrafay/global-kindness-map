import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Global Kindness Map",
    template: "%s · Global Kindness Map",
  },
  description:
    "A live, open-source world map of real acts of kindness — dropped by people everywhere. Add your own and pass it on.",
  openGraph: {
    title: "Global Kindness Map",
    description:
      "A live, open-source world map of real acts of kindness — dropped by people everywhere.",
    siteName: "Global Kindness Map",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Kindness Map",
    description:
      "A live, open-source world map of real acts of kindness — dropped by people everywhere.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="flex min-h-full flex-col bg-amber-50/40 text-gray-900">
        <header className="border-b border-amber-100 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight text-amber-800">
              🌍 Global Kindness Map
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:text-amber-700">
                Map
              </Link>
              <Link href="/about" className="hover:text-amber-700">
                About
              </Link>
              <Link
                href="/add"
                className="rounded-full bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700"
              >
                + Add kindness
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-amber-100 bg-white py-6 text-center text-xs text-gray-500">
          <p>
            Global Kindness Map is free & open source.{" "}
            <a
              href="https://github.com"
              className="underline underline-offset-2 hover:text-amber-700"
            >
              View / contribute on GitHub
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
