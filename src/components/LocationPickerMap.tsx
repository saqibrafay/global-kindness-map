"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { KindnessCategory } from "@/types/pin";
import {
  createFocusIcon,
  TILE_URL,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
  prefersReducedMotion,
} from "./map/markerIcon";

export interface Coords {
  lat: number;
  lng: number;
}

interface LocationPickerMapProps {
  value: Coords | null;
  onChange: (coords: Coords) => void;
  category: KindnessCategory;
}

function ClickHandler({ onChange }: { onChange: (coords: Coords) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/** Recentre when the value is set from outside the map (e.g. geolocation). */
function FollowValue({ value }: { value: Coords | null }) {
  const map = useMap();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!value) return;
    const key = `${value.lat.toFixed(5)},${value.lng.toFixed(5)}`;
    if (key === last.current) return;
    last.current = key;
    if (map.getZoom() >= 6) return;
    if (prefersReducedMotion()) {
      map.setView([value.lat, value.lng], 11, { animate: false });
    } else {
      map.flyTo([value.lat, value.lng], 11, { duration: 0.9 });
    }
  }, [value, map]);

  return null;
}

function Resizer() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function LocationPickerMap({
  value,
  onChange,
  category,
}: LocationPickerMapProps) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  function useMyLocation() {
    setGeoError(null);

    if (!("geolocation" in navigator)) {
      setGeoError("This browser can't share a location.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocating(false);
        setGeoError("Couldn't get your location — click the map instead.");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative h-[340px] w-full overflow-hidden rounded-2xl border border-line-soft sm:h-[400px]">
        <MapContainer
          center={value ? [value.lat, value.lng] : [24, 12]}
          zoom={value ? 11 : 2}
          minZoom={2}
          scrollWheelZoom={false}
          worldCopyJump
          style={{ height: "100%", width: "100%", background: "#060d13" }}
        >
          <TileLayer
            attribution={TILE_ATTRIBUTION}
            url={TILE_URL}
            maxZoom={TILE_MAX_ZOOM}
          />
          <ClickHandler onChange={onChange} />
          <FollowValue value={value} />
          <Resizer />
          {value && (
            <Marker position={[value.lat, value.lng]} icon={createFocusIcon(category)} />
          )}
        </MapContainer>

        {!value && (
          <p className="pointer-events-none absolute inset-x-0 bottom-0 z-[400] bg-gradient-to-t from-ink/90 to-transparent px-4 pt-10 pb-4 text-center font-mono text-[0.66rem] tracking-[0.16em] text-paper-dim uppercase">
            Click anywhere to drop your pin
          </p>
        )}

        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="btn-ghost absolute top-3 right-3 z-[400] bg-ink/95 px-3.5 py-2 font-mono text-[0.64rem] tracking-[0.12em] uppercase disabled:opacity-60"
        >
          {locating ? "Locating…" : "◎ Use my location"}
        </button>
      </div>

      {geoError && (
        <p role="status" className="text-xs text-danger">
          {geoError}
        </p>
      )}
    </div>
  );
}
