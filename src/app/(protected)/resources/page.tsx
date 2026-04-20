import { db } from "@/db";
import { resources } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Wrench, 
  Navigation, 
  Anchor, 
  Ambulance, 
  Truck, 
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Droplet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";

const TYPE_ICONS = {
  BOAT: <Anchor className="w-4 h-4" />,
  PUMP: <Activity className="w-4 h-4" />,
  AMBULANCE: <Ambulance className="w-4 h-4" />,
  VEHICLE: <Truck className="w-4 h-4" />,
  SANDBAGS: <Layers className="w-4 h-4" />,
  RELIEF_PACK: <Droplet className="w-4 h-4" />
};

const STATUS_CONFIG = {
  AVAILABLE: { color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  DEPLOYED: { color: "bg-blue-50 text-blue-600 border-blue-200", icon: <Navigation className="w-3 h-3" /> },
  MAINTENANCE: { color: "bg-orange-50 text-orange-600 border-orange-200", icon: <Wrench className="w-3 h-3" /> },
  RETIRED: { color: "bg-muted text-muted-foreground border-border", icon: <Clock className="w-3 h-3" /> },
};

export default async function ResourcesPage() {
  const allResources = await db.query.resources.findMany({
    orderBy: [desc(resources.createdAt)],
    with: {
        deployments: {
            where: (deployment, { eq }) => eq(deployment.status, "ACTIVE"),
            with: {
                incident: true
            }
        }
    }
  });

  const stats = {
    total: allResources.length,
    available: allResources.filter(r => r.status === "AVAILABLE").length,
    deployed: allResources.filter(r => r.status === "DEPLOYED").length,
    maintenance: allResources.filter(r => r.status === "MAINTENANCE").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase">Resource Inventory</h2>
          <p className="text-muted-foreground text-sm font-medium">Track and manage emergency response assets and deployment status.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all gap-2">
           <Link href="/resources/new">
            <Plus className="h-5 w-5" />
            Register Asset
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Assets", val: stats.total, icon: <Layers className="text-blue-600" /> },
          { label: "Available", val: stats.available, icon: <CheckCircle2 className="text-emerald-600" /> },
          { label: "Deployed", val: stats.deployed, icon: <Navigation className="text-blue-600" /> },
          { label: "Maintenance", val: stats.maintenance, icon: <Wrench className="text-orange-600" /> },
        ].map((s, i) => (
          <Card key={i} className="bg-card border-border shadow-sm">
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{s.label}</p>
                <p className="text-3xl font-black text-foreground tracking-tighter">{s.val}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-2xl border border-border/50 shadow-sm">
               {s.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border shadow-md overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/5 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <CardTitle className="text-base text-foreground uppercase tracking-wider font-black">System Asset Catalog</CardTitle>
                   <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">Real-time status of all emergency equipment</CardDescription>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search resources..." 
                        className="pl-10 bg-background border-border h-11 rounded-xl text-xs focus:ring-primary/20 font-medium"
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[10px] text-muted-foreground uppercase font-black tracking-widest bg-muted/20 border-b border-border">
                <tr>
                  <th className="px-6 py-5">Resource Info</th>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Mission / Location</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allResources.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-16 text-center text-muted-foreground font-medium italic bg-muted/10">
                            No assets registered in the system. Use "Register Asset" to get started.
                        </td>
                    </tr>
                ) : (
                    allResources.map((res) => {
                        const activeDeployment = res.deployments?.[0];
                        return (
                            <tr key={res.id} className="hover:bg-primary/[0.02] transition-colors group">
                            <td className="px-6 py-6">
                                <div className="font-black text-foreground group-hover:text-primary transition-colors text-base tracking-tight">{res.name}</div>
                                <div className="text-[10px] text-muted-foreground font-black mt-1 tracking-widest uppercase opacity-70">{res.serialNumber || 'REF-'+res.id.slice(0, 8)}</div>
                            </td>
                            <td className="px-6 py-6">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="p-2 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        {TYPE_ICONS[res.type as keyof typeof TYPE_ICONS]}
                                    </div>
                                    <span className="text-xs uppercase font-black tracking-tighter">{res.type.replace('_', ' ')}</span>
                                </div>
                            </td>
                            <td className="px-6 py-6">
                                <Badge variant="outline" className={`gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border-2 ${STATUS_CONFIG[res.status as keyof typeof STATUS_CONFIG].color}`}>
                                    {STATUS_CONFIG[res.status as keyof typeof STATUS_CONFIG].icon}
                                    {res.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-6">
                                {activeDeployment ? (
                                    <Link 
                                        href={`/incidents/${activeDeployment.incidentId}`}
                                        className="flex flex-col group/link max-w-[200px]"
                                    >
                                        <div className="text-xs font-black text-primary group-hover/link:underline truncate">
                                            {activeDeployment.incident.title}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1 font-bold uppercase tracking-wider">
                                            <AlertTriangle className="w-3 h-3 text-orange-500" />
                                            {activeDeployment.incident.lga} LGA
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="text-xs text-muted-foreground flex items-center gap-2 italic font-medium">
                                        <Clock className="w-3.5 h-3.5 opacity-40" />
                                        {res.currentLga || "Central Logistics Center"}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-6 text-right">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:text-primary hover:bg-primary/10 transition-all">
                                    <Wrench className="w-4 h-4" />
                                </Button>
                            </td>
                            </tr>
                        );
                    })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
