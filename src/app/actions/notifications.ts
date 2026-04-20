"use server";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";

export async function getNotificationsAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const results = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return { success: true, data: results };
  } catch (error) {
    return { error: "Failed to fetch notifications." };
  }
}

export async function markNotificationAsReadAction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update notification." };
  }
}

export async function markAllNotificationsAsReadAction() {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
  
    if (!session) {
      return { error: "Unauthorized" };
    }
  
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, session.user.id));
  
      revalidatePath("/dashboard");
      return { success: true };
    } catch (error) {
      return { error: "Failed to update notifications." };
    }
  }
