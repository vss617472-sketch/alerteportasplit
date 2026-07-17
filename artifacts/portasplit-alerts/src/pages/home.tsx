import * as React from "react";
import { Link } from "wouter";
import { 
  useGetProduct, 
  useGetStockMap, 
  useGetStockSummary, 
  useListPlans 
} from "@workspace/api-client-react";
import { 
  Radar, 
  Activity, 
  Store, 
  Clock, 
  Zap, 
  BellRing, 
  MapPin, 
  CheckCircle2 
} from "lucide-react";

import { Layout } from "@/components/layout";
import { StockMap } from "@/components/map/stock-map";
import { AlertForm } from "@/components/alerts/alert-form";
import { StoreList } from "@/components/store-list";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "react-day-picker";

const PRODUCT_ID = 1;

export default function HomePage() {
  const { data: product } = useGetProduct(PRODUCT_ID);
  const { data: mapData = [] } = useGetStockMap({ productId: PRODUCT_ID });
  const { data: summary } = useGetStockSummary({ productId: PRODUCT_ID });
  const { data: plans = [] } = useListPlans();

  const isOutOfStock = summary?.inStockCount === 0;

  return (
    <Layout>
      {/* Announcement Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs font-mono font-medium tracking-wide">
        <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
        SYSTEM ACTIVE: Be alerted the instant {product?.name || "PortaSplit"} comes back in stock.
      </div>

      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Title & Form */}
          <div className="space-y-8 flex flex-col justify-center min-h-[400px]">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-semibold font-mono text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Radar className="mr-1.5 h-3 w-3 text-primary" />
                Live Tracker
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                {product?.name || "Midea PortaSplit"}
                <span className="block text-muted-foreground mt-2 text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight">
                  Stock Radar
                </span>
              </h1>
              
              <div className="flex items-center gap-3 pt-2">
                <StatusBadge 
                  status={isOutOfStock ? "out_of_stock" : (summary?.inStockCount ? "in_stock" : "out_of_stock")} 
                  className="text-sm px-3 py-1.5"
                />
                <span className="text-sm font-mono text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-4 w-4" />
                  Monitored every {product?.checkIntervalSeconds ? product.checkIntervalSeconds / 60 : 5} min across France
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/0 rounded-xl blur opacity-30" />
              <AlertForm productId={PRODUCT_ID} plans={plans} />
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="h-[400px] lg:h-[600px] rounded-xl overflow-hidden shadow-2xl ring-1 ring-border relative group">
            <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur px-3 py-2 rounded border border-border shadow-sm flex items-center gap-2 font-mono text-xs">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              LIVE FEED
            </div>
            <StockMap points={mapData} />
          </div>

        </div>
      </section>

      {/* Stats Bar */}
      <div className="border-y border-border/50 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 divide-x divide-border/50">
            <div className="px-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tighter">
                {summary?.totalStores || 282}
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase mt-1 flex items-center justify-center gap-1">
                <Store className="h-3 w-3" /> Stores Monitored
              </div>
            </div>
            <div className="px-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tighter text-amber-500">
                {summary?.outOfStockCount || 0}
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase mt-1 flex items-center justify-center gap-1">
                Sold Out
              </div>
            </div>
            <div className="px-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tighter text-green-500">
                {summary?.inStockCount || 0}
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase mt-1 flex items-center justify-center gap-1">
                Units Available
              </div>
            </div>
            <div className="px-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tighter flex items-center justify-center">
                <Clock className="h-5 w-5 mr-2 text-primary" /> Live
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase mt-1 flex items-center justify-center gap-1">
                Update Frequency
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database View / Store List */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-mono">Terminal Directory</h2>
            <p className="text-muted-foreground mt-2">Filter and search the raw store database.</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
            Database Synced
          </Badge>
        </div>
        <StoreList productId={PRODUCT_ID} />
      </section>

      {/* How it works */}
      <section className="bg-muted py-16 md:py-24 border-y border-border/50 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              We run automated scripts 24/7 checking the stock of PortaSplit across hundreds of retail APIs so you don't have to.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background/50 border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Set Coordinates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tell us your postal code and how far you're willing to drive to pick up the unit.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background/50 border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. We Monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our servers ping the inventory systems of all major retailers every 5 minutes, 24 hours a day.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background/50 border-border/50 shadow-sm ring-1 ring-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4 text-primary-foreground">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle>3. Instant Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The second a unit appears in your radius, we fire an email to your inbox so you can checkout before anyone else.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24" id="pricing">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight font-mono">Select Duration</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Simple, one-time payments. No subscriptions, no hidden fees. Choose how long you want us to monitor for you.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <Card key={plan.id} className={`flex flex-col ${plan.popular ? 'border-primary ring-1 ring-primary shadow-lg scale-105 z-10' : ''}`}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-xs font-bold font-mono text-center py-1 uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-mono">{plan.name}</CardTitle>
                  <CardDescription>One-time payment</CardDescription>
                  <div className="text-4xl font-bold mt-4 font-mono">
                    €{plan.priceEur.toFixed(2)}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{plan.durationDays} days of 24/7 monitoring</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Checks every {plan.checkIntervalSeconds / 60} minutes</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Unlimited email alerts</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>All {summary?.totalStores || 282} stores covered</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full font-mono font-bold" variant={plan.popular ? "default" : "outline"}>
                    <a href="#alerts">Select {plan.name}</a>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-muted-foreground font-mono">
              Loading pricing plans...
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12 font-mono">FAQ</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold">How fast are the alerts?</h3>
            <p className="text-muted-foreground mt-2">
              We check the APIs of all supported retailers every 5 minutes. The instant our system detects positive stock, an email is dispatched within milliseconds.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Why do I have to pay for this?</h3>
            <p className="text-muted-foreground mt-2">
              Running high-frequency checks across 280+ store APIs requires significant server resources and proxy infrastructure to avoid being blocked. We charge a small one-time fee to cover these costs.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Can I cancel my alert?</h3>
            <p className="text-muted-foreground mt-2">
              Yes, every alert email contains a 1-click unsubscribe link. You will not be charged again regardless, as this is a strict one-time payment.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Is the checkout secure?</h3>
            <p className="text-muted-foreground mt-2">
              Yes. We use Polar.sh for all payment processing. We never see or store your credit card information.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
