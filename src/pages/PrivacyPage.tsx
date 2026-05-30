import { AppLayout } from "@/components/layout/AppLayout";

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[760px] px-6 lg:px-10 py-16">
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-foreground/40">Legal</p>
        <h1 className="mt-2 font-display text-[36px] font-bold text-foreground tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-[13px] text-foreground/40">Last updated: May 30, 2026</p>

        <div className="mt-10 space-y-6 text-[15px] text-foreground/70 leading-[1.7]">
          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">Overview</h2>
            <p>
              RealToolbox.ai is a curated directory of AI tools for real estate professionals.
              This page describes what we collect, why, and how we handle it. We keep things simple
              and we don&apos;t sell your data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">What we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Email address</strong> — when you subscribe to our newsletter or contact us,
                we store your email so we can reply or send the requested updates.
              </li>
              <li>
                <strong>Anonymous analytics</strong> — basic, aggregated metrics about page views and
                tool clicks so we know which tools are useful to the community. No personal profiling.
              </li>
              <li>
                <strong>Account information</strong> — if you create an account to save tools or
                leave reviews, we store your email and display name.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">What we don&apos;t do</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We don&apos;t sell, rent, or share your data with advertisers.</li>
              <li>We don&apos;t run third-party ad networks or behavioral tracking pixels.</li>
              <li>We don&apos;t accept paid placement — our rankings aren&apos;t for sale.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">Cookies</h2>
            <p>
              We use minimal cookies for basic site functionality (keeping you signed in, remembering
              preferences). No advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">Third-party tools</h2>
            <p>
              When you click through to a tool listed on RealToolbox.ai, you leave our site and are
              subject to that tool&apos;s own privacy policy and terms. We&apos;re not responsible for how
              third-party tools handle your data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-2">Your rights</h2>
            <p>
              You can request your data, unsubscribe, or ask us to delete your account at any time
              by using our{" "}
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
