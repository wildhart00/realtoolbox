import { Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const BlogPage = () => (
  <AppLayout>
    <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Blog coming soon</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        We're cooking up deep dives, prompt libraries and AI workflow guides for real estate pros.
      </p>
    </div>
  </AppLayout>
);

export default BlogPage;
