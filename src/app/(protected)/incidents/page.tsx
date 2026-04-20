import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/db";
import { incidents } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function IncidentsRegistry() {
  const allIncidents = await db.query.incidents.findMany({
    orderBy: [desc(incidents.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Incident Registry</h2>
          <p className="text-slate-400">Manage and view flood incidents across different LGAs.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/incidents/new">
            <Plus className="h-4 w-4" />
            Report Incident
          </Link>
        </Button>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-400" />
            Incidents Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 border border-dashed border-slate-700 rounded-lg bg-slate-950/50">
              <Database className="h-12 w-12 text-slate-700 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No incidents yet</h3>
              <p className="text-sm max-w-sm">Use the "Report Incident" button to start logging flood events across Sokoto State.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allIncidents.map((incident) => (
                <Link 
                  key={incident.id} 
                  href={`/incidents/${incident.id}`}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="font-semibold text-slate-100 group-hover:text-teal-400 transition-colors">{incident.title}</h4>
                    <p className="text-sm text-slate-400">{incident.lga} - {incident.locationDetails}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      incident.severity === "CRITICAL" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                      incident.severity === "HIGH" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                      incident.severity === "MODERATE" ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" :
                      "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}>
                      {incident.severity}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
