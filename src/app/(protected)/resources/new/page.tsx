import { ResourceForm } from "@/components/resource-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Box } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewResourcePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-accent border border-transparent hover:border-border transition-all">
          <Link href="/resources">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase tracking-wider">Register New Asset</h2>
          <p className="text-muted-foreground text-sm font-medium italic">Add equipment, vehicles, or relief materials to the state inventory.</p>
        </div>
      </div>

      <Card className="bg-card border-border shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 pointer-events-none">
            <Box className="w-24 h-24 text-primary opacity-5 rotate-12" />
        </div>
        <CardHeader className="border-b border-border bg-muted/5 py-7">
          <CardTitle className="text-xl font-black text-foreground uppercase tracking-tight">Asset Specifications</CardTitle>
          <CardDescription className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Ensure serial numbers and quantities are accurate for field allocation.</CardDescription>
        </CardHeader>
        <CardContent className="pt-10">
          <ResourceForm />
        </CardContent>
      </Card>
    </div>
  );
}
