import { IncidentForm } from "@/components/incident-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewIncidentPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/incidents">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Report New Incident</h2>
          <p className="text-slate-400">Provide accurate details to help with assessment and response.</p>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
          <CardDescription>All fields marked with * are required for reporting.</CardDescription>
        </CardHeader>
        <CardContent>
          <IncidentForm />
        </CardContent>
      </Card>
    </div>
  );
}
