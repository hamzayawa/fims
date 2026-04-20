import { resend } from "./resend";
import { db } from "@/db";
import { user } from "@/db/schema";

export async function broadcastEmail(
  subject: string, 
  title: string, 
  message: string, 
  type: 'CRITICAL_INCIDENT' | 'EMERGENCY_ALERT'
) {
  try {
    // 1. Fetch all personnel emails
    const personnel = await db.select({ email: user.email }).from(user);
    const emails = personnel.map(u => u.email);

    if (emails.length === 0) return;

    // 2. Send via Resend
    // Note: In development/without a verified domain, Resend might only allow sending to one address.
    // For a real broadcast, we'd use a verified domain.
    await resend.emails.send({
      from: 'FIMS Alerts <alerts@fims.sokoto.gov.ng>', // Placeholder until domain verified
      to: emails,
      subject: `[EMERGENCY] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: ${type === 'CRITICAL_INCIDENT' ? '#ef4444' : '#14b8a6'}; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">FIMS EMERGENCY BROADCAST</h1>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <h2 style="margin-top: 0;">${title}</h2>
            <p style="line-height: 1.6; font-size: 16px;">${message}</p>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              This is an official emergency notification from the Flood Incident Management System of Sokoto State.
              Please log in to the FIMS Portal for more details and coordination.
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to broadcast email:", error);
  }
}
