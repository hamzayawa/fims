"use server";

import { db } from "@/db";
import { resources, resourceDeployments } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const resourceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["BOAT", "PUMP", "AMBULANCE", "VEHICLE", "SANDBAGS", "RELIEF_PACK"]),
  serialNumber: z.string().optional(),
  quantity: z.coerce.number().min(1).default(1),
  currentLga: z.string().optional(),
});

export async function createResourceAction(values: z.infer<typeof resourceSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Only admins can manage the inventory." };
  }

  try {
    const validated = resourceSchema.parse(values);
    const [newResource] = await db.insert(resources).values({
      ...validated,
      status: "AVAILABLE",
    }).returning();

    revalidatePath("/resources");
    return { success: true, data: newResource };
  } catch (error) {
    return { error: "Failed to create resource item." };
  }
}

export async function deployResourceAction(resourceId: string, incidentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "DATA_OFFICER")) {
    return { error: "Permission denied." };
  }

  try {
    // 1. Transaction to update status and create deployment
    await db.transaction(async (tx) => {
      await tx.update(resources)
        .set({ status: "DEPLOYED" })
        .where(eq(resources.id, resourceId));

      await tx.insert(resourceDeployments).values({
        resourceId,
        incidentId,
        status: "ACTIVE",
      });
    });

    revalidatePath(`/incidents/${incidentId}`);
    revalidatePath("/resources");
    return { success: true };
  } catch (error) {
    return { error: "Failed to deploy resource." };
  }
}

export async function returnResourceAction(deploymentId: string, resourceId: string, incidentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  try {
    await db.transaction(async (tx) => {
      await tx.update(resourceDeployments)
        .set({ status: "RETURNED", returnedAt: new Date() })
        .where(eq(resourceDeployments.id, deploymentId));

      await tx.update(resources)
        .set({ status: "AVAILABLE" })
        .where(eq(resources.id, resourceId));
    });

    revalidatePath(`/incidents/${incidentId}`);
    revalidatePath("/resources");
    return { success: true };
  } catch (error) {
    return { error: "Failed to process return." };
  }
}

export async function updateResourceStatusAction(id: string, status: "AVAILABLE" | "DEPLOYED" | "MAINTENANCE" | "RETIRED") {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
  
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
  
    try {
      await db.update(resources).set({ status }).where(eq(resources.id, id));
      revalidatePath("/resources");
      return { success: true };
    } catch (error) {
      return { error: "Failed to update status." };
    }
}
