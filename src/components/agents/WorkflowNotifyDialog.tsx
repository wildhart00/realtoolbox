import { useState } from "react";
import { z } from "zod";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email is too long")
  .email("Enter a valid email address");

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowName: string;
}

export function WorkflowNotifyDialog({ open, onOpenChange, workflowName }: Props) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setBusy(true);

    const { error } = await supabase
      .from("newsletter_subscribers" as any)
      .insert({
        email: parsed.data.toLowerCase(),
        source: "workflow_waitlist",
        workflow_name: workflowName,
      } as any);

    setBusy(false);

    // Treat duplicate as success
    if (error && (error as { code?: string }).code !== "23505") {
      toast.error(error.message);
      return;
    }

    toast.success("You're on the list. We'll email you when it's ready.");
    setEmail("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface-card border-foreground/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-[-0.01em] text-foreground">
            Get this workflow guide
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            We'll email you when the{" "}
            <span className="text-foreground font-medium">{workflowName}</span> build
            guide drops.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="workflow-notify-email" className="text-foreground/80">
              Email
            </Label>
            <Input
              id="workflow-notify-email"
              type="email"
              required
              autoFocus
              placeholder="you@brokerage.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              className="h-11 bg-background/60 border-foreground/15"
            />
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            disabled={busy}
            className="w-full gap-1.5"
          >
            <Bell className="h-4 w-4" />
            {busy ? "Adding…" : "Notify me"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
