"use server";

import { db } from "@/db";
import { incidents, alerts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, gte, lte, eq, or, sql } from "drizzle-orm";

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  lga?: string;
  severity?: string;
  status?: string;
}

export async function getReportDataAction(filters: ReportFilter) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "DATA_OFFICER")) {
    return { error: "Permission denied." };
  }

  try {
    const incidentFilters = [];
    const alertFilters = [];

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      incidentFilters.push(gte(incidents.createdAt, start));
      alertFilters.push(gte(alerts.createdAt, start));
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      incidentFilters.push(lte(incidents.createdAt, end));
      alertFilters.push(lte(alerts.createdAt, end));
    }

    if (filters.lga && filters.lga !== "ALL") {
      incidentFilters.push(eq(incidents.lga, filters.lga));
      // For alerts, since it's a JSONB array, we need to check if the lga is within the array
      alertFilters.push(sql`${alerts.targetLgas} ? ${filters.lga}`);
    }

    if (filters.severity && filters.severity !== "ALL") {
      incidentFilters.push(eq(incidents.severity, filters.severity as any));
      
      // Map incident severity to alert severity
      const alertSeverityMap: Record<string, "INFO" | "WARNING" | "CRITICAL"> = {
        "LOW": "INFO",
        "MODERATE": "WARNING",
        "HIGH": "WARNING",
        "CRITICAL": "CRITICAL"
      };
      
      const mappedSeverity = alertSeverityMap[filters.severity];
      if (mappedSeverity) {
        alertFilters.push(eq(alerts.severity, mappedSeverity));
      }
    }

    if (filters.status && filters.status !== "ALL") {
      incidentFilters.push(eq(incidents.status, filters.status as any));
    }

    const [foundIncidents, foundAlerts] = await Promise.all([
      db.query.incidents.findMany({
        where: and(...incidentFilters),
        orderBy: (i, { desc }) => [desc(i.createdAt)],
      }),
      db.query.alerts.findMany({
        where: and(...alertFilters),
        orderBy: (a, { desc }) => [desc(a.createdAt)],
      }),
    ]);

    return { 
      success: true, 
      data: {
        incidents: foundIncidents,
        alerts: foundAlerts,
        generatedAt: new Date().toISOString(),
        summary: {
          totalIncidents: foundIncidents.length,
          totalAlerts: foundAlerts.length,
          totalCasualties: foundIncidents.reduce((acc, i) => acc + i.casualties, 0),
          totalDisplaced: foundIncidents.reduce((acc, i) => acc + i.displacedPersons, 0),
        }
      } 
    };
  } catch (error) {
    console.error("Report generation error:", error);
    return { error: "Failed to fetch report data." };
  }
}
