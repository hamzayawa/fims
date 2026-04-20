import { db } from "@/db";
import { incidents, user, resources, resourceDeployments } from "@/db/schema";
import { eq, or, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Droplet, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Calendar, 
  User as UserIcon,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusControl } from "@/components/status-control";
import { AssignPersonnel } from "@/components/assign-personnel";
import { ResourceManager } from "@/components/resource-manager";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Fetch incident with joined reporter and assignee
  const incident = await db.query.incidents.findFirst({
    where: eq(incidents.id, id),
  });

  if (!incident) {
    notFound();
  }

  // 2. Fetch reporter and current assignee details manually for clarity
  const reporter = await db.query.user.findFirst({
    where: eq(user.id, incident.reportedBy),
  });

  const assignee = incident.assignedTo 
    ? await db.query.user.findFirst({ where: eq(user.id, incident.assignedTo) })
    : null;

  // 3. Fetch all eligible personnel for assignment
  const eligiblePersonnel = await db.query.user.findMany({
    where: inArray(user.role, ["ADMIN", "DATA_OFFICER", "FIELD_AGENT"]),
  });

  // 4. Fetch resource deployments for this incident
  const currentDeployments = await db.query.resourceDeployments.findMany({
    where: eq(resourceDeployments.incidentId, id),
    with: {
        resource: true
    }
  });

  // 5. Fetch available resources for deployment
  const availableResources = await db.query.resources.findMany({
    where: eq(resources.status, "AVAILABLE")
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/incidents">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">{incident.title}</h2>
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(incident.createdAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 uppercase font-semibold text-[10px] tracking-widest text-teal-500">
              Ref: {incident.id.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 border-l-4 border-l-blue-500 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-950/30 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Situation Report
                </CardTitle>
                <Badge variant={incident.severity === "CRITICAL" ? "destructive" : "secondary"}>
                  {incident.severity} SEVERITY
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-200">{incident.lga} LGA</p>
                    <p className="text-slate-400 text-sm">{incident.locationDetails || "No specific street details provided."}</p>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{incident.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex flex-col items-center justify-center text-center">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Casualties</span>
                  <span className="text-2xl font-black text-red-400">{incident.casualties}</span>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center justify-center text-center">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Displaced</span>
                  <span className="text-2xl font-black text-blue-400">{incident.displacedPersons}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-400">Reporter Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                   <UserIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">{reporter?.name || "Unknown User"}</p>
                  <p className="text-xs text-slate-500 font-mono">{reporter?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sidebar */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3">
               <Droplet className="w-24 h-24 text-slate-800 opacity-20 -mr-8 -mt-8 rotate-12" />
             </div>
            <CardHeader className="border-b border-slate-800">
               <CardTitle className="text-sm font-bold text-slate-100 uppercase tracking-widest">Lifecycle Management</CardTitle>
               <CardDescription>Update investigation phase and assignments.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8 relative z-10">
               <StatusControl incidentId={incident.id} currentStatus={incident.status} />
               
               <AssignPersonnel 
                incidentId={incident.id} 
                currentAssigneeId={incident.assignedTo} 
                personnel={eligiblePersonnel.map(p => ({ id: p.id, name: p.name, role: p.role }))} 
               />

               <div className="pt-6 border-t border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Current Lead</p>
                  {assignee ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                        <Users className="w-4 h-4 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-teal-100">{assignee.name}</p>
                        <p className="text-[10px] text-teal-500 uppercase font-black uppercase tracking-widest">{assignee.role.replace("_", " ")}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 italic">No responder assigned yet.</p>
                  )}
               </div>
            </CardContent>
          </Card>

          {/* Resources Management Section */}
          <ResourceManager 
            incidentId={id} 
            currentDeployments={currentDeployments as any} 
            availableResources={availableResources as any} 
          />
        </div>
      </div>
    </div>
  );
}

