import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, MapPin, Mail, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCreateAlert, useCreateCheckout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  postalCode: z.string().min(4, "Postal code required").max(10),
  radiusKm: z.coerce.number().min(5).max(100),
  planId: z.string().min(1, "Please select a plan"),
});

type FormValues = z.infer<typeof formSchema>;

interface AlertFormProps {
  productId?: number;
  plans: any[];
}

export function AlertForm({ productId = 1, plans = [] }: AlertFormProps) {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const createAlert = useCreateAlert();
  const createCheckout = useCreateCheckout();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      postalCode: "",
      radiusKm: 20,
      planId: plans.length > 0 ? plans[0].id : "plan_1week",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      // Create the alert subscription
      await createAlert.mutateAsync({
        data: {
          email: data.email,
          productId,
          postalCode: data.postalCode,
          radiusKm: data.radiusKm,
          planId: data.planId,
        }
      });
      
      // Attempt to initiate checkout
      try {
        const result = await createCheckout.mutateAsync({
          data: {
            email: data.email,
            planId: data.planId,
            productId,
          }
        });
        
        if (result && result.checkoutUrl) {
          // Redirect to Polar.sh checkout
          window.location.href = result.checkoutUrl;
          return;
        }
      } catch (checkoutErr) {
        console.error("Checkout failed to initiate", checkoutErr);
        // Fall back to success message if checkout fails
      }
      
      setIsSuccess(true);
      toast({
        title: "Alert created!",
        description: "Check your email to confirm your subscription.",
      });
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating alert",
        description: "Please try again later.",
      });
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full border-green-500/30 bg-green-500/5">
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-mono text-foreground">Alert Created</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              We've sent a confirmation link to your email address. Please click it to activate your alerts.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsSuccess(false)} className="mt-4 font-mono text-xs">
            Create another alert
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-primary/20" id="alerts">
      <CardHeader className="bg-muted/50 border-b border-border/50 pb-6">
        <CardTitle className="font-mono flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Activate Radar
        </CardTitle>
        <CardDescription className="text-sm">
          Get an email the instant PortaSplit stock is detected near you.
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 pt-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase text-muted-foreground">Target Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="you@example.com" className="pl-9 font-mono" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase text-muted-foreground">Location (Postal)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g. 75001" className="pl-9 font-mono uppercase" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="radiusKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase text-muted-foreground">Search Radius</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(parseInt(val, 10))} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="font-mono">
                          <SelectValue placeholder="Select radius" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5">5 km</SelectItem>
                        <SelectItem value="10">10 km</SelectItem>
                        <SelectItem value="20">20 km</SelectItem>
                        <SelectItem value="50">50 km</SelectItem>
                        <SelectItem value="100">100 km</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase text-muted-foreground">Monitoring Duration</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="font-mono h-14">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id} className="py-3">
                          <div className="flex justify-between w-full pr-4 gap-4">
                            <span className="font-bold">{plan.name}</span>
                            <span className="text-muted-foreground">€{plan.priceEur.toFixed(2)}</span>
                          </div>
                        </SelectItem>
                      ))}
                      {plans.length === 0 && (
                        <>
                          <SelectItem value="plan_1week">1 Week (24/7) - €4.90</SelectItem>
                          <SelectItem value="plan_1month">1 Month (24/7) - €9.90</SelectItem>
                          <SelectItem value="plan_2months">2 Months (24/7) - €14.90</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    One-time payment. No auto-renewal.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="bg-muted/50 border-t border-border/50 py-4">
            <Button 
              type="submit" 
              className="w-full font-mono text-sm uppercase tracking-wider font-bold h-12"
              disabled={createAlert.isPending || createCheckout.isPending}
            >
              {createAlert.isPending || createCheckout.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Activate Alerts"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
