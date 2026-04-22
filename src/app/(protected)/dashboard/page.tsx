import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, AlertCircle, Users, ShieldAlert } from "lucide-react";
import { db } from "@/db";
import { incidents, alerts } from "@/db/schema";
import { count, eq, and, sql } from "drizzle-orm";
import { getDashboardDataAction } from "@/app/actions/dashboard";
import { IncidentTrendChart } from "@/components/incident-trend-chart";
import { DashboardMap } from "@/components/dashboard-map";
import { getWeatherAction, getFloodRiskAction } from "@/app/actions/weather";
import { WeatherPanel } from "@/components/weather-panel";
import { Badge } from "@/components/ui/badge";
import { RiskAlertBanner } from "@/components/risk-alert-banner";

export default async function DashboardOverview() {
  const [incidentCount] = await db
    .select({ value: count() })
    .from(incidents);

  const [highSeverityAlerts] = await db
    .select({ value: count() })
    .from(alerts)
    .where(and(eq(alerts.isActive, true), eq(alerts.severity, "CRITICAL")));

  const personnelCount = await db
    .select({ value: count() })
    .from(sql`"user"`); 

  // Fetch all analytics data
  const [dashboardData, weatherData, riskData] = await Promise.all([
    getDashboardDataAction(),
    getWeatherAction(),
    getFloodRiskAction(),
  ]);

  const stats = dashboardData.success ? dashboardData.data : { trend: [], lgaSummary: [] };
  const weather = weatherData.success ? { current: weatherData.current!, forecast: weatherData.forecast! } : null;
  const risk = riskData.success ? riskData.assessment! : { score: 0, level: "LOW" as const, label: "Unknown", factors: [] };

  const RISK_TEXT_COLOR = {
    LOW: "text-blue-600",
    MODERATE: "text-yellow-600",
    HIGH: "text-orange-600",
    EXTREME: "text-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase">Operational Overview</h2>
          <p className="text-muted-foreground text-sm font-medium">Real-time situational awareness and predictive analytics for Sokoto State.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border border-border bg-card shadow-sm flex flex-col items-end`}>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Risk</span>
                <span className={`text-sm font-black uppercase ${RISK_TEXT_COLOR[risk.level]}`}>{risk.level}</span>
            </div>
        </div>
      </div>
      
      <RiskAlertBanner assessment={risk} />

      {/* Top Row: Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Incidents</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tighter">{incidentCount.value}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">System Recorded</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Critical Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tighter">{highSeverityAlerts.value}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">Unmitigated Threats</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Field Personnel</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tighter">{personnelCount[0].value}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">Authorized Agents</p>
          </CardContent>
        </Card>

        <Card className={`bg-card border-border shadow-sm border-r-4 ${risk.level === 'EXTREME' || risk.level === 'HIGH' ? 'border-r-destructive' : 'border-r-primary'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Predictive Risk</CardTitle>
            <ShieldAlert className={`h-4 w-4 ${RISK_TEXT_COLOR[risk.level]}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black tracking-tighter ${RISK_TEXT_COLOR[risk.level]}`}>{risk.score}/10</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">{risk.label}</p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Trends & Weather */}
      <div className="grid gap-4 lg:grid-cols-7">
         <div className="lg:col-span-4">
            <IncidentTrendChart data={stats.trend} />
         </div>
         <div className="lg:col-span-3">
            {weather && <WeatherPanel current={weather.current} forecast={weather.forecast} risk={risk} />}
         </div>
      </div>

      {/* Bottom Row: GIS Map */}
      <Card className="bg-card border-border shadow-md overflow-hidden min-h-[500px] flex flex-col">
        <CardHeader className="bg-muted/10 border-b border-border flex flex-row items-center justify-between py-5">
          <div>
            <CardTitle className="text-base font-bold text-foreground">State-wide Geospatial Distribution</CardTitle>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Real-time incident density and casualty assessment per LGA.</p>
          </div>
          <div className="flex gap-3">
            {['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(s => (
                <div key={s} className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default">
                    <div className={`w-2 h-2 rounded-full ${s === 'CRITICAL' ? 'bg-destructive' : s === 'HIGH' ? 'bg-orange-500' : s === 'MODERATE' ? 'bg-yellow-500' : 'bg-primary'}`} />
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{s}</span>
                </div>
            ))}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
