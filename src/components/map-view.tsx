"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LGA_COORDINATES } from "@/lib/constants";

interface IncidentGroup {
  lga: string;
  count: number;
  totalCasualties: number;
  totalDisplaced: number;
  highestSeverity: string;
}

interface MapViewProps {
  data: IncidentGroup[];
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444", // red-500
  HIGH: "#f97316",     // orange-500
  MODERATE: "#eab308", // yellow-500
  LOW: "#3b82f6",      // blue-500
};

export default function MapView({ data }: MapViewProps) {
  // Center of Sokoto State approximately
  const center: [number, number] = [13.066, 5.233];

  return (
    <MapContainer 
      center={center} 
      zoom={8} 
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      scrollWheelZoom={false}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data.map((group) => {
        const coords = LGA_COORDINATES[group.lga];
        if (!coords) return null;

        return (
          <CircleMarker
            key={group.lga}
            center={coords}
            radius={10 + (group.count * 2)} // Scaled by count
            pathOptions={{ 
              fillColor: SEVERITY_COLORS[group.highestSeverity] || "#3388ff",
              color: "white",
              weight: 2,
              fillOpacity: 0.7 
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-slate-900 mb-1 border-b pb-1">{group.lga} LGA</h3>
                <div className="space-y-1 text-xs">
                  <p><span className="font-semibold text-blue-600">Incidents:</span> {group.count}</p>
                  <p><span className="font-semibold text-red-600">Casualties:</span> {group.totalCasualties}</p>
                  <p><span className="font-semibold text-orange-600">Displaced:</span> {group.totalDisplaced}</p>
                  <p className="mt-2 text-[10px] uppercase font-black text-slate-500">Highest Alert: {group.highestSeverity}</p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
