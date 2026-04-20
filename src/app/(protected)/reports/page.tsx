import { ReportGenerator } from "@/components/report-generator";

export default function Reports() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase tracking-wider">Operational Reporting Engine</h2>
        <p className="text-muted-foreground text-sm font-medium italic">Configure parameters to generate formal operational summaries and official data exports.</p>
      </div>

      <ReportGenerator />
    </div>
  );
}
