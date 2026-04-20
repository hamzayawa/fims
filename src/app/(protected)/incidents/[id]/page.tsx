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
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-accent border border-transparent hover:border-border transition-all">
          <Link href="/incidents">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase">{incident.title}</h2>
          <div className="flex items-center gap-4 text-muted-foreground text-xs font-bold">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(incident.createdAt).toLocaleDateString()}
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1.5 uppercase font-black tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10 shadow-sm">
              Ref: {incident.id.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border border-l-4 border-l-primary shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground uppercase tracking-tight">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Situation Report
                </CardTitle>
                <Badge variant={incident.severity === "CRITICAL" ? "destructive" : "secondary"} className="font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                  {incident.severity} SEVERITY
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
                    <MapPin className="w-6 h-6 shrink-0" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-foreground tracking-tight">{incident.lga} LGA</p>
                    <p className="text-muted-foreground text-sm font-medium italic opacity-80">{incident.locationDetails || "No specific street details provided."}</p>
                  </div>
                </div>

                <div className="bg-muted/30 p-6 rounded-2xl border border-border/50 shadow-inner">
                  <p className="text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap">{incident.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-destructive/[0.03] border border-destructive/10 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Casualties Recorded</span>
                  <span className="text-4xl font-black text-destructive tracking-tighter">{incident.casualties}</span>
                </div>
                <div className="p-6 rounded-2xl bg-primary/[0.03] border border-primary/10 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Displaced Persons</span>
                  <span className="text-4xl font-black text-primary tracking-tighter">{incident.displacedPersons}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader className="py-4 border-b border-border/10">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Reporter Information</CardTitle>
            </CardHeader>
            <CardContent className="py-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border shadow-sm">
                   <UserIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-black text-foreground tracking-tight">{reporter?.name || "Unknown User"}</p>
                  <p className="text-xs text-muted-foreground font-bold tracking-tight opacity-70">{reporter?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 pointer-events-none transition-transform group-hover:scale-110 duration-500">
               <Droplet className="w-24 h-24 text-primary opacity-5 -mr-8 -mt-8 rotate-12" />
             </div>
            <CardHeader className="border-b border-border bg-muted/5 py-6">
               <CardTitle className="text-xs font-black text-foreground uppercase tracking-widest">Lifecycle Management</CardTitle>
               <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 italic">Update investigation phase and assignments.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-10 relative z-10">
               <StatusControl incidentId={incident.id} currentStatus={incident.status} />
               
               <AssignPersonnel 
                incidentId={incident.id} 
                currentAssigneeId={incident.assignedTo} 
                personnel={eligiblePersonnel.map(p => ({ id: p.id, name: p.name, role: p.role }))} 
               />

               <div className="pt-8 border-t border-border">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 px-1">Current Lead Responder</p>
                  {assignee ? (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-100 shadow-sm transition-all hover:shadow-md">
                      <div className="w-10 h-10 rounded-xl bg-emerald-200 flex items-center justify-center border border-emerald-300/50">
                        <Users className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-emerald-900 tracking-tight">{assignee.name}</p>
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">{assignee.role.replace("_", " ")}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border-2 border-dashed border-border bg-muted/20 flex items-center justify-center">
                       <p className="text-xs text-muted-foreground font-bold italic">No responder assigned yet.</p>
                    </div>
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

