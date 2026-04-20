"use server";

import { db } from "@/db";
import { incidents } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { gte, sql, count } from "drizzle-orm";
import { subHours } from "date-fns";

export interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number; // mm in last 3h
  condition: "Sunny" | "Cloudy" | "Rain" | "Storm";
}

export interface ForecastDay {
  date: string;
  temp: number;
  condition: "Sunny" | "Cloudy" | "Rain" | "Storm";
}

export interface RiskAssessment {
  score: number; // 0-10
  level: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
  label: string;
  factors: string[];
}

export async function getWeatherAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  // To simulate live behavior, we derive mock weather from current hour
  const currentHour = new Date().getHours();
  
  // Mock logic: Mornings are sunny, evenings are rainy/stormy for demo depth
  let condition: "Sunny" | "Cloudy" | "Rain" | "Storm" = "Sunny";
  let rainfall = 0;
  
  if (currentHour > 16 && currentHour < 21) {
    condition = "Rain";
    rainfall = 12.5;
  } else if (currentHour >= 21 || currentHour < 5) {
    condition = "Storm";
    rainfall = 28.2;
  } else if (currentHour > 10) {
    condition = "Cloudy";
  }

  const current: WeatherData = {
    temp: 34 - (currentHour > 18 ? 8 : 0),
    humidity: 45 + (rainfall > 0 ? 30 : 0),
    rainfall,
    condition
  };

  const forecast: ForecastDay[] = [
    { date: "Tomorrow", temp: 32, condition: "Rain" },
    { date: "Fri", temp: 30, condition: "Storm" },
    { date: "Sat", temp: 35, condition: "Sunny" },
    { date: "Sun", temp: 36, condition: "Cloudy" },
    { date: "Mon", temp: 33, condition: "Rain" },
  ];

  return { success: true, current, forecast };
}

export async function getFloodRiskAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    // 1. Get recent critical incidents (last 24h)
    const [recentCritical] = await db
      .select({ value: count() })
      .from(incidents)
      .where(
        sql`${incidents.createdAt} >= ${subHours(new Date(), 24)} AND ${incidents.severity} = 'CRITICAL'`
      );

    const [recentHigh] = await db
      .select({ value: count() })
      .from(incidents)
      .where(
        sql`${incidents.createdAt} >= ${subHours(new Date(), 24)} AND ${incidents.severity} = 'HIGH'`
      );

    // 2. Fetch mock rainfall for risk calc
    const weatherResult = await getWeatherAction();
    const rainfall = (weatherResult.success && weatherResult.current) ? weatherResult.current.rainfall : 0;

    // 3. Calculation
    let score = 0;
    const factors = [];

    // Rainfall factor (Max 5)
    if (rainfall > 20) {
        score += 5;
        factors.push("Heavy sustained rainfall (>20mm)");
    } else if (rainfall > 10) {
        score += 3;
        factors.push("Moderate rainfall detected");
    } else if (rainfall > 0) {
        score += 1;
    }

    // Incident factor (Max 5)
    const critCount = Number(recentCritical.value);
    const highCount = Number(recentHigh.value);

    if (critCount > 0) {
        score += Math.min(critCount * 2, 4);
        factors.push(`${critCount} Critical incident(s) recently reported`);
    }
    if (highCount > 0) {
        score += Math.min(highCount * 1, 1);
        factors.push(`${highCount} High priority incident(s) active`);
    }

    // Determine Level
    let level: RiskAssessment["level"] = "LOW";
    let label = "Normal Conditions";
    
    if (score >= 9) {
        level = "EXTREME";
        label = "Immediate Life Threat";
    } else if (score >= 6) {
        level = "HIGH";
        label = "Major Flood Risk";
    } else if (score >= 3) {
        level = "MODERATE";
        label = "Heightened Awareness";
    }

    if (factors.length === 0) factors.push("Stable environmental conditions");

    return {
      success: true,
      assessment: { score, level, label, factors } as RiskAssessment
    };
  } catch (error) {
    return { error: "Failed to calculate risk." };
  }
}
