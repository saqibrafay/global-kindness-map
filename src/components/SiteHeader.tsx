"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import BrandMark from "./BrandMark";

const NAV = [
  { href: "/", label: "Map" },
  { href: "/atlas", label: "Atlas" },
  { href: "/about", label: "About" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [lifted, setLifted] = useState(false);

  // The header sits over a full-bleed map, so it only grows a background
  // once you've scrolled past the top of it.
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[500] transition-colors duration-300 ${
        lifted
          ? "border-b border-line-soft bg-ink/95"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-8">
        <Link
          href="/"
          className="group flex items-baseline gap-2.5"
          aria-label="Global Kindness Map — home"
        >
          <BrandMark
            id="header-mark"
            variant="inline"
            className="size-[1.6rem] shrink-0 self-center text-paper-faint transition-transform duration-300 group-hover:scale-110"
          />
          {/* The full name doesn't fit beside the nav on a narrow phone —
              it used to wrap onto three lines. Shorten it instead. */}
          <span className="font-display leading-none font-medium tracking-tight whitespace-nowrap text-paper text-[0.95rem] sm:text-[1.06rem]">
            <span className="sm:hidden">Kindness Map</span>
            <span className="hidden sm:inline">Global Kindness Map</span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-2" aria-label="Main">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-2 py-2 font-mono text-[0.62rem] tracking-[0.12em] uppercase transition-colors sm:px-3 sm:text-[0.7rem] sm:tracking-[0.18em] ${
                  active
                    ? "text-glow"
                    : "text-paper-faint hover:text-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle />

          <Link
            href="/add"
            className="btn-glow ml-0.5 px-3 py-2.5 text-[0.78rem] sm:ml-1 sm:px-5 sm:text-[0.82rem]"
          >
            <span aria-hidden="true">✦</span>
            <span className="hidden sm:inline">Add kindness</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
