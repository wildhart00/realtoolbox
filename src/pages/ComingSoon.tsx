import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Construction } from "lucide-react";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <AppLayout hideSidebar>
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Construction className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/">Back to tools</Link>
        </Button>
      </div>
    </AppLayout>
  );
}

export const BlogPage = () => (
  <ComingSoon title="The RealToolbox Blog" description="Deep dives, tool reviews, and AI workflows for real estate pros — launching soon." />
);
export const SubmitPage = () => (
  <ComingSoon title="Submit your AI tool" description="Submissions open shortly. We're tuning our review process to keep quality high." />
);
export const MembersPage = () => (
  <ComingSoon title="Members Hub" description="Saved tools, exclusive deals, and gated guides — coming with the next release." />
);
export const AuthPage = () => (
  <ComingSoon title="Sign in to RealToolbox" description="Authentication is coming next. We'll let you save tools, leave reviews, and unlock the Members Hub." />
);
