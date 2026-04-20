import { IncidentForm } from "@/components/incident-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewIncidentPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-accent border border-transparent hover:border-border transition-all">
          <Link href="/incidents">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase tracking-wider">Report New Incident</h2>
          <p className="text-muted-foreground text-sm font-medium italic">Provide accurate details to help with assessment and response.</p>
        </div>
      </div>

      <Card className="bg-card border-border shadow-xl relative overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/5 py-7">
          <CardTitle className="text-xl font-black text-foreground uppercase tracking-tight">Incident Details</CardTitle>
          <CardDescription className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">All fields marked with * are required for reporting.</CardDescription>
        </CardHeader>
        <CardContent className="pt-10">
          <IncidentForm />
        </CardContent>
      </Card>
    </div>
  );
}
