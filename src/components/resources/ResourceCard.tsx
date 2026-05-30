import { Link } from "react-router-dom";
import {
  BookOpen,
  Sparkles,
  FileText,
  Video as VideoIcon,
  Download,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type ResourceType = "guide" | "prompt-library" | "template" | "video" | "download";
export type AccessLevel = "free" | "email-gated" | "premium";

export interface ResourceRow {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  access_level: string;
  file_url: string | null;
  cover_image_url: string | null;
  created_at?: string;
}

const typeMeta: Record<
  ResourceType,
  { label: string; badge: string; icon: LucideIcon }
> = {
  guide: {
    label: "Guide",
    badge: "bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25",
    icon: BookOpen,
  },
  "prompt-library": {
    label: "Prompt Library",
    badge: "bg-[hsl(265_84%_75%/0.12)] text-[hsl(265_84%_82%)] border-[hsl(265_84%_75%/0.25)]",
    icon: Sparkles,
  },
  template: {
    label: "Template",
    badge: "bg-success/15 text-success border-success/25",
    icon: FileText,
  },
  video: {
    label: "Video",
    badge: "bg-orange-400/10 text-orange-300 border-orange-400/25",
    icon: VideoIcon,
  },
  download: {
    label: "Download",
    badge: "bg-yellow-400/10 text-yellow-300 border-yellow-400/25",
    icon: Download,
  },
};

const accessMeta: Record<AccessLevel, { label: string; badge: string }> = {
  free: { label: "Free", badge: "bg-success/15 text-success border-success/25" },
  "email-gated": {
    label: "Free with email",
    badge: "bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25",
  },
  premium: {
    label: "Premium",
    badge: "bg-foreground/[0.06] text-foreground/70 border-foreground/15",
  },
};

function getType(t: string): ResourceType {
  return (typeMeta[t as ResourceType] ? t : "guide") as ResourceType;
}
function getAccess(a: string): AccessLevel {
  return (accessMeta[a as AccessLevel] ? a : "free") as AccessLevel;
}

export function ResourceCard({ resource }: { resource: ResourceRow }) {
  const t = getType(resource.type);
  const a = getAccess(resource.access_level);
  const tm = typeMeta[t];
  const am = accessMeta[a];
  const Icon = tm.icon;

  const cta = (() => {
    if (a === "free") {
      const disabled = !resource.file_url;
      return (
        <Button
          asChild={!disabled}
          disabled={disabled}
          size="sm"
          variant="default"
          title={disabled ? "Coming soon" : undefined}
        >
          {disabled ? (
            <span>Download</span>
          ) : (
            <a href={resource.file_url!} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          )}
        </Button>
      );
    }
    if (a === "email-gated") {
      return (
        <Button asChild size="sm" variant="outline">
          <Link to="/#newsletter">Get with email</Link>
        </Button>
      );
    }
    return (
      <Button asChild size="sm" variant="hero">
        <Link to="/#newsletter">Unlock</Link>
      </Button>
    );
  })();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl surface-card hover:surface-card-hover hover:-translate-y-0.5 transition-base">
      {/* Cover */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {resource.cover_image_url ? (
          <img
            src={resource.cover_image_url}
            alt={resource.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-foreground/[0.08] to-foreground/[0.02]">
            <Icon className="h-10 w-10 text-foreground/30" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-[22px]">
        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.06em] ${tm.badge}`}
          >
            <Icon className="h-3 w-3" />
            {tm.label}
          </span>
        </div>

        <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.01em] text-foreground leading-tight line-clamp-2">
          {resource.title}
        </h3>

        <p className="mt-2 text-[14px] text-muted-foreground leading-[1.6] line-clamp-3 min-h-[66px]">
          {resource.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span
            className={`text-[10px] px-[7px] py-[3px] rounded font-medium border ${am.badge}`}
          >
            {am.label}
          </span>
          {cta}
        </div>
      </div>
    </div>
  );
}
