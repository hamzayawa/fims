"use server";

import { db } from "@/db";
import { alerts, user, notifications } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { broadcastEmail } from "@/lib/email-service";

const alertSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
  targetLgas: z.array(z.string()).min(1, "Select at least one LGA"),
  expiresAt: z.string().optional().transform(v => v ? new Date(v) : undefined),
});

export async function createAlertAction(values: z.infer<typeof alertSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "DATA_OFFICER")) {
    return { error: "Unauthorized. Limited to Admins and Data Officers." };
  }

  try {
    const validated = alertSchema.parse(values);

    const [newAlert] = await db.insert(alerts).values({
      ...validated,
      createdBy: session.user.id,
      isActive: true,
    }).returning();

    revalidatePath("/alerts");
    revalidatePath("/dashboard");

    // TRIGGER MASS BROADCAST FOR ALERTS
    const allUsers = await db.select().from(user);
    if (allUsers.length > 0) {
      await db.insert(notifications).values(
        allUsers.map(u => ({
          userId: u.id,
          title: `EMERGENCY ALERT: ${validated.title}`,
          message: validated.message,
          type: "ALERT",
        }))
      );
    }

    await broadcastEmail(
      validated.title,
      validated.title,
      validated.message,
      "EMERGENCY_ALERT"
    );

    return { success: true, data: newAlert };
  } catch (error) {
    console.error("Failed to create alert:", error);
    if (error instanceof z.ZodError) {
      return { error: "Validation failed", details: error.errors };
    }
    return { error: "Something went wrong." };
  }
}

export async function toggleAlertStatusAction(id: string, currentStatus: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "DATA_OFFICER")) {
    return { error: "Unauthorized." };
  }

  try {
    await db.update(alerts)
      .set({ isActive: !currentStatus })
      .where(eq(alerts.id, id));

    revalidatePath("/alerts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update status." };
  }
}
