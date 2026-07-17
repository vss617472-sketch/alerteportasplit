import * as React from "react";
import { useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVerifyAlert } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";

export default function VerifyPage() {
  const [, params] = useRoute("/verify/:token");
  const token = params?.token || "";
  const [location, setLocation] = useLocation();

  const { data, isLoading, isError, error } = useVerifyAlert(token, {
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  return (
    <Layout>
      <div className="container mx-auto max-w-lg px-4 pt-32 pb-24">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-mono text-2xl">Email Verification</CardTitle>
            <CardDescription>
              Verifying your subscription to PortaSplit Alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
            {isLoading && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-mono text-muted-foreground animate-pulse">
                  Verifying token...
                </p>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                  <XCircle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Verification Failed</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">
                    The verification link is invalid or has expired. Please try creating a new alert.
                  </p>
                </div>
              </div>
            )}

            {!isLoading && !isError && (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Radar Active!</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">
                    Your email has been verified. You will now receive alerts the instant PortaSplit is restocked.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 bg-muted/30 pt-6">
            <Button asChild variant="outline" className="font-mono w-full sm:w-auto">
              <Link href="/">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
