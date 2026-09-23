import { useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button, Card, Skeleton } from "@/components/ui/kit";
import { useApp } from "@/store/app";

/** Protected-route gate — login is stored in localStorage, so we wait for hydration. */
export function RequireAuth({ children, title = "Login required" }: { children: ReactNode; title?: string }) {
  const { user, ready, openAuth } = useApp();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !user) openAuth(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  if (!ready) {
    return (
      <div className="shell space-y-4 py-16">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="shell py-24">
        <Card className="mx-auto max-w-md py-14 text-center">
          <Lock className="mx-auto h-8 w-8 text-accent" />
          <h1 className="mt-4 text-2xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue — you'll come right back here.</p>
          <Button className="mt-6" onClick={() => openAuth(path)}>Login / Signup</Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
