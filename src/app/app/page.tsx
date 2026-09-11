import Link from "next/link";
import { isToday, parseISO } from "date-fns";
import { AvatarBubble } from "@/components/ui-bits";
import {
  ApprovalActions,
  RedemptionActions,
  UndoCompletionButton,
} from "@/components/parent-actions";
import { requireOwnedHousehold, getHouseholdChildren } from "@/lib/auth/parent";
import { rewardEmoji } from "@/lib/defaults";

export const metadata = {
  title: "Family home",
  robots: { index: false, follow: false },
};

export default async function ParentDashboardPage() {
  const { household, supabase } = await requireOwnedHousehold();
  const children = await getHouseholdChildren(supabase, household.id);

  const [{ data: completions }, { data: redemptions }, { data: chores }, { data: rewards }, { data: ledger }] =
    await Promise.all([
      supabase
        .from("chore_completions")
        .select("*, members(name, avatar), chores(title)")
        .eq("household_id", household.id)
        .order("completed_at", { ascending: false })
        .limit(40),
      supabase
        .from("reward_redemptions")
        .select("*, members(name, avatar), rewards(title, icon)")
        .eq("household_id", household.id)
        .eq("status", "pending")
        .order("requested_at", { ascending: false }),
      supabase
        .from("chores")
        .select("id")
        .eq("household_id", household.id)
        .eq("active", true),
      supabase
        .from("rewards")
        .select("id")
        .eq("household_id", household.id)
        .eq("active", true),
      supabase
        .from("point_ledger")
        .select("*, members(name)")
        .eq("household_id", household.id)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  const pendingCompletions =
    completions?.filter((c) => c.status === "pending") ?? [];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          Family
        </h1>
        <p className="text-ink-soft">
          A quick look at points, today&apos;s progress, and anything waiting for you.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        {children.map((child) => {
          const todayDone =
            completions?.filter(
              (c) =>
                c.member_id === child.id &&
                c.status === "approved" &&
                isToday(parseISO(c.completed_at)),
            ).length ?? 0;
          const awaiting =
            completions?.filter(
              (c) => c.member_id === child.id && c.status === "pending",
            ).length ?? 0;

          return (
            <article key={child.id} className="cm-panel flex items-start gap-4 p-5">
              <AvatarBubble avatar={child.avatar} name={child.name} size="lg" />
              <div className="min-w-0 space-y-1">
                <h2 className="truncate text-xl font-semibold">{child.name}</h2>
                <p className="text-2xl font-semibold text-accent">{child.points} points</p>
                <p className="text-sm text-ink-soft">
                  {todayDone} chore{todayDone === 1 ? "" : "s"} completed today
                  {awaiting ? ` · ${awaiting} awaiting approval` : ""}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/app/chores", label: "Manage chores", meta: `${chores?.length ?? 0} active` },
          { href: "/app/rewards", label: "Manage rewards", meta: `${rewards?.length ?? 0} active` },
          { href: "/app/family", label: "Family members", meta: `${children.length} kids` },
          { href: "/app/settings", label: "Settings", meta: household.require_approval ? "Approval on" : "Approval off" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="cm-touch-row !flex-col !items-start !gap-1"
          >
            <span className="font-semibold">{item.label}</span>
            <span className="text-sm text-ink-soft">{item.meta}</span>
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Pending approvals</h2>
        {pendingCompletions.length === 0 ? (
          <p className="text-ink-soft">Nothing waiting — nice and calm.</p>
        ) : (
          <div className="space-y-3">
            {pendingCompletions.map((item) => (
              <div key={item.id} className="cm-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">
                    {(item.members as { name?: string } | null)?.name} ·{" "}
                    {(item.chores as { title?: string } | null)?.title}
                  </p>
                  <p className="text-sm text-accent">+{item.points} points</p>
                </div>
                <ApprovalActions completionId={item.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Reward requests</h2>
        {!redemptions?.length ? (
          <p className="text-ink-soft">No reward requests right now.</p>
        ) : (
          <div className="space-y-3">
            {redemptions.map((item) => (
              <div key={item.id} className="cm-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">
                    {(item.members as { name?: string } | null)?.name} wants{" "}
                    {rewardEmoji((item.rewards as { icon?: string } | null)?.icon || "gift")}{" "}
                    {(item.rewards as { title?: string } | null)?.title}
                  </p>
                  <p className="text-sm text-ink-soft">{item.points_spent} points</p>
                </div>
                <RedemptionActions redemptionId={item.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Points history</h2>
        {!ledger?.length ? (
          <p className="text-ink-soft">Points changes will show up here.</p>
        ) : (
          <div className="space-y-3">
            {ledger.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {(entry.members as { name?: string } | null)?.name} · {entry.reason}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    entry.delta >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Recent activity</h2>
        <div className="space-y-3">
          {(completions ?? []).slice(0, 8).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3">
              <div>
                <p className="font-medium">
                  {(item.members as { name?: string } | null)?.name} ·{" "}
                  {(item.chores as { title?: string } | null)?.title}
                </p>
                <p className="text-sm text-ink-soft capitalize">{item.status}</p>
              </div>
              {item.status === "approved" ? (
                <UndoCompletionButton completionId={item.id} />
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
