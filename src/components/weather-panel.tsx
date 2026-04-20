"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Thermometer, 
  Droplets,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";
import { WeatherData, ForecastDay, RiskAssessment } from "@/app/actions/weather";

const CONDITION_ICONS = {
  Sunny: <Sun className="w-8 h-8 text-yellow-500" />,
  Cloudy: <Cloud className="w-8 h-8 text-muted-foreground/60" />,
  Rain: <CloudRain className="w-8 h-8 text-blue-500" />,
  Storm: <CloudLightning className="w-8 h-8 text-purple-500" />,
};

const RISK_COLORS = {
  LOW: "text-emerald-700 bg-emerald-50 border-emerald-200",
  MODERATE: "text-yellow-700 bg-yellow-50 border-yellow-200",
  HIGH: "text-orange-700 bg-orange-50 border-orange-200",
  EXTREME: "text-red-700 bg-red-50 border-red-200",
};

interface WeatherPanelProps {
  current: WeatherData;
  forecast: ForecastDay[];
  risk: RiskAssessment;
}

export function WeatherPanel({ current, forecast, risk }: WeatherPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 h-full">
      {/* Risk Gauge Card */}
      <Card className={`border-l-4 transition-all duration-500 ${RISK_COLORS[risk.level].split(' ').slice(2).join(' ')} bg-card shadow-lg rounded-2xl`}>
        <CardContent className="pt-7 px-6 pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 px-0.5">Hydrological Risk Level</p>
              <h3 className={`text-4xl font-black tracking-tighter ${RISK_COLORS[risk.level].split(' ')[0]}`}>{risk.level}</h3>
              <p className="text-sm text-foreground/90 font-black tracking-tight">{risk.label}</p>
            </div>
            <div className={`p-3 rounded-2xl shadow-sm ${RISK_COLORS[risk.level].split(' ').slice(0, 2).join(' ')} border border-current/10`}>
              <ShieldAlert className="w-7 h-7" />
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-2">
            {risk.factors.map((factor, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted/40 px-3 py-2 rounded-xl border border-border/10 shadow-sm">
                <div className={`w-1.5 h-1.5 rounded-full ${RISK_COLORS[risk.level].split(' ')[0]} shadow-sm`} />
                {factor}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Info */}
      <Card className="bg-card border-border shadow-xl flex-1 overflow-hidden relative rounded-2xl group">
        <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-125 duration-700">
            {CONDITION_ICONS[current.condition]}
        </div>
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">MET-INTEL (Sokoto State)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-muted rounded-[2rem] border-2 border-border shadow-inner group-hover:bg-primary/5 transition-colors duration-500">
                {CONDITION_ICONS[current.condition]}
              </div>
              <div>
                <p className="text-5xl font-black text-foreground tracking-tighter leading-none">{current.temp}°</p>
                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-2">{current.condition}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
                    <Droplets className="w-3.5 h-3.5" />
                    {current.humidity}% HUMID
                </span>
                <span className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 shadow-sm">
                    <CloudRain className="w-3.5 h-3.5" />
                    {current.rainfall}mm RAIN
                </span>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-5 px-1 opacity-70 italic">5-Day Meteorological Outlook</p>
            <div className="grid grid-cols-5 gap-3">
              {forecast.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-muted hover:shadow-inner transition-all duration-300">
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">{day.date}</span>
                  <div className="scale-90 transition-transform hover:scale-110 duration-300">
                    {CONDITION_ICONS[day.condition]}
                  </div>
                  <span className="text-sm font-black text-foreground tracking-tighter">{day.temp}°C</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
