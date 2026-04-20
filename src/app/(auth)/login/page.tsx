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

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message || "Failed to log in.");
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back!");
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
          <CardTitle className="text-3xl font-black text-center tracking-tight uppercase">FIMS Portal</CardTitle>
          <CardDescription className="text-center text-muted-foreground font-semibold">
            Sign in to access the Flood Information Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="officer@nema.gov.ng"
                        type="email"
                        className="bg-background border-border text-foreground focus-visible:ring-primary h-12 rounded-xl"
                        {...field}
                      />
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
                    <FormLabel className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        className="bg-background border-border text-foreground focus-visible:ring-primary h-12 rounded-xl"
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
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 mt-2 transition-all rounded-xl shadow-lg shadow-primary/20"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-muted-foreground font-semibold">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline transition-all"
            >
              Request Access
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
