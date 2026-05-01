import { AccessRequestForm } from "@/components/auth/access-request-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <Link 
        href="/login" 
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
      >
        <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
        Back to Sign In
      </Link>

      <div className="bg-background/60 backdrop-blur-2xl border border-border/40 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5">
        <AccessRequestForm />
      </div>

      <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        &copy; 2026 Sokoto State Disaster Management Agency
      </p>
    </div>
  );
}
