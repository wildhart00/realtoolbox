import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MailCheck, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Mode = "signin" | "signup" | "forgot" | "check-email";

const AuthPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialMode: Mode = params.get("mode") === "signup" ? "signup" : "signin";
  const next = params.get("next") || "/";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [unconfirmed, setUnconfirmed] = useState(false);

  useEffect(() => {
    if (user) navigate(next, { replace: true });
  }, [user, navigate, next]);

  const resendConfirmation = async (target: string) => {
    if (!target) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: target,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setResending(false);
    if (error) return toast.error(error.message);
    toast.success(`Confirmation email re-sent to ${target}`);
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUnconfirmed(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (/email not confirmed/i.test(error.message)) {
        setPendingEmail(email);
        setUnconfirmed(true);
        return;
      }
      return toast.error(error.message);
    }
    toast.success("Welcome back");
    navigate(next, { replace: true });
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to confirm your account.");
    setPendingEmail(email);
    setMode("check-email");
    setPassword("");
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Reset email sent");
    setMode("signin");
  };

  return (
    <AppLayout hideSidebar>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold">RealToolbox<span className="text-accent">.ai</span></span>
          </Link>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-elevated lg:p-8">
            {mode === "check-email" ? (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15">
                  <MailCheck className="h-7 w-7 text-accent" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight">Confirm your email</h1>
                  <p className="text-sm text-muted-foreground">
                    We sent a confirmation link to{" "}
                    <span className="font-medium text-foreground">{pendingEmail}</span>.
                    Click the link to activate your account, then come back to sign in.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Check your spam folder if it doesn't show up in a minute.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={resending}
                    onClick={() => resendConfirmation(pendingEmail)}
                  >
                    {resending ? "Sending..." : "Resend confirmation email"}
                  </Button>
                  <Button
                    type="button"
                    variant="accent"
                    className="w-full"
                    onClick={() => {
                      setUnconfirmed(false);
                      setMode("signin");
                    }}
                  >
                    Back to sign in
                  </Button>
                </div>
              </div>
            ) : mode === "forgot" ? (
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
                  <p className="text-sm text-muted-foreground">We'll email you a secure reset link.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button type="submit" variant="accent" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
                <button type="button" onClick={() => setMode("signin")} className="block w-full text-center text-xs text-muted-foreground hover:text-foreground">
                  Back to sign in
                </button>
              </form>
            ) : (
              <Tabs value={mode} onValueChange={(v) => { setUnconfirmed(false); setMode(v as Mode); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-6">
                  {unconfirmed && (
                    <Alert className="mb-4 border-accent/40 bg-accent/10">
                      <MailCheck className="h-4 w-4 text-accent" />
                      <AlertTitle>Please confirm your email</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>
                          You need to click the link we sent to{" "}
                          <span className="font-medium text-foreground">{pendingEmail}</span> before
                          signing in.
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={resending}
                          onClick={() => resendConfirmation(pendingEmail)}
                        >
                          {resending ? "Sending..." : "Resend confirmation email"}
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input id="signin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs text-accent hover:underline">
                          Forgot password?
                        </button>
                      </div>
                      <Input id="signin-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" variant="accent" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Display name</Label>
                      <Input id="signup-name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Jane Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                      <p className="text-xs text-muted-foreground">At least 6 characters.</p>
                    </div>
                    <Button type="submit" variant="accent" className="w-full" disabled={loading}>
                      {loading ? "Creating..." : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms and privacy policy.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default AuthPage;
