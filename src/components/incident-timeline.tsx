"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addIncidentUpdateAction } from "@/app/actions/incidents";
import { Loader2, Send, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Update {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name: string;
    role: string;
    image: string | null;
  };
}

interface IncidentTimelineProps {
  incidentId: string;
  updates: Update[];
  canAddUpdate: boolean;
}

export function IncidentTimeline({ incidentId, updates, canAddUpdate }: IncidentTimelineProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const result = await addIncidentUpdateAction({ incidentId, content });
    
    if (result.success) {
      toast.success("Situational update added");
      setContent("");
    } else {
      toast.error(result.error || "Failed to add update");
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="bg-card border-border shadow-xl relative overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/5 py-5 px-6">
        <div>
          <CardTitle className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Operational Timeline
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 italic">
            Chronological situational updates and logs.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {canAddUpdate && (
          <div className="p-6 border-b border-border bg-muted/10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea 
                placeholder="Log a situational update or observation..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-border/50 focus:border-primary/50 text-sm font-medium transition-all"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !content.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] h-9 px-6 shadow-lg shadow-primary/20 transition-all gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit Update
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="p-6">
          {updates.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto border border-border">
                <History className="w-8 h-8 text-muted-foreground opacity-30" />
              </div>
              <p className="text-xs text-muted-foreground font-bold italic">No situational updates logged yet.</p>
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
              {updates.map((update, idx) => (
                <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                    {update.author.image ? (
                      <img src={update.author.image} alt={update.author.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Content Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-muted/30 border border-border/50 shadow-sm transition-all hover:bg-muted/50 hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-sm font-black text-foreground tracking-tight block">{update.author.name}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">{update.author.role.replace("_", " ")}</span>
                      </div>
                      <time className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {format(new Date(update.createdAt), "MMM d, HH:mm")}
                      </time>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium leading-relaxed">
                      {update.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
