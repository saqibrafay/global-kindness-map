"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { KindnessPin } from "@/types/pin";
import { CATEGORY_EMOJI, CATEGORY_LABELS, CATEGORY_COLOR_VARS } from "@/types/pin";
import {
  createPinIcon,
  isFresh,
  TILE_URL,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
  prefersReducedMotion,
} from "./map/markerIcon";

interface WorldMapProps {
  pins: KindnessPin[];
  /** Pin to fly to — set when a story card in the rail is selected. */
  focusPin?: KindnessPin | null;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

/**
 * A full-bleed map that swallows the page scroll is a trap, so the wheel
 * only zooms once the map has been clicked or focused, and gives the page
 * back as soon as the pointer leaves.
 */
function ScrollZoomOnIntent() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const enable = () => map.scrollWheelZoom.enable();
    const disable = () => map.scrollWheelZoom.disable();

    container.addEventListener("click", enable);
    container.addEventListener("focusin", enable);
    container.addEventListener("mouseleave", disable);
    container.addEventListener("focusout", disable);

    return () => {
      container.removeEventListener("click", enable);
      container.removeEventListener("focusin", enable);
      container.removeEventListener("mouseleave", disable);
      container.removeEventListener("focusout", disable);
    };
  }, [map]);

  return null;
}

function FlyToFocus({ focusPin }: { focusPin?: KindnessPin | null }) {
  const map = useMap();
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    if (!focusPin || focusPin.id === lastId.current) return;
    lastId.current = focusPin.id;
    const target: [number, number] = [focusPin.latitude, focusPin.longitude];
    const zoom = Math.max(map.getZoom(), 6);

    // flyTo is a rAF animation; jump straight there for anyone who has
    // asked for reduced motion.
    if (prefersReducedMotion()) {
      map.setView(target, zoom, { animate: false });
    } else {
      map.flyTo(target, zoom, { duration: 1.1 });
    }
  }, [focusPin, map]);

  return null;
}

/** Keeps Leaflet's internal size in sync when its container is resized. */
function ResizeWatcher() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

export default function WorldMap({
  pins,
  focusPin,
  height = "100%",
  center = [24, 12],
  zoom = 2,
}: WorldMapProps) {
  return (
    <div style={{ height, width: "100%" }} className="relative">
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={2}
        maxZoom={18}
        scrollWheelZoom={false}
        worldCopyJump
        zoomControl
        style={{ height: "100%", width: "100%", background: "#060d13" }}
      >
        <TileLayer
          attribution={TILE_ATTRIBUTION}
          url={TILE_URL}
          maxZoom={TILE_MAX_ZOOM}
        />
        <ScrollZoomOnIntent />
        <ResizeWatcher />
        <FlyToFocus focusPin={focusPin} />

        {pins.map((pin, i) => (
          <Marker
            key={pin.id}
            position={[pin.latitude, pin.longitude]}
            icon={createPinIcon(pin.category, {
              fresh: isFresh(pin.created_at),
              delaySeconds: (i % 7) * 0.4,
            })}
            title={CATEGORY_LABELS[pin.category]}
          >
            <Popup>
              <div className="w-[236px] space-y-2">
                <p
                  className="font-mono text-[0.62rem] tracking-[0.18em] uppercase"
                  style={{ color: CATEGORY_COLOR_VARS[pin.category] }}
                >
                  {CATEGORY_EMOJI[pin.category]} {CATEGORY_LABELS[pin.category]}
                </p>
                <p className="line-clamp-4 text-[0.86rem] leading-relaxed text-paper">
                  {pin.message}
                </p>
                {pin.location_label && (
                  <p className="font-mono text-[0.65rem] text-paper-faint">
                    {pin.location_label}
                  </p>
                )}
                <Link
                  href={`/kindness/${pin.id}`}
                  className="inline-block font-mono text-[0.66rem] tracking-[0.14em] text-glow uppercase underline-offset-4 hover:underline"
                >
                  Read &amp; pass on →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
