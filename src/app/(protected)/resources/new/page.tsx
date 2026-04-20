import { ResourceForm } from "@/components/resource-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Box } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewResourcePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-800">
          <Link href="/resources">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1 uppercase tracking-wider">Register New Asset</h2>
          <p className="text-slate-400 text-sm italic">Add equipment, vehicles, or relief materials to the state inventory.</p>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
            <Box className="w-24 h-24 text-slate-800 opacity-20 rotate-12" />
        </div>
        <CardHeader className="border-b border-slate-800 bg-slate-950/20 py-6">
          <CardTitle className="text-lg font-bold text-slate-200">Asset Specifications</CardTitle>
          <CardDescription className="text-slate-500">Ensure serial numbers and quantities are accurate for field allocation.</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <ResourceForm />
        </CardContent>
      </Card>
    </div>
  );
}
