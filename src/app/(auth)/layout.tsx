import { Metadata } from "next";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Authentication | FIMS",
  description: "Login or register for the Flood Information Management System.",
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-[120px] mix-blend-multiply opacity-50 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] bg-teal-500/10 rounded-full blur-[100px] mix-blend-multiply opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}
