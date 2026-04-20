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
  AVAILABLE: { color: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: <CheckCircle2 className="w-3 h-3" /> },
  DEPLOYED: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Navigation className="w-3 h-3" /> },
  MAINTENANCE: { color: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: <Wrench className="w-3 h-3" /> },
  RETIRED: { color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: <Clock className="w-3 h-3" /> },
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
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Resource Inventory</h2>
          <p className="text-slate-400 font-medium">Track and manage emergency response assets and deployment status.</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-500 gap-2 shadow-lg shadow-teal-500/20 px-5">
           <Link href="/resources/new">
            <Plus className="h-4 w-4" />
            Register Asset
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Assets", val: stats.total, icon: <Layers className="text-blue-400" /> },
          { label: "Available", val: stats.available, icon: <CheckCircle2 className="text-teal-400" /> },
          { label: "Deployed", val: stats.deployed, icon: <Navigation className="text-blue-400" /> },
          { label: "Maintenance", val: stats.maintenance, icon: <Wrench className="text-orange-400" /> },
        ].map((s, i) => (
          <Card key={i} className="bg-slate-900/40 border-slate-800 shadow-xl backdrop-blur-sm">
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{s.label}</p>
                <p className="text-2xl font-black text-slate-100">{s.val}</p>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/50 shadow-inner">
               {s.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900/50 border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-slate-800 bg-slate-950/20 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <CardTitle className="text-base text-slate-200 uppercase tracking-wider font-bold">System Asset Catalog</CardTitle>
                   <CardDescription className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Real-time status of all emergency equipment</CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                        placeholder="Search resources..." 
                        className="pl-10 bg-slate-800/50 border-slate-700 h-10 text-xs focus:ring-teal-500/20"
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[10px] text-slate-500 uppercase font-black tracking-widest bg-slate-950/40 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Resource Info</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Current Mission / Location</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {allResources.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-16 text-center text-slate-500 italic bg-slate-950/20">
                            No assets registered in the system. Use "Register Asset" to get started.
                        </td>
                    </tr>
                ) : (
                    allResources.map((res) => {
                        const activeDeployment = res.deployments?.[0];
                        return (
                            <tr key={res.id} className="hover:bg-teal-500/[0.02] transition-colors group border-b border-slate-800/50 last:border-0">
                            <td className="px-6 py-5">
                                <div className="font-bold text-slate-200 group-hover:text-teal-400 transition-colors">{res.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5 tracking-tighter uppercase">{res.serialNumber || 'REF-'+res.id.slice(0, 8)}</div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2.5 text-slate-400">
                                    <div className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                                        {TYPE_ICONS[res.type as keyof typeof TYPE_ICONS]}
                                    </div>
                                    <span className="text-xs uppercase font-bold tracking-tight">{res.type.replace('_', ' ')}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <Badge variant="outline" className={`gap-1.5 px-2.5 py-1 text-[10px] font-bold ${STATUS_CONFIG[res.status as keyof typeof STATUS_CONFIG].color} border-current/20`}>
                                    {STATUS_CONFIG[res.status as keyof typeof STATUS_CONFIG].icon}
                                    {res.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-5">
                                {activeDeployment ? (
                                    <Link 
                                        href={`/incidents/${activeDeployment.incidentId}`}
                                        className="flex flex-col group/link max-w-[200px]"
                                    >
                                        <div className="text-xs font-bold text-blue-400 group-hover/link:underline truncate">
                                            {activeDeployment.incident.title}
                                        </div>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                            <AlertTriangle className="w-3 h-3 text-slate-600" />
                                            {activeDeployment.incident.lga} LGA
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="text-xs text-slate-400 flex items-center gap-2 italic">
                                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                                        {res.currentLga || "Central Logistics Center"}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-5 text-right">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-teal-400 hover:bg-teal-400/10">
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
