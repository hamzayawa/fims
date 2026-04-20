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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Incident Title</FormLabel>
                <FormControl>
                  <Input placeholder="Brief title of the flood incident" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lga"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local Government Area (LGA)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an LGA" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SOKOTO_LGAS.map((lga) => (
                      <SelectItem key={lga} value={lga}>
                        {lga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MODERATE">Moderate</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationDetails"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Specific Location Details</FormLabel>
                <FormControl>
                  <Input placeholder="Village name, street, landmarks..." {...field} />
                </FormControl>
                <FormDescription>Help responders find the exact location.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Detailed Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the situation, water level, blocked roads, etc." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="casualties"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Casualties</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displacedPersons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Displaced Persons</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Incident Report"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
