"use server";

import { db } from "@/db";
import { incidents, user, notifications, incidentUpdates } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { broadcastEmail } from "@/lib/email-service";

const incidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  lga: z.string().min(1, "LGA is required"),
  locationDetails: z.string().optional(),
  severity: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
  casualties: z.coerce.number().min(0).default(0),
  displacedPersons: z.coerce.number().min(0).default(0),
});

export async function createIncidentAction(values: z.infer<typeof incidentSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const validated = incidentSchema.parse(values);

    const [newIncident] = await db.insert(incidents).values({
      ...validated,
      reportedBy: session.user.id,
      status: "REPORTED",
    }).returning();

    revalidatePath("/incidents");
    revalidatePath("/dashboard");

    // TRIGGER NOTIFICATIONS FOR CRITICAL INCIDENTS
    if (validated.severity === "CRITICAL") {
      const allUsers = await db.select().from(user);
      
      // Create in-app notifications
      if (allUsers.length > 0) {
        await db.insert(notifications).values(
          allUsers.map(u => ({
            userId: u.id,
            title: `CRITICAL INCIDENT: ${validated.title}`,
            message: `A critical flood incident has been reported in ${validated.lga}. Immediate assessment required.`,
            type: "INCIDENT",
          }))
        );
      }

      // Send Email Broadcast
      await broadcastEmail(
        `CRITICAL INCIDENT in ${validated.lga}`,
        validated.title,
        validated.description,
        "CRITICAL_INCIDENT"
      );
    }

    return { success: true, data: newIncident };
  } catch (error) {
    console.error("Failed to create incident:", error);
    if (error instanceof z.ZodError) {
      return { error: "Validation failed", details: error.errors };
    }
    return { error: "Something went wrong. Please try again." };
  }
}

export async function updateIncidentStatusAction(id: string, status: "REPORTED" | "INVESTIGATING" | "MITIGATED" | "RESOLVED") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "DATA_OFFICER")) {
    return { error: "Permission denied." };
  }

  try {
    await db.update(incidents)
      .set({ status })
      .where(eq(incidents.id, id));

    revalidatePath(`/incidents/${id}`);
    revalidatePath("/incidents");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update status." };
  }
}

export async function assignIncidentAction(id: string, userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "DATA_OFFICER")) {
    return { error: "Permission denied." };
  }

  try {
    await db.update(incidents)
      .set({ assignedTo: userId })
      .where(eq(incidents.id, id));

    revalidatePath(`/incidents/${id}`);
    revalidatePath("/incidents");
    return { success: true };
  } catch (error) {
    return { error: "Failed to assign personnel." };
  }
}

const incidentUpdateSchema = z.object({
  incidentId: z.string().uuid(),
  content: z.string().min(1, "Content cannot be empty"),
});

export async function addIncidentUpdateAction(values: z.infer<typeof incidentUpdateSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  if (session.user.role === "VIEWER") {
    return { error: "Permission denied. Only active agents can add situational updates." };
  }

  try {
    const validated = incidentUpdateSchema.parse(values);

    const [newUpdate] = await db.insert(incidentUpdates).values({
      incidentId: validated.incidentId,
      authorId: session.user.id,
      content: validated.content,
    }).returning();

    revalidatePath(`/incidents/${validated.incidentId}`);
    return { success: true, data: newUpdate };
  } catch (error) {
    console.error("Failed to add update:", error);
    if (error instanceof z.ZodError) {
      return { error: "Validation failed", details: error.errors };
    }
    return { error: "Something went wrong. Please try again." };
  }
}
