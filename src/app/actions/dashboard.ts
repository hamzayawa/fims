"use server";

import { db } from "@/db";
import { incidents } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { gte, sql, count, sum, desc } from "drizzle-orm";
import { subDays, format, startOfDay } from "date-fns";

export async function getDashboardDataAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const sevenDaysAgo = subDays(startOfDay(new Date()), 7);

    // 1. Fetch trend data (last 7 days)
    // We'll use a raw SQL approach for date grouping to ensure consistency across DB providers if needed, 
    // but here we target Postgres specifically via Drizzle.
    const trendResults = await db
      .select({
        date: sql<string>`DATE(${incidents.createdAt})`,
        count: count(),
      })
      .from(incidents)
      .where(gte(incidents.createdAt, sevenDaysAgo))
      .groupBy(sql`DATE(${incidents.createdAt})`)
      .orderBy(sql`DATE(${incidents.createdAt})`);

    // 2. Fetch LGA data for the map
    const lgaResults = await db
      .select({
        lga: incidents.lga,
        count: count(),
        totalCasualties: sum(incidents.casualties),
        totalDisplaced: sum(incidents.displacedPersons),
        // Grouping to find the highest severity by assigning numeric values
        highestSeverity: sql<string>`
          CASE 
            WHEN MAX(CASE WHEN ${incidents.severity} = 'CRITICAL' THEN 4
                         WHEN ${incidents.severity} = 'HIGH' THEN 3
                         WHEN ${incidents.severity} = 'MODERATE' THEN 2
                         ELSE 1 END) = 4 THEN 'CRITICAL'
            WHEN MAX(CASE WHEN ${incidents.severity} = 'CRITICAL' THEN 4
                         WHEN ${incidents.severity} = 'HIGH' THEN 3
                         WHEN ${incidents.severity} = 'MODERATE' THEN 2
                         ELSE 1 END) = 3 THEN 'HIGH'
            WHEN MAX(CASE WHEN ${incidents.severity} = 'CRITICAL' THEN 4
                         WHEN ${incidents.severity} = 'HIGH' THEN 3
                         WHEN ${incidents.severity} = 'MODERATE' THEN 2
                         ELSE 1 END) = 2 THEN 'MODERATE'
            ELSE 'LOW'
          END
        `
      })
      .from(incidents)
      .groupBy(incidents.lga);

    // Format trend data to ensure all 7 days are represented even if 0 incidents
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = format(d, "yyyy-MM-dd");
        const found = trendResults.find(r => r.date === dateStr);
        trendData.push({
            date: format(d, "MMM dd"),
            count: found ? Number(found.count) : 0
        });
    }

    return {
      success: true,
      data: {
        trend: trendData,
        lgaSummary: lgaResults.map(r => ({
          lga: r.lga,
          count: Number(r.count),
          totalCasualties: Number(r.totalCasualties),
          totalDisplaced: Number(r.totalDisplaced),
          highestSeverity: r.highestSeverity
        }))
      }
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return { error: "Failed to fetch dashboard analytics." };
  }
}
