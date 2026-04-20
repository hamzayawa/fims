import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FIMS | Flood Information Management System",
  description:
    "A centralised platform for NEMA Sokoto to collect, manage, and respond to flood-related incidents across Sokoto State.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
