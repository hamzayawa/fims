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
  Cloudy: <Cloud className="w-8 h-8 text-slate-400" />,
  Rain: <CloudRain className="w-8 h-8 text-blue-500" />,
  Storm: <CloudLightning className="w-8 h-8 text-purple-500" />,
};

const RISK_COLORS = {
  LOW: "text-teal-500 bg-teal-500/10 border-teal-500/20",
  MODERATE: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  HIGH: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  EXTREME: "text-red-500 bg-red-500/10 border-red-500/20",
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
      <Card className={`border-l-4 transition-all duration-500 ${RISK_COLORS[risk.level].split(' ').slice(2).join(' ')} bg-slate-900/40`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Risk Level</p>
              <h3 className={`text-2xl font-black ${RISK_COLORS[risk.level].split(' ')[0]}`}>{risk.level}</h3>
              <p className="text-sm text-slate-300 font-medium">{risk.label}</p>
            </div>
            <div className={`p-2 rounded-lg ${RISK_COLORS[risk.level].split(' ').slice(0, 2).join(' ')}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            {risk.factors.map((factor, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/30 px-2 py-1 rounded">
                <div className={`w-1 h-1 rounded-full ${RISK_COLORS[risk.level].split(' ')[0]}`} />
                {factor}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Info */}
      <Card className="bg-slate-900/60 border-slate-800 flex-1 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            {CONDITION_ICONS[current.condition]}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Environment Intelligence (Sokoto)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
                {CONDITION_ICONS[current.condition]}
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{current.temp}°C</p>
                <p className="text-sm text-slate-400 font-medium">{current.condition}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-blue-400">
                    <Droplets className="w-3 h-3" />
                    {current.humidity}% Humidity
                </span>
                <span className="flex items-center gap-1.5 text-teal-400">
                    <CloudRain className="w-3 h-3" />
                    {current.rainfall}mm Rainfall
                </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">5-Day Outlook</p>
            <div className="flex justify-between gap-1">
              {forecast.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-800/30 transition-colors">
                  <span className="text-[10px] text-slate-500 font-bold">{day.date}</span>
                  <div className="scale-75">
                    {CONDITION_ICONS[day.condition]}
                  </div>
                  <span className="text-xs font-bold text-slate-200">{day.temp}°</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
