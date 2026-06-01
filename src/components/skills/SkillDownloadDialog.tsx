import { useState } from "react";
import { z } from "zod";
import { Download } from "lucide-react";
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
  skillName: string;
  skillSlug: string;
  fileUrl: string | null;
}

export function SkillDownloadDialog({
  open,
  onOpenChange,
  skillName,
  skillSlug,
  fileUrl,
}: Props) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    if (!fileUrl) {
      toast.error("File not available yet.");
      return;
    }
    setBusy(true);

    // Save subscriber — ignore unique-violation gracefully
    const { error } = await supabase
      .from("skill_subscribers" as any)
      .insert({
        email: parsed.data,
        skill_slug: skillSlug,
        source: "skill_download",
      });
    if (error && (error as { code?: string }).code !== "23505") {
      // Non-fatal — still allow download, but log
      console.warn("skill_subscribers insert failed", error);
    }

    // Increment counter (non-fatal)
    try {
      await supabase.rpc("increment_skill_download" as any, {
        skill_slug: skillSlug,
      });
    } catch {
      /* non-fatal */
    }

    window.open(fileUrl, "_blank", "noopener,noreferrer");
    toast.success("Your download is starting.");
    setBusy(false);
    setEmail("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface-card border-foreground/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-[-0.01em] text-foreground">
            Get the skill
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Drop your email and we'll start your download of{" "}
            <span className="text-foreground font-medium">{skillName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="skill-download-email" className="text-foreground/80">
              Email
            </Label>
            <Input
              id="skill-download-email"
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
            <Download className="h-4 w-4" />
            {busy ? "Starting…" : "Download"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
