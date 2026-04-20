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
      style={{ height: "100%", width: "100%", borderRadius: "1.5rem" }}
      scrollWheelZoom={false}
      className="z-0 shadow-inner border border-border/50"
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
            radius={12 + (group.count * 2)} // Scaled by count
            pathOptions={{ 
              fillColor: SEVERITY_COLORS[group.highestSeverity] || "#3388ff",
              color: "white",
              weight: 3,
              fillOpacity: 0.8,
              className: "drop-shadow-md"
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[160px]">
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-2 border-b border-border pb-2">{group.lga} LGA</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Incidents</span>
                    <span className="text-xs font-black text-foreground">{group.count}</span>
                  </div>
                  <div className="flex justify-between items-center bg-destructive/5 px-2 py-1 rounded-lg border border-destructive/10">
                    <span className="text-[10px] font-black text-destructive uppercase tracking-tighter">Casualties</span>
                    <span className="text-xs font-black text-foreground">{group.totalCasualties}</span>
                  </div>
                  <div className="flex justify-between items-center bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">Displaced</span>
                    <span className="text-xs font-black text-foreground">{group.totalDisplaced}</span>
                  </div>
                  <p className="pt-2 text-[9px] uppercase font-black text-muted-foreground tracking-widest text-center italic">Highest: {group.highestSeverity}</p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
