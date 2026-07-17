import * as React from "react";
import { useState } from "react";
import { useRoute, Link } from "wouter";
import { AlertTriangle, CheckCircle2, Loader2, BellOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeleteAlert } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";

export default function UnsubscribePage() {
  const [, params] = useRoute("/unsubscribe/:token");
  const token = params?.token || "";
  const [isSuccess, setIsSuccess] = useState(false);

  const deleteAlert = useDeleteAlert();

  const handleUnsubscribe = async () => {
    try {
      await deleteAlert.mutateAsync({ token });
      setIsSuccess(true);
    } catch (error) {
      // Error is handled via Toast globally usually, but we could also show local state
      console.error("Failed to unsubscribe", error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-lg px-4 pt-32 pb-24">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-mono text-2xl flex items-center justify-center gap-2">
              <BellOff className="h-6 w-6" /> Unsubscribe
            </CardTitle>
            <CardDescription>
              Stop receiving PortaSplit stock alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
            {isSuccess ? (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Successfully Unsubscribed</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">
                    You will no longer receive stock alerts for this product. You can subscribe again at any time.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Are you sure?</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">
                    You will lose your spot and won't be notified when PortaSplit comes back in stock.
                  </p>
                </div>
                
                {deleteAlert.isError && (
                  <p className="text-sm text-destructive font-mono mt-4">
                    Failed to unsubscribe. The link might be expired or invalid.
                  </p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-border/50 bg-muted/30 pt-6">
            {!isSuccess ? (
              <>
                <Button 
                  variant="destructive" 
                  className="font-mono w-full"
                  onClick={handleUnsubscribe}
                  disabled={deleteAlert.isPending}
                >
                  {deleteAlert.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    "Yes, Unsubscribe Me"
                  )}
                </Button>
                <Button asChild variant="outline" className="font-mono w-full">
                  <Link href="/">Cancel & Keep My Alerts</Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="default" className="font-mono w-full">
                <Link href="/">Return to Dashboard</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
