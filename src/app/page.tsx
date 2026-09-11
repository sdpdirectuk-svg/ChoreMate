import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.7) 0 2px, transparent 3px), radial-gradient(circle at 80% 30%, rgba(15,118,110,0.12) 0 1.5px, transparent 2.5px)",
              backgroundSize: "48px 48px, 36px 36px",
            }}
          />
          <div className="cm-shell relative grid min-h-[calc(100svh-5.5rem)] items-center gap-10 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="cm-rise space-y-7">
              <p className="cm-chip">Family chore app</p>
              <div className="space-y-4">
                <h1
                  className="max-w-xl text-5xl leading-[0.95] font-semibold tracking-tight sm:text-6xl"
                  style={{ fontFamily: "var(--font-sora), sans-serif" }}
                >
                  ChoreMate
                </h1>
                <p className="max-w-lg text-2xl font-medium tracking-tight text-ink-soft sm:text-3xl">
                  Make helping at home a game.
                </p>
                <p className="max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
                  Kids complete chores, earn points, and unlock rewards — with a
                  Quick Start that gets your family going in minutes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/signup" className="cm-btn cm-btn-primary">
                  Get started
                </Link>
                <Link href="/kid" className="cm-btn cm-btn-secondary">
                  I&apos;m a kid
                </Link>
              </div>
              <p className="text-sm text-ink-soft">
                Start in minutes with ready-made points and rewards.
              </p>
            </div>

            <div className="cm-rise relative" style={{ animationDelay: "120ms" }}>
              <div className="cm-panel relative overflow-hidden p-5 sm:p-7">
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-accent-soft blur-2xl" />
                <div className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-brand-soft blur-2xl" />
                <div className="relative space-y-5">
                  <p className="text-sm font-semibold tracking-wide text-brand uppercase">
                    How it works
                  </p>
                  <ol className="space-y-4">
                    {[
                      { step: "Do chores", detail: "Kids tap to mark a chore done." },
                      { step: "Earn points", detail: "Parents approve — or award instantly." },
                      {
                        step: "Unlock rewards",
                        detail: "Film night, extra game time, family picks — your call.",
                      },
                    ].map((item, index) => (
                      <li key={item.step} className="flex items-start gap-4">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-lg font-semibold tracking-tight">{item.step}</p>
                          <p className="text-sm text-ink-soft">{item.detail}</p>
                        </div>
                        {index < 2 ? (
                          <span className="sr-only">then</span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                  <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-4">
                    <p className="text-sm font-semibold">Quick Start advantage</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      Use ChoreMate&apos;s ready-made points and rewards — or
                      choose Custom and set your own. You can change anything later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cm-shell grid gap-6 py-16 md:grid-cols-3">
          {[
            {
              title: "Built for phones",
              body: "Large tap targets, clear points, and a kid screen that takes seconds.",
            },
            {
              title: "Parent stay in control",
              body: "Approve chores, confirm rewards, and undo mistakes when needed.",
            },
            {
              title: "No money required",
              body: "Rewards can be film night, dessert, or family time — not cash.",
            },
          ].map((feature) => (
            <div key={feature.title} className="space-y-2">
              <h2
                className="text-xl font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                {feature.title}
              </h2>
              <p className="text-ink-soft">{feature.body}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
