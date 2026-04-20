"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Load MapView dynamically with no SSR as Leaflet requires the window object
const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-800/20 rounded-xl animate-pulse flex items-center justify-center border border-slate-700/50">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full border-4 border-teal-500/30 border-t-teal-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Initializing Geospatial View...</p>
      </div>
    </div>
  ),
});

interface IncidentGroup {
  lga: string;
  count: number;
  totalCasualties: number;
  totalDisplaced: number;
  highestSeverity: string;
}

interface DashboardMapProps {
  data: IncidentGroup[];
}

export function DashboardMap({ data }: DashboardMapProps) {
  return (
    <div className="w-full h-full min-h-[400px]">
      <MapView data={data} />
    </div>
  );
}
