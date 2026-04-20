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
    LOW: "text-teal-400",
    MODERATE: "text-yellow-400",
    HIGH: "text-orange-400",
    EXTREME: "text-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Operational Overview</h2>
          <p className="text-slate-400 text-sm">Real-time situational awareness and predictive analytics for Sokoto State.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col items-end`}>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Risk</span>
                <span className={`text-sm font-black uppercase ${RISK_TEXT_COLOR[risk.level]}`}>{risk.level}</span>
            </div>
        </div>
      </div>
      
      {/* Top Row: Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Incidents</CardTitle>
            <Database className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{incidentCount.value}</div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">System Recorded</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Critical Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{highSeverityAlerts.value}</div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">Unmitigated Threats</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Field Personnel</CardTitle>
            <Users className="h-4 w-4 text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{personnelCount[0].value}</div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">Authorized Agents</p>
          </CardContent>
        </Card>

        <Card className={`bg-slate-900/50 border-slate-800 border-r-4 ${risk.level === 'EXTREME' || risk.level === 'HIGH' ? 'border-r-red-500' : 'border-r-teal-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Predictive Risk</CardTitle>
            <ShieldAlert className={`h-4 w-4 ${RISK_TEXT_COLOR[risk.level]}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${RISK_TEXT_COLOR[risk.level]}`}>{risk.score}/10</div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">{risk.label}</p>
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
      <Card className="bg-slate-900/50 border-slate-800 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        <CardHeader className="bg-slate-950/20 border-b border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-200">State-wide Geospatial Distribution</CardTitle>
            <p className="text-xs text-slate-500 mt-1">Real-time incident density and casualty assessment per LGA.</p>
          </div>
          <div className="flex gap-2">
            {['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(s => (
                <div key={s} className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                    <div className={`w-2 h-2 rounded-full ${s === 'CRITICAL' ? 'bg-red-500' : s === 'HIGH' ? 'bg-orange-500' : s === 'MODERATE' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                    <span className="text-[10px] text-slate-400 font-bold">{s}</span>
                </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 relative min-h-[450px]">
          <DashboardMap data={stats.lgaSummary} />
        </CardContent>
      </Card>
    </div>
  );
}
