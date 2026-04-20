"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Droplet, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Added select field later if needed, right now we just use a native select or shadcn select.
// For initial setup, we will allow creating only standard roles or viewers, later controlled by admins.
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(["ADMIN", "DATA_OFFICER", "FIELD_AGENT", "VIEWER"], {
    error: "Please select a role.",
  }),
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "VIEWER" },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    const { data, error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      role: values.role,
    } as any);

    if (error) {
      toast.error(error.message || "Failed to create account.");
      setIsLoading(false);
      return;
    }

    toast.success("Account created successfully!");
    router.push("/dashboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="border-border bg-background/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10 text-foreground">
        <CardHeader className="space-y-4 pb-8">
          <div className="mx-auto bg-primary/10 p-4 rounded-3xl border border-primary/20 mb-2">
            <Droplet className="w-10 h-10 text-primary fill-primary/20" />
          </div>
          <CardTitle className="text-3xl font-black text-center tracking-tight uppercase">FIMS Registration</CardTitle>
          <CardDescription className="text-center text-muted-foreground font-semibold">
            Create an official NEMA FIMS personnel account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest pl-1">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="bg-background border-border text-foreground focus-visible:ring-primary h-11 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive font-semibold text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest pl-1">Official Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="officer@nema.gov.ng"
                        type="email"
                        className="bg-background border-border text-foreground focus-visible:ring-primary h-11 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive font-semibold text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest pl-1">Requested Role</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="flex h-11 w-full items-center justify-between whitespace-nowrap rounded-xl border bg-background border-border px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 text-foreground font-medium"
                      >
                        <option value="VIEWER">Viewer (Reports & Analytics)</option>
                        <option value="FIELD_AGENT">Field Agent (Ground Reporting)</option>
                        <option value="DATA_OFFICER">Data Officer (Verification)</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-destructive font-semibold text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest pl-1">Strong Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        className="bg-background border-border text-foreground focus-visible:ring-primary h-11 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive font-semibold text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 mt-4 transition-all rounded-xl shadow-lg shadow-primary/20"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-muted-foreground font-semibold">
            Already registered?{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:underline transition-all"
            >
              Sign In to FIMS
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
