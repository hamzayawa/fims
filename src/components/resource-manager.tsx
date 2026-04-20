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
  return (
    <Card className="bg-card border-border shadow-xl relative overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/5 py-5 px-6">
        <div>
          <CardTitle className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Operational Assets
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 italic">Track equipment and assets assigned to this incident.</CardDescription>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" className="h-9 px-4 bg-primary hover:bg-primary/90 gap-2 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20 transition-all">
              <Plus className="w-3.5 h-3.5" />
              Deploy Asset
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-popover border-border rounded-2xl shadow-2xl z-[100] mt-2" align="end">
            <div className="p-4 border-b border-border bg-muted/30">
                <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Available Operations Inventory</p>
            </div>
            <div className="max-h-72 overflow-auto divide-y divide-border/50">
                {availableResources.length === 0 ? (
                    <div className="p-10 text-center space-y-3">
                        <History className="w-10 h-10 text-muted-foreground mx-auto opacity-20" />
                        <p className="text-xs text-muted-foreground font-bold italic">No available assets found in regional inventory.</p>
                    </div>
                ) : (
                    availableResources.map(res => (
                        <div key={res.id} className="p-4 flex items-center justify-between group/item hover:bg-primary/[0.03] transition-colors cursor-pointer">
                            <div className="space-y-1">
                                <p className="text-sm font-black text-foreground tracking-tight">{res.name}</p>
                                <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                    <span className="p-1 bg-muted rounded border border-border">{TYPE_ICONS[res.type as keyof typeof TYPE_ICONS]}</span>
                                    {res.type.replace('_', ' ')}
                                </div>
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline"
                                disabled={isDeploying}
                                onClick={() => handleDeploy(res.id)}
                                className="h-9 w-9 p-0 rounded-xl border-border hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all group-hover/item:scale-110"
                            >
                                {isDeploying ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Navigation className="w-4 h-4" />}
                            </Button>
                        </div>
                    ))
                )}
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="p-0">
        {activeDeployments.length === 0 ? (
            <div className="p-14 text-center space-y-4">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto border border-border">
                    <History className="w-8 h-8 text-muted-foreground opacity-30" />
                </div>
                <p className="text-xs text-muted-foreground font-bold italic px-8">No active resources currently deployed for this situational report.</p>
            </div>
        ) : (
            <div className="divide-y divide-border">
                {activeDeployments.map((d) => (
                    <div key={d.id} className="px-6 py-5 flex items-center justify-between group hover:bg-emerald-50/[0.03] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-primary/10 rounded-2xl border border-primary/20 text-primary flex items-center justify-center shadow-sm">
                                {TYPE_ICONS[d.resource.type as keyof typeof TYPE_ICONS]}
                            </div>
                            <div>
                                <p className="text-sm font-black text-foreground tracking-tight">{d.resource.name}</p>
                                <div className="flex items-center gap-3 mt-1 text-[9px] font-black">
                                    <span className="text-muted-foreground uppercase tracking-widest opacity-60">ID: {d.resource.serialNumber || d.resource.id.slice(0, 8)}</span>
                                    <span className="text-border">|</span>
                                    <span className="flex items-center gap-1.5 text-emerald-600 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Operational
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={isReturning === d.id}
                            onClick={() => handleReturn(d.id, d.resource.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 px-4 rounded-xl gap-2 transition-all border border-transparent hover:border-destructive/20"
                        >
                            {isReturning === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">Return Asset</span>
                        </Button>
                    </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
