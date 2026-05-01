"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SOKOTO_LGAS, INCIDENT_SEVERITY, INCIDENT_STATUS } from "@/lib/constants";
import { getReportDataAction } from "@/app/actions/reports";
import { generateCSV, generatePDF } from "@/lib/report-utils";
import { toast } from "sonner";
import { FileDown, FileText, Filter, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ReportGenerator() {
  const [isPending, setIsPending] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [lga, setLga] = useState("ALL");
  const [severity, setSeverity] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  async function handleGenerate(format: "pdf" | "csv") {
    setIsPending(true);
    const result = await getReportDataAction({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      lga,
      severity,
      status
    });
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success && result.data) {
      if (format === "pdf") {
        generatePDF(result.data);
      } else {
        generateCSV(result.data);
      }
      toast.success(`${format.toUpperCase()} Report generated successfully!`);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-xl">
        <CardHeader className="border-b border-border bg-muted/5 py-7 px-8">
          <div className="flex items-center gap-3 mb-1.5">
             <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                <Filter className="w-5 h-5" />
             </div>
             <CardTitle className="text-xl font-black text-foreground uppercase tracking-tight">Report Configuration</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground font-bold text-xs uppercase tracking-widest pl-11">Configure the scope of the flood operational situational report.</CardDescription>
        </CardHeader>
        <CardContent className="pt-10 px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Date Range (Start)</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-11 justify-start text-left font-bold bg-background border-border rounded-xl shadow-sm hover:border-primary/50 transition-all",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                      {startDate ? format(startDate, "PPP") : <span>Pick starting date</span>}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0 border-border bg-popover rounded-2xl shadow-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Date Range (End)</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-11 justify-start text-left font-bold bg-background border-border rounded-xl shadow-sm hover:border-primary/50 transition-all",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                      {endDate ? format(endDate, "PPP") : <span>Pick ending date</span>}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0 border-border bg-popover rounded-2xl shadow-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">LGA Selection</Label>
              <Select value={lga} onValueChange={(val) => val && setLga(val)}>
                <SelectTrigger className="h-11 bg-background border-border rounded-xl shadow-sm hover:border-primary/50 transition-all font-bold">
                  <SelectValue placeholder="All LGAs" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl shadow-xl">
                  <SelectItem value="ALL" className="font-bold py-2.5">All Sokoto LGAs</SelectItem>
                  {SOKOTO_LGAS.map(l => (
                    <SelectItem key={l} value={l} className="font-bold py-2.5">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Severity Threshold</Label>
              <Select value={severity} onValueChange={(val) => val && setSeverity(val)}>
                <SelectTrigger className="h-11 bg-background border-border rounded-xl shadow-sm hover:border-primary/50 transition-all font-bold">
                  <SelectValue placeholder="Any Severity" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl shadow-xl">
                  <SelectItem value="ALL" className="font-bold py-2.5">All Severity Levels</SelectItem>
                  {INCIDENT_SEVERITY.map(s => (
                    <SelectItem key={s} value={s} className="font-bold py-2.5">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Lifecycle Status</Label>
              <Select value={status} onValueChange={(val) => val && setStatus(val)}>
                <SelectTrigger className="h-11 bg-background border-border rounded-xl shadow-sm hover:border-primary/50 transition-all font-bold">
                  <SelectValue placeholder="Any Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl shadow-xl">
                  <SelectItem value="ALL" className="font-bold py-2.5">Any System Status</SelectItem>
                  {INCIDENT_STATUS.map(s => (
                    <SelectItem key={s} value={s} className="font-bold py-2.5 uppercase text-[10px] tracking-widest">{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-5 pt-10 border-t border-border">
            <Button 
                onClick={() => handleGenerate("pdf")} 
                disabled={isPending}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-3 h-14 rounded-2xl shadow-lg shadow-primary/20 transition-all"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              Export Official PDF Report
            </Button>
            <Button 
                onClick={() => handleGenerate("csv")} 
                disabled={isPending}
                variant="outline"
                className="flex-1 border-border bg-background hover:bg-accent text-foreground font-black uppercase tracking-widest gap-3 h-14 rounded-2xl shadow-sm transition-all"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5 text-primary" />}
              Download Raw Dataset (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
