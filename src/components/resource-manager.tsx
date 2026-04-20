"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Anchor, 
  Ambulance, 
  Truck, 
  Layers, 
  Activity,
  History,
  CheckCircle2,
  Navigation,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { deployResourceAction, returnResourceAction } from "@/app/actions/resources";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  serialNumber?: string | null;
}

interface Deployment {
  id: string;
  resourceId: string;
  incidentId: string;
  status: string;
  resource: Resource;
}

interface ResourceManagerProps {
  incidentId: string;
  currentDeployments: Deployment[];
  availableResources: Resource[];
}

const TYPE_ICONS = {
  BOAT: <Anchor className="w-3.5 h-3.5" />,
  PUMP: <Activity className="w-3.5 h-3.5" />,
  AMBULANCE: <Ambulance className="w-3.5 h-3.5" />,
  VEHICLE: <Truck className="w-3.5 h-3.5" />,
  SANDBAGS: <Layers className="w-3.5 h-3.5" />,
  RELIEF_PACK: <Layers className="w-3.5 h-3.5" />,
};

export function ResourceManager({ incidentId, currentDeployments, availableResources }: ResourceManagerProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isReturning, setIsReturning] = useState<string | null>(null);

  const handleDeploy = async (resourceId: string) => {
    setIsDeploying(true);
    const result = await deployResourceAction(resourceId, incidentId);
    if (result.success) {
      toast.success("Resource deployed successfully");
    } else {
      toast.error(result.error || "Failed to deploy resource");
    }
    setIsDeploying(false);
  };

  const handleReturn = async (deploymentId: string, resourceId: string) => {
    setIsReturning(deploymentId);
    const result = await returnResourceAction(deploymentId, resourceId, incidentId);
    if (result.success) {
      toast.success("Resource marked as returned");
    } else {
      toast.error(result.error || "Failed to process return");
    }
    setIsReturning(null);
  };

  const activeDeployments = currentDeployments.filter(d => d.status === "ACTIVE");

  return (
    <Card className="bg-slate-900/50 border-slate-800 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 bg-slate-950/20 py-4">
        <div>
          <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            Resource Deployments
          </CardTitle>
          <CardDescription className="text-[10px]">Track equipment and assets assigned to this incident.</CardDescription>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" className="h-8 bg-teal-600 hover:bg-teal-500 gap-1.5 text-[10px]">
              <Plus className="w-3.5 h-3.5" />
              Deploy Asset
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0 bg-slate-900 border-slate-800 shadow-2xl z-[100]" align="end">
            <div className="p-3 border-b border-slate-800">
                <p className="text-xs font-bold text-slate-100 uppercase tracking-widest">Available Assets</p>
            </div>
            <div className="max-h-60 overflow-auto divide-y divide-slate-800">
                {availableResources.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 italic">No available assets found.</div>
                ) : (
                    availableResources.map(res => (
                        <div key={res.id} className="p-3 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold text-slate-200">{res.name}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    {TYPE_ICONS[res.type as keyof typeof TYPE_ICONS]}
                                    {res.type}
                                </div>
                            </div>
                            <Button 
                                size="sm" 
                                variant="ghost"
                                disabled={isDeploying}
                                onClick={() => handleDeploy(res.id)}
                                className="h-7 w-7 p-0 hover:bg-teal-500/20 hover:text-teal-400"
                            >
                                {isDeploying ? <Loader2 className="w-3 h-3 animate-spin"/> : <Navigation className="w-3.5 h-3.5" />}
                            </Button>
                        </div>
                    ))
                )}
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="pt-4 px-0">
        {activeDeployments.length === 0 ? (
            <div className="p-10 text-center space-y-2">
                <History className="w-8 h-8 text-slate-700 mx-auto opacity-30" />
                <p className="text-xs text-slate-500 italic">No active resources deployed for this situation.</p>
            </div>
        ) : (
            <div className="divide-y divide-slate-800">
                {activeDeployments.map((d) => (
                    <div key={d.id} className="px-4 py-3 flex items-center justify-between group hover:bg-slate-800/20 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 bg-slate-800 rounded-lg border border-slate-700 text-teal-400">
                                {TYPE_ICONS[d.resource.type as keyof typeof TYPE_ICONS]}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-200">{d.resource.name}</p>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                    <span className="font-mono text-slate-500 uppercase">{d.resource.serialNumber || 'S/N: '+d.resource.id.slice(0, 4)}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-teal-500" />
                                        In Operation
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={isReturning === d.id}
                            onClick={() => handleReturn(d.id, d.resource.id)}
                            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 h-8 gap-1.5"
                        >
                            {isReturning === d.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3.5 h-3.5" />}
                            <span className="text-[10px] font-bold uppercase">Return</span>
                        </Button>
                    </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
