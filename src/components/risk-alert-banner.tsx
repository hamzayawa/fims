"use client";

import { AlertTriangle } from "lucide-react";
import { RiskAssessment } from "@/app/actions/weather";

interface RiskAlertBannerProps {
  assessment: RiskAssessment | null;
}

export function RiskAlertBanner({ assessment }: RiskAlertBannerProps) {
  if (!assessment || (assessment.level !== "HIGH" && assessment.level !== "EXTREME")) {
    return null;
  }

  const isExtreme = assessment.level === "EXTREME";

  return (
    <div className={`mb-8 p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl relative overflow-hidden group ${
      isExtreme 
        ? "bg-destructive/10 border-destructive/50 text-destructive dark:text-red-400" 
        : "bg-orange-500/10 border-orange-500/50 text-orange-700 dark:text-orange-400"
    }`}>
      {/* Background warning pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}>
      </div>
      {/* Background pulse effect for EXTREME */}
      {isExtreme && <div className="absolute inset-0 bg-destructive/5 animate-pulse pointer-events-none"></div>}

      <div className="flex items-start md:items-center gap-5 relative z-10 w-full">
        <div className={`p-3 rounded-full shrink-0 shadow-inner border ${
          isExtreme 
            ? "bg-destructive text-destructive-foreground border-destructive/80" 
            : "bg-orange-500 text-white border-orange-600"
        }`}>
          <AlertTriangle className={`w-6 h-6 ${isExtreme ? "animate-bounce" : ""}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-black uppercase tracking-widest text-sm mb-1 flex items-center gap-2">
            <span className={isExtreme ? "text-destructive" : "text-orange-600"}>{assessment.level} ALERT</span>
            <span className="opacity-50">•</span>
            <span>{assessment.label}</span>
          </h3>
          <p className="text-xs font-bold opacity-80 leading-relaxed">
            {assessment.factors.join(" • ")}
          </p>
        </div>
      </div>
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-4 md:mt-0 relative z-10 border-t md:border-t-0 md:border-l border-current/20 pt-4 md:pt-0 md:pl-6 shrink-0">
         <span className="text-[10px] uppercase font-black tracking-widest opacity-70">Risk Score</span>
         <span className="text-3xl font-black tracking-tighter">{assessment.score}<span className="text-lg opacity-50">/10</span></span>
      </div>
    </div>
  );
}
