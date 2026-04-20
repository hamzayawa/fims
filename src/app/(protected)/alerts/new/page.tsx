import { AlertForm } from "@/components/alert-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewAlertPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/alerts">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Issue Emergency Alert</h2>
          <p className="text-slate-400">Broadcast critical information to residents and personnel across Sokoto.</p>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Broadcast Details</CardTitle>
          <CardDescription>Target specific LGAs and set severity to notify relevant departments.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertForm />
        </CardContent>
      </Card>
    </div>
  );
}
