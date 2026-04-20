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
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Alerts & Notices</h2>
          <p className="text-slate-400">View and broadcast emergency flood alerts across the state.</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-500 gap-2">
          <Link href="/alerts/new">
            <Plus className="h-4 w-4" />
            Issue Alert
          </Link>
        </Button>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Bell className="h-4 w-4 text-red-500" />
            Active Broadcasts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 border border-dashed border-slate-700 rounded-lg bg-slate-950/50">
              <AlertCircle className="h-12 w-12 text-slate-700 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No active alerts</h3>
              <p className="text-sm max-w-sm">Use the "Issue Alert" button to broadcast critical safety information to the system.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-5 rounded-xl border transition-all ${
                    alert.isActive 
                      ? "bg-slate-800/40 border-slate-700" 
                      : "bg-slate-900/20 border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.severity === "CRITICAL" ? "destructive" : "secondary"} className="uppercase text-[10px]">
                          {alert.severity}
                        </Badge>
                        <h4 className="font-bold text-slate-100">{alert.title}</h4>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{alert.message}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {alert.targetLgas.map(lga => (
                          <span key={lga} className="text-[10px] bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/50">
                            {lga}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-medium text-slate-500 uppercase">Issued On</p>
                      <p className="text-xs text-slate-300">{new Date(alert.createdAt).toLocaleDateString()}</p>
                      {!alert.isActive && (
                        <Badge variant="outline" className="mt-2 text-[10px] text-slate-500 border-slate-700">INACTIVE</Badge>
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
