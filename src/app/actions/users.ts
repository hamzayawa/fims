"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["ADMIN", "DATA_OFFICER", "FIELD_AGENT", "VIEWER"]),
});

export async function createUserAction(formData: z.infer<typeof createUserSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "ADMIN") {
    return { error: "Permission denied. Admin role required." };
  }

  const parsed = createUserSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const { name, email, password, role } = parsed.data;

  try {
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        role,
      } as any,
    });

    if (!result || (result as any).error) {
      return { error: (result as any)?.error?.message || "Failed to create user." };
    }

    revalidatePath("/settings/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create user:", error);
    return { error: error?.message || "An unexpected error occurred." };
  }
}

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

export async function deleteUserAction(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Permission denied. Admin role required." };
  }

  if (session.user.id === userId) {
    return { error: "You cannot delete your own account." };
  }

  try {
    // Note: This will fail if there are dependent records (incidents, etc)
    // We should probably use a "deleted" flag or cascade, but for now simple delete
    await db.delete(user).where(eq(user.id, userId));
    revalidatePath("/settings/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { error: "Failed to delete user. They might have associated records (incidents, reports)." };
  }
}

export async function toggleUserActiveAction(userId: string, isActive: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Permission denied. Admin role required." };
  }

  if (session.user.id === userId && !isActive) {
    return { error: "You cannot disable your own account." };
  }

  try {
    await db.update(user)
      .set({ isActive })
      .where(eq(user.id, userId));
    
    revalidatePath("/settings/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle user status:", error);
    return { error: "Failed to update user status." };
  }
}
