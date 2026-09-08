"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { KindnessPin } from "@/types/pin";
import { CATEGORY_EMOJI, CATEGORY_LABELS } from "@/types/pin";

// Leaflet's default marker icons reference image files in a way that
// breaks under bundlers like webpack/Next.js. Rebuild the default icon
// using the copies Leaflet ships in its package.
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface WorldMapProps {
  pins: KindnessPin[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export default function WorldMap({
  pins,
  height = "600px",
  center = [20, 0],
  zoom = 2,
}: WorldMapProps) {
  return (
    <div style={{ height, width: "100%" }} className="overflow-hidden rounded-2xl border border-amber-200">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((pin) => (
          <Marker key={pin.id} position={[pin.latitude, pin.longitude]} icon={defaultIcon}>
            <Popup>
              <div className="max-w-[220px] space-y-1">
                <p className="font-medium">
                  {CATEGORY_EMOJI[pin.category]} {CATEGORY_LABELS[pin.category]}
                </p>
                <p className="text-sm text-gray-700 line-clamp-4">{pin.message}</p>
                {pin.location_label && (
                  <p className="text-xs text-gray-500">{pin.location_label}</p>
                )}
                <Link
                  href={`/kindness/${pin.id}`}
                  className="text-xs font-medium text-amber-700 underline underline-offset-2"
                >
                  View & share this story →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
