"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function updateUserRoleAction(userId: string, newRole: "ADMIN" | "DATA_OFFICER" | "FIELD_AGENT" | "VIEWER") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Permission denied. Admin role required." };
  }

  try {
    await db.update(user)
      .set({ role: newRole })
      .where(eq(user.id, userId));

    revalidatePath("/settings/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { error: "Failed to update role." };
  }
}
