"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitAccessRequestAction } from "@/app/actions/access-requests";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const accessRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  organization: z.string().optional(),
  purpose: z.string().min(10, "Please provide a more detailed reason for access (min 10 characters)."),
});

type AccessRequestValues = z.infer<typeof accessRequestSchema>;

export function AccessRequestForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<AccessRequestValues>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      organization: "",
      purpose: "",
    },
  });

  async function onSubmit(data: AccessRequestValues) {
    setIsPending(true);
    setError(null);
    
    try {
      const result = await submitAccessRequestAction(data);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="bg-green-500/10 p-4 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-foreground">Request Received</h2>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto">
            Your application for FIMS access has been submitted successfully. 
            An administrator will review your request and contact you via email shortly.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-xl font-bold uppercase tracking-widest text-[11px]"
          onClick={() => window.location.href = "/"}
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">Request Access</h1>
        <p className="text-muted-foreground font-medium">
          Apply for an official account to access the FIMS operational dashboard.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex gap-3 text-destructive text-sm font-medium animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. John Doe" 
                      className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-all"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Work Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="name@agency.gov.ng" 
                      className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-all"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Organization / Agency</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Sokoto SEMA, Red Cross, etc." 
                    className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-all"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Intended Use of Portal</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Briefly describe why you need access (e.g. Incident reporting, Resource management...)" 
                    className="min-h-[120px] rounded-2xl border-border/50 bg-muted/30 focus:bg-background transition-all resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
