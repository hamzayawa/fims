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
      <Card className="bg-slate-900/50 border-slate-800 shadow-xl backdrop-blur-sm">
        <CardHeader className="border-b border-slate-800/50 pb-6">
          <div className="flex items-center gap-2 mb-1">
             <Filter className="w-4 h-4 text-teal-400" />
             <CardTitle className="text-lg">Report Filters</CardTitle>
          </div>
          <CardDescription>Configure the scope of the flood operational report.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-400">Date Range (Start)</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-slate-950/50 border-slate-800",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick starting date</span>}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0 border-slate-800 bg-slate-900" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400">Date Range (End)</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-slate-950/50 border-slate-800",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick ending date</span>}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0 border-slate-800 bg-slate-900" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400">LGA Filter</Label>
              <Select value={lga} onValueChange={setLga}>
                <SelectTrigger className="bg-slate-950/50 border-slate-800">
                  <SelectValue placeholder="All LGAs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sokoto LGAs</SelectItem>
                  {SOKOTO_LGAS.map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400">Severity Level</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="bg-slate-950/50 border-slate-800">
                  <SelectValue placeholder="Any Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Severities</SelectItem>
                  {INCIDENT_SEVERITY.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400">Current Phase/Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-slate-950/50 border-slate-800">
                  <SelectValue placeholder="Any Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {INCIDENT_STATUS.map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-800">
            <Button 
                onClick={() => handleGenerate("pdf")} 
                disabled={isPending}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white gap-2 h-11"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Generate Official PDF
            </Button>
            <Button 
                onClick={() => handleGenerate("csv")} 
                disabled={isPending}
                variant="outline"
                className="flex-1 border-slate-700 bg-slate-800/50 hover:bg-slate-800 gap-2 h-11"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Export Data as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
