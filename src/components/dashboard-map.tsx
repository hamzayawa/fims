"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Load MapView dynamically with no SSR as Leaflet requires the window object
const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted/20 rounded-[2rem] animate-pulse flex items-center justify-center border border-border/50 shadow-inner">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic opacity-60">Initializing Geospatial Analysis...</p>
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
