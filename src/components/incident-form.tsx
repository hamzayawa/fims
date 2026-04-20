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
import { createIncidentAction } from "@/app/actions/incidents";
import { useState } from "react";

const incidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  lga: z.string().min(1, "LGA is required"),
  locationDetails: z.string().optional(),
  severity: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
  casualties: z.coerce.number().min(0),
  displacedPersons: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof incidentSchema>;

const SOKOTO_LGAS = [
  "Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa",
  "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari",
  "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza",
  "Tureta", "Wamako", "Wurno", "Yabo"
].sort();

export function IncidentForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: "",
      description: "",
      lga: "",
      locationDetails: "",
      severity: "LOW",
      casualties: 0,
      displacedPersons: 0,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    const result = await createIncidentAction(values);
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Incident reported successfully!");
      router.push("/incidents");
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2 space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Incident Headline</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Brief title of the flood incident" 
                    className="h-12 bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-bold"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lga"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Local Government Area (LGA)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-bold">
                      <SelectValue placeholder="Select an LGA" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover border-border rounded-xl shadow-xl">
                    {SOKOTO_LGAS.map((lga) => (
                      <SelectItem key={lga} value={lga} className="font-bold py-2.5">
                        {lga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

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
                    <SelectItem value="LOW" className="font-bold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 py-2.5">Low Impact</SelectItem>
                    <SelectItem value="MODERATE" className="font-bold text-yellow-600 focus:bg-yellow-50 focus:text-yellow-700 py-2.5">Moderate Warning</SelectItem>
                    <SelectItem value="HIGH" className="font-bold text-orange-600 focus:bg-orange-50 focus:text-orange-700 py-2.5">High Severity</SelectItem>
                    <SelectItem value="CRITICAL" className="font-bold text-red-600 focus:bg-red-50 focus:text-red-700 py-2.5">Critical Emergency</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationDetails"
            render={({ field }) => (
              <FormItem className="md:col-span-2 space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Specific Location Details</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Village name, street, landmarks..." 
                    className="h-12 bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-bold"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-[10px] font-medium text-muted-foreground italic px-1">Help responders find the exact location of the event.</FormDescription>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2 space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Detailed Situational Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the situation, water level, blocked roads, or infrastructure damage..." 
                    className="min-h-[140px] bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-medium leading-relaxed"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="casualties"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Number of Casualties</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    className="h-12 bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-black text-destructive"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displacedPersons"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Number of Displaced Persons</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    className="h-12 bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-black text-primary"
                    {...field} 
                  />
                </FormControl>
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
            Discard Report
          </Button>
          <Button 
            type="submit" 
            disabled={isPending} 
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20 transition-all gap-2"
          >
            {isPending ? "Transmitting..." : "Submit official Incident Report"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
