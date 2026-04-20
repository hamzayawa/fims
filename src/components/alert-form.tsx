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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alert Headline</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Flash Flood Warning: Goronyo Dam Area" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INFO" className="text-blue-400">Information</SelectItem>
                      <SelectItem value="WARNING" className="text-yellow-500">Warning</SelectItem>
                      <SelectItem value="CRITICAL" className="text-red-500">Critical / Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} className="bg-slate-950" />
                  </FormControl>
                  <FormDescription>When the alert will be considered stale.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advisory Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide clear instructions for residents and field agents..." 
                    className="min-h-[150px] bg-slate-950/50"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetLgas"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base text-slate-200">Targeted LGAs</FormLabel>
                  <FormDescription>Select the Local Government Areas affected by this alert.</FormDescription>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border border-slate-800 rounded-xl bg-slate-950/30">
                  {SOKOTO_LGAS.map((lga) => (
                    <FormField
                      key={lga}
                      control={form.control}
                      name="targetLgas"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={lga}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(lga)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, lga])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== lga
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal text-slate-400 cursor-pointer">
                              {lga}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-500 text-white">
            {isPending ? "Broadcasting..." : "Issue Broadcast Alert"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
