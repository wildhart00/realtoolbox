import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SetupAdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState<boolean>(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?next=/setup-admin", { replace: true });
      return;
    }
    (async () => {
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      setAdminExists((count ?? 0) > 0);
      setChecking(false);
    })();
  }, [user, authLoading, navigate]);

  const claim = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_first_admin");
    setClaiming(false);
    if (error) return toast.error(error.message);
    if (data === true) {
      toast.success("You are now an admin.");
      navigate("/admin", { replace: true });
    } else {
      toast.error("An admin already exists.");
      setAdminExists(true);
    }
  };

  return (
    <AppLayout hideSidebar>
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center shadow-elevated">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Admin setup</h1>

          {checking || authLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Checking…</p>
          ) : adminExists ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                An admin has already been assigned for this site. Contact them for access.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/">Back to home</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                No admin exists yet. Claim the admin role for <span className="font-medium text-foreground">{user?.email}</span>.
                This can only be done once.
              </p>
              <Button onClick={claim} disabled={claiming} variant="accent" className="mt-6 w-full">
                {claiming ? "Claiming…" : "Make me admin"}
              </Button>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SetupAdminPage;
