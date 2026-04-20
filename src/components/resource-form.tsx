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
import { createResourceAction } from "@/app/actions/resources";
import { useState } from "react";

const resourceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["BOAT", "PUMP", "AMBULANCE", "VEHICLE", "SANDBAGS", "RELIEF_PACK"]),
  serialNumber: z.string().optional().or(z.literal("")),
  quantity: z.coerce.number().min(1).default(1),
  currentLga: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof resourceSchema>;

const SOKOTO_LGAS = [
  "Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa",
  "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari",
  "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza",
  "Tureta", "Wamako", "Wurno", "Yabo"
].sort();

export function ResourceForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: "",
      type: "BOAT",
      serialNumber: "",
      quantity: 1,
      currentLga: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    // Ensure empty strings are handled if expected as optional/null by the action
    const cleanedValues = {
        ...values,
        serialNumber: values.serialNumber || undefined,
        currentLga: values.currentLga || undefined,
    };
    
    const result = await createResourceAction(cleanedValues as any);
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Resource registered successfully!");
      router.push("/resources");
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Resource Name / Label</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. SOK-BOAT-001, Industrial Water Pump A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BOAT">Rescue Boat</SelectItem>
                    <SelectItem value="PUMP">Water Pump</SelectItem>
                    <SelectItem value="AMBULANCE">Ambulance</SelectItem>
                    <SelectItem value="VEHICLE">Utility Vehicle</SelectItem>
                    <SelectItem value="SANDBAGS">Sandbags (Bulk)</SelectItem>
                    <SelectItem value="RELIEF_PACK">Relief Packs</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity / Unit Count</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="S/N or Asset Tag" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentLga"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stationed LGA (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Current Location" />
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
          <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-500">
            {isPending ? "Registering..." : "Register Resource"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
