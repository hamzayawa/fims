import { ReportGenerator } from "@/components/report-generator";

export default function Reports() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">System Reporting Engine</h2>
        <p className="text-slate-400">Configure parameters to generate formal operational summaries and data exports.</p>
      </div>

      <ReportGenerator />
    </div>
  );
}
