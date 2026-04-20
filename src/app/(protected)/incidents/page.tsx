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
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase">Incident Registry</h2>
          <p className="text-muted-foreground text-sm font-medium">Manage and view flood incidents across different LGAs.</p>
        </div>
        <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all">
          <Link href="/incidents/new">
            <Plus className="h-5 w-5" />
            Report Incident
          </Link>
        </Button>
      </div>

      <Card className="bg-card border-border shadow-md">
        <CardHeader className="border-b border-border bg-muted/5 py-5">
          <CardTitle className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest pl-1">
            <Database className="h-4 w-4 text-primary" />
            Incidents Management Database
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {allIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-muted/20">
              <Database className="h-14 w-14 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-black text-foreground mb-2 uppercase">No incidents yet</h3>
              <p className="text-sm max-w-sm font-medium">Use the "Report Incident" button to start logging flood events across Sokoto State.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allIncidents.map((incident) => (
                <Link 
                  key={incident.id} 
                  href={`/incidents/${incident.id}`}
                  className="p-5 rounded-2xl bg-background border border-border hover:border-primary/50 hover:bg-primary/[0.02] shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{incident.title}</h4>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{incident.lga} <span className="mx-1 text-border">•</span> {incident.locationDetails}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                      incident.severity === "CRITICAL" ? "bg-red-50 text-red-600 border-red-200" :
                      incident.severity === "HIGH" ? "bg-orange-50 text-orange-600 border-orange-200" :
                      incident.severity === "MODERATE" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                      "bg-blue-50 text-blue-600 border-blue-200"
                    }`}>
                      {incident.severity}
                    </span>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Reported</p>
                        <p className="text-xs text-muted-foreground font-bold italic">
                        {new Date(incident.createdAt).toLocaleDateString()}
                        </p>
                    </div>
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
