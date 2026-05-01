import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Droplet, 
  ShieldCheck, 
  Map as MapIcon, 
  Bell, 
  ArrowRight, 
  Activity,
  Layers,
  Users
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // If already logged in, send to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <Droplet className="w-6 h-6 text-white fill-white/20" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">FIMS Portal</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Capabilities</Link>
            <Link href="#mission" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Our Mission</Link>
            <div className="h-4 w-[1px] bg-border" />
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-sm uppercase tracking-widest">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-white font-black px-6 rounded-xl shadow-lg shadow-primary/20 uppercase tracking-widest text-[11px] h-11">
                Request Access
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 overflow-hidden">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Official Government Portal</span>
                </div>
                
                <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-[0.9] text-foreground animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
                  Securing Sokoto's <br />
                  <span className="text-primary italic">Future</span> Against <br />
                  Flood Disasters.
                </h1>

                <p className="text-xl text-muted-foreground font-medium max-w-lg leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                  The Flood Information Management System (FIMS) provides real-time situational awareness, predictive risk analytics, and coordinated response logistics for Sokoto State.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                  <Link href="/login">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-black px-8 py-7 rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-widest text-xs gap-3 group">
                      Enter Operational Portal
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" className="border-border hover:bg-muted font-black px-8 py-7 rounded-2xl uppercase tracking-widest text-xs">
                      Explore Capabilities
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-6 pt-8 animate-in fade-in duration-1000 delay-700">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span className="text-foreground">200+</span> Authorized Responders
                  </p>
                </div>
              </div>

              <div className="relative animate-in fade-in zoom-in duration-1000 delay-300">
                <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-3xl" />
                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border border-border shadow-2xl bg-muted/50">
                  <Image 
                    src="/images/hero.png" 
                    alt="FIMS Hero" 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
                
                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 -left-6 bg-background/80 backdrop-blur-xl p-6 rounded-3xl border border-border shadow-xl space-y-3 animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500/20 p-2 rounded-xl">
                      <Activity className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Status</p>
                      <p className="text-sm font-black uppercase text-foreground">Operational</p>
                    </div>
                  </div>
                  <div className="h-[1px] bg-border w-full" />
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Live Updates: <span className="text-primary">ACTIVE</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-muted/20 relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em]">Core Intelligence</h2>
              <h3 className="text-5xl font-black tracking-tight text-foreground">State-of-the-Art <br /> Flood Management.</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "GIS Mapping",
                  desc: "Real-time geospatial visualization of incident density and risk levels across all LGAs.",
                  icon: MapIcon,
                  color: "blue"
                },
                {
                  title: "Instant Alerts",
                  desc: "Automated broadcast system for critical flood warnings to all field personnel and agencies.",
                  icon: Bell,
                  color: "red"
                },
                {
                  title: "Resource Tracking",
                  desc: "Centralized inventory for boats, pumps, and relief materials with live deployment status.",
                  icon: Layers,
                  color: "teal"
                }
              ].map((f, i) => (
                <div key={i} className="bg-background border border-border p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                  <div className={`bg-primary/10 p-4 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-2xl font-black tracking-tight mb-4 text-foreground">{f.title}</h4>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2" />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-8">Ready to Secure <br /> the Frontlines?</h2>
            <p className="text-xl text-primary-foreground/80 font-medium max-w-2xl mx-auto mb-12">
              Join the coordinated effort to protect lives and properties. FIMS is the unified platform for all response agencies in Sokoto State.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-black px-10 py-8 rounded-2xl shadow-2xl shadow-black/20 uppercase tracking-widest text-xs">
                  Request Agency Access
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-black px-10 py-8 rounded-2xl uppercase tracking-widest text-xs">
                  Official Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5 opacity-50">
            <Droplet className="w-5 h-5" />
            <span className="font-black tracking-tighter uppercase text-sm">FIMS Portal 2026</span>
          </div>
          
          <div className="flex items-center gap-8">
            <Link href="#" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary">Terms of Use</Link>
            <Link href="#" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary">Support</Link>
          </div>

          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Sokoto State Disaster Management Agency
          </p>
        </div>
      </footer>
    </div>
  );
}
