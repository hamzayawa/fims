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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2 space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Resource Name / Physical Label</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. SOK-BOAT-001, Industrial Water Pump A" 
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
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Resource Categorization</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-bold">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover border-border rounded-xl shadow-xl">
                    <SelectItem value="BOAT" className="font-bold py-2.5">Rescue Boat</SelectItem>
                    <SelectItem value="PUMP" className="font-bold py-2.5">Water Pump</SelectItem>
                    <SelectItem value="AMBULANCE" className="font-bold py-2.5">Ambulance</SelectItem>
                    <SelectItem value="VEHICLE" className="font-bold py-2.5">Utility Vehicle</SelectItem>
                    <SelectItem value="SANDBAGS" className="font-bold py-2.5">Sandbags (Bulk)</SelectItem>
                    <SelectItem value="RELIEF_PACK" className="font-bold py-2.5">Relief Packs</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Inventory Quantity</FormLabel>
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

          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Serial Number (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="S/N or Asset Tag ID" 
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
            name="currentLga"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Base Station / LGA (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-background border-border rounded-xl shadow-sm focus:ring-primary/20 font-bold">
                      <SelectValue placeholder="Current Location" />
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
        </div>

        <div className="flex justify-end items-center gap-4 pt-8 border-t border-border">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
            disabled={isPending}
            className="h-12 px-8 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-muted"
          >
            Cancel Registration
          </Button>
          <Button 
            type="submit" 
            disabled={isPending} 
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20 transition-all gap-2"
          >
            {isPending ? "Validating..." : "Register Asset to Inventory"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
