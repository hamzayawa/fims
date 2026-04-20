"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SOKOTO_LGAS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { createAlertAction } from "@/app/actions/alerts";
import { useState } from "react";

const alertSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
  targetLgas: z.array(z.string()).min(1, "Select at least one LGA"),
  expiresAt: z.string().optional(),
});

type FormValues = z.infer<typeof alertSchema>;

export function AlertForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: "",
      message: "",
      severity: "INFO",
      targetLgas: [],
      expiresAt: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    const result = await createAlertAction(values);
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Operational alert broadcasted!");
      router.push("/alerts");
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Alert Headline</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Flash Flood Warning: Goronyo Dam Area" 
                    className="h-12 bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-bold"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Severity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-bold">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border rounded-xl shadow-xl">
                      <SelectItem value="INFO" className="font-bold text-blue-600 focus:bg-blue-50 focus:text-blue-700 py-3">Information Broadcast</SelectItem>
                      <SelectItem value="WARNING" className="font-bold text-yellow-600 focus:bg-yellow-50 focus:text-yellow-700 py-3">Warning Advisory</SelectItem>
                      <SelectItem value="CRITICAL" className="font-bold text-red-600 focus:bg-red-50 focus:text-red-700 py-3">Critical / Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Expiration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                        type="datetime-local" 
                        {...field} 
                        className="h-12 bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-bold" 
                    />
                  </FormControl>
                  <FormDescription className="text-[10px] font-medium text-muted-foreground italic px-1">When the alert will be considered stale.</FormDescription>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Advisory Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide clear instructions for residents and field agents..." 
                    className="min-h-[160px] bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-medium leading-relaxed"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetLgas"
            render={() => (
              <FormItem className="space-y-5">
                <div className="px-1">
                  <FormLabel className="text-sm font-black text-foreground uppercase tracking-tight">Affected Regional Zones (LGAs)</FormLabel>
                  <FormDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 italic">Select one or more Local Government Areas intended for this broadcast.</FormDescription>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 border border-border rounded-2xl bg-muted/10 shadow-inner">
                  {SOKOTO_LGAS.map((lga) => (
                    <FormField
                      key={lga}
                      control={form.control}
                      name="targetLgas"
                      render={({ field }) => {
                        const isChecked = field.value?.includes(lga);
                        return (
                          <FormItem
                            key={lga}
                            className={cn(
                                "flex flex-row items-center space-x-3 space-y-0 p-2.5 rounded-xl border transition-all cursor-pointer",
                                isChecked ? "bg-primary/5 border-primary/20" : "bg-background border-transparent hover:border-border"
                            )}
                          >
                            <FormControl>
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, lga])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== lga
                                        )
                                      )
                                }}
                                className="rounded-md h-5 w-5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                            </FormControl>
                            <FormLabel className="text-xs font-black text-foreground/70 uppercase tracking-tight cursor-pointer flex-1">
                              {lga}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end items-center gap-4 pt-8 border-t border-border">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
            disabled={isPending}
            className="h-12 px-8 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-muted"
          >
            Cancel Broadcast
          </Button>
          <Button 
            type="submit" 
            disabled={isPending} 
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20 transition-all gap-2"
          >
            {isPending ? "Communicating..." : "Issue Regional Broadcast Alert"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
