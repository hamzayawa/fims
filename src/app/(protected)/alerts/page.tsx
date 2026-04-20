import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/db";
import { alerts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";

export default async function AlertsAndNotices() {
  const allAlerts = await db.query.alerts.findMany({
    orderBy: [desc(alerts.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase">Alerts & Notices</h2>
          <p className="text-muted-foreground text-sm font-medium">View and broadcast emergency flood alerts across the state.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all gap-2">
          <Link href="/alerts/new">
            <Plus className="h-5 w-5" />
            Issue Alert
          </Link>
        </Button>
      </div>

      <Card className="bg-card border-border shadow-md overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/5 py-5">
          <CardTitle className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest pl-1">
            <Bell className="h-4 w-4 text-destructive" />
            Active Regional Broadcasts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {allAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-muted/20">
              <AlertCircle className="h-14 w-14 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-black text-foreground mb-2 uppercase">No active alerts</h3>
              <p className="text-sm max-w-sm font-medium">Use the "Issue Alert" button to broadcast critical safety information to the system.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-6 rounded-2xl border transition-all ${
                    alert.isActive 
                      ? "bg-background border-border shadow-sm hover:shadow-md" 
                      : "bg-muted/40 border-border/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant={alert.severity === "CRITICAL" ? "destructive" : "secondary"} className="uppercase text-[9px] font-black px-2 pb-0.5 rounded-md shadow-sm">
                          {alert.severity}
                        </Badge>
                        <h4 className="text-lg font-black text-foreground tracking-tight">{alert.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed">{alert.message}</p>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {alert.targetLgas.map(lga => (
                          <span key={lga} className="text-[10px] bg-muted text-muted-foreground px-2.5 py-1 rounded-lg border border-border font-bold uppercase tracking-wider">
                            {lga}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0 py-1">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Broadcast Date</p>
                      <p className="text-sm text-foreground font-black tracking-tighter">{new Date(alert.createdAt).toLocaleDateString()}</p>
                      {!alert.isActive && (
                        <Badge variant="outline" className="mt-3 text-[10px] text-muted-foreground font-black border-border uppercase">INACTIVE</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
