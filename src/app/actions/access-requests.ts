"use server";

import { db } from "@/db";
import { accessRequests } from "@/db/schema";
import { z } from "zod";
import { sendAccessRequestNotification } from "@/lib/email-service";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const accessRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  organization: z.string().optional(),
  purpose: z.string().min(10, "Please provide a more detailed reason for access (min 10 characters)."),
});

export async function submitAccessRequestAction(formData: z.infer<typeof accessRequestSchema>) {
  const parsed = accessRequestSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const { name, email, organization, purpose } = parsed.data;

  try {
    // 1. Save to database
    const [request] = await db.insert(accessRequests).values({
      name,
      email,
      organization: organization || null,
      purpose,
      status: "PENDING",
    }).returning();

    // 2. Notify admins
    await sendAccessRequestNotification({
      name,
      email,
      organization: organization || "N/A",
      purpose,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to submit access request:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function approveAccessRequestAction(requestId: string, userData: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "ADMIN") {
    return { error: "Permission denied. Admin role required." };
  }

  try {
    // 1. Create the user
    const result = await auth.api.signUpEmail({
      body: userData,
    });

    if (!result || (result as any).error) {
      return { error: (result as any)?.error?.message || "Failed to create user." };
    }

    // 2. Delete the request
    await db.delete(accessRequests).where(eq(accessRequests.id, requestId));

    revalidatePath("/settings/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to approve access request:", error);
    return { error: error?.message || "An unexpected error occurred." };
  }
}

export async function deleteAccessRequestAction(requestId: string) {
  try {
    await db.delete(accessRequests).where(eq(accessRequests.id, requestId));
    revalidatePath("/settings/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete access request:", error);
    return { error: "Failed to delete request." };
  }
}
