import { AppLayout } from "@/components/layout/AppLayout";

export default function TermsPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[760px] px-6 lg:px-10 py-16">
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-foreground/40">Legal</p>
        <h1 className="mt-2 font-display text-[36px] font-bold text-foreground tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-[13px] text-foreground/40">Last updated: May 30, 2026</p>

        <div className="mt-10 space-y-6 text-[15px] text-foreground/70 leading-[1.7]">
          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">Use of the site</h2>
            <p>
              RealToolbox.ai is provided as a free directory of AI tools curated for real estate
              professionals. By using the site, you agree to these terms. Use it at your own risk.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">Third-party tools</h2>
            <p>
              Every tool listed on RealToolbox.ai is built and operated by a third party. We curate
              and write about them, but we don&apos;t endorse, warrant, or take responsibility for
              their behavior, pricing, performance, or output. Always do your own due diligence
              before signing up, paying for, or relying on any tool — especially for client work or
              regulated activity.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">No warranties</h2>
            <p>
              The site and its content are provided &quot;as is&quot; without any express or implied
              warranties. We don&apos;t guarantee accuracy, completeness, uptime, or fitness for a
              particular purpose. To the maximum extent permitted by law, RealToolbox.ai is not
              liable for any damages arising from your use of the site or any tool you discover
              through it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">Affiliate links</h2>
            <p>
              Some outbound links to third-party tools may be affiliate links, meaning we earn a
              commission if you sign up. This never influences which tools we list or how we rank
              them — our editorial process is independent of any commercial relationship.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">Submissions</h2>
            <p>
              If you submit a tool for review, you confirm you have the right to do so. We may
              accept, decline, edit, or remove any listing at our discretion.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of the site after changes
              means you accept the updated terms. Questions? Reach out via our{" "}
              <a href="/contact" className="text-[hsl(229_94%_82%)] hover:underline">
                contact page
              </a>.
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
