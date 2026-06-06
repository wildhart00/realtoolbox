import { useEffect, useState } from "react";
import { z } from "zod";
import { Download, Mail } from "lucide-react";
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
import { cn } from "@/lib/utils";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email is too long")
  .email("Enter a valid email address");

export type CaptureMode = "free-skill" | "early-access";
export type StageKey = "first" | "active" | "scaling";

const STAGE_OPTIONS: { key: StageKey; label: string; value: string }[] = [
  { key: "first", label: "Working on my first deal", value: "first_deal" },
  { key: "active", label: "Actively flipping or investing", value: "actively_investing" },
  { key: "scaling", label: "Scaling a team & operations", value: "scaling" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CaptureMode;
  source: string;
  initialStage?: StageKey;
  onSuccess?: () => void;
  suppressDefaultDownload?: boolean;
}

export function CaptureDialog({
  open,
  onOpenChange,
  mode,
  source,
  initialStage,
  onSuccess,
  suppressDefaultDownload,
}: Props) {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<StageKey | null>(initialStage ?? null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setStage(initialStage ?? null);
      setDone(false);
      setEmail("");
    }
  }, [open, initialStage]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setBusy(true);

    const investor_stage = stage
      ? STAGE_OPTIONS.find((s) => s.key === stage)?.value ?? null
      : null;

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data, source, investor_stage });

    if (error && (error as { code?: string }).code !== "23505") {
      console.warn("newsletter_subscribers insert failed", error);
      toast.error("Something went wrong. Please try again.");
      setBusy(false);
      return;
    }

    if (mode === "free-skill" && !suppressDefaultDownload) {
      const { data: skill } = await supabase
        .from("skills" as any)
        .select("file_url")
        .eq("slug", "deal-screen")
        .maybeSingle();
      const fileUrl = (skill as { file_url?: string | null } | null)?.file_url;
      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error("File not available yet.");
      }
    }

    setDone(true);
    setBusy(false);
    onSuccess?.();
  }

  const heading =
    mode === "free-skill" ? "Get the free Deal Screen" : "Join the early-access list";
  const description =
    mode === "free-skill"
      ? "Drop your email and we'll start your download."
      : "We'll email you when these tools go live.";
  const successMessage =
    mode === "free-skill"
      ? "Downloaded — load it into ChatGPT, Claude, or Gemini and start screening deals."
      : "You're on the list — we'll email you when these tools go live.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface-card border-foreground/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-[-0.01em] text-foreground">
            {heading}
          </DialogTitle>
          {!done && (
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {done ? (
          <div className="mt-2 space-y-4">
            <p className="text-[14.5px] text-foreground/85 leading-relaxed">
              {successMessage}
            </p>
            <Button
              type="button"
              variant="hero"
              size="lg"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="capture-email" className="text-foreground/80">
                Email
              </Label>
              <Input
                id="capture-email"
                type="email"
                required
                autoFocus
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="h-11 bg-background/60 border-foreground/15"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/80">
                Where are you right now?{" "}
                <span className="text-muted-foreground/70 font-normal">(optional)</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {STAGE_OPTIONS.map((opt) => {
                  const active = stage === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setStage(active ? null : opt.key)}
                      disabled={busy}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-[12.5px] font-medium border transition-base",
                        active
                          ? "bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] text-white border-transparent shadow-md shadow-[hsl(252_84%_50%)]/25"
                          : "bg-background/40 text-foreground/75 border-foreground/15 hover:border-[hsl(239_84%_67%)]/45 hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              disabled={busy}
              className="w-full gap-1.5"
            >
              {mode === "free-skill" ? (
                <Download className="h-4 w-4" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {busy
                ? "Submitting…"
                : mode === "free-skill"
                  ? "Get the Deal Screen"
                  : "Join the list"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
