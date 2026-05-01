"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserPlus, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createUserAction } from "@/app/actions/users";
import { approveAccessRequestAction } from "@/app/actions/access-requests";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["ADMIN", "DATA_OFFICER", "FIELD_AGENT", "VIEWER"]),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const ROLE_OPTIONS = [
  { value: "VIEWER", label: "Viewer", description: "Reports & Analytics only" },
  { value: "FIELD_AGENT", label: "Field Agent", description: "Ground reporting" },
  { value: "DATA_OFFICER", label: "Data Officer", description: "Verification & management" },
  { value: "ADMIN", label: "Administrator", description: "Full system access" },
] as const;

export function CreateUserDialog({ 
  initialData, 
  trigger,
  requestId
}: { 
  initialData?: { name: string; email: string };
  trigger?: React.ReactNode;
  requestId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      role: "VIEWER",
    },
  });

  async function onSubmit(values: CreateUserFormValues) {
    setIsLoading(true);
    let result;
    
    if (requestId) {
      result = await approveAccessRequestAction(requestId, values);
    } else {
      result = await createUserAction(values);
    }
    
    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(requestId ? "Request approved and user created!" : `User "${values.name}" created successfully!`);
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            id="create-user-btn"
            className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20 rounded-xl px-5 h-10 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Personnel
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] bg-background border-border shadow-2xl rounded-2xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-foreground uppercase">
                Create Personnel Account
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-semibold mt-0.5">
                Admin-only. New account will be immediately active.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground font-black uppercase text-[10px] tracking-widest pl-1">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="new-user-name"
                      placeholder="John Doe"
                      className="bg-muted/30 border-border text-foreground focus-visible:ring-primary h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive font-semibold text-xs" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground font-black uppercase text-[10px] tracking-widest pl-1">
                    Official Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="new-user-email"
                      placeholder="officer@nema.gov.ng"
                      type="email"
                      className="bg-muted/30 border-border text-foreground focus-visible:ring-primary h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive font-semibold text-xs" />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground font-black uppercase text-[10px] tracking-widest pl-1">
                    Assigned Role
                  </FormLabel>
                  <FormControl>
                    <select
                      id="new-user-role"
                      {...field}
                      className="flex h-11 w-full items-center whitespace-nowrap rounded-xl border bg-muted/30 border-border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-medium"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} — {opt.description}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage className="text-destructive font-semibold text-xs" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground font-black uppercase text-[10px] tracking-widest pl-1">
                    Temporary Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="new-user-password"
                        placeholder="Min. 8 characters"
                        type={showPassword ? "text" : "password"}
                        className="bg-muted/30 border-border text-foreground focus-visible:ring-primary h-11 rounded-xl pr-11"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive font-semibold text-xs" />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { form.reset(); setOpen(false); }}
                className="flex-1 h-11 rounded-xl border-border font-bold"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
