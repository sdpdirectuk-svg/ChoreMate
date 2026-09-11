"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AVATARS,
  DEFAULT_CHORES,
  DEFAULT_REWARDS,
  rewardEmoji,
  type SuggestedChore,
  type SuggestedReward,
} from "@/lib/defaults";
import {
  completeSetup,
  saveSetupChores,
  saveSetupMembers,
  saveSetupRewards,
  startSetup,
} from "@/lib/actions/auth-setup";

export function SetupChoice({
  defaultName,
}: {
  defaultName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(defaultName);

  function choose(mode: "quick" | "custom") {
    setError(null);
    const fd = new FormData();
    fd.set("mode", mode);
    fd.set("householdName", name);
    startTransition(async () => {
      const result = await startSetup(fd);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3 text-center">
        <p className="cm-chip mx-auto">First-time setup</p>
        <h1
          className="text-4xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          How do you want to start?
        </h1>
        <p className="mx-auto max-w-xl text-ink-soft">
          You can change points and rewards later. Pick the path that feels easiest today.
        </p>
      </div>

      <label className="mx-auto block max-w-md space-y-2 text-sm font-medium">
        Family name
        <input
          className="cm-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="The Parkers"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          className="cm-panel space-y-3 p-6 text-left transition hover:-translate-y-0.5"
          onClick={() => choose("quick")}
          disabled={pending}
        >
          <p className="text-sm font-semibold tracking-wide text-brand uppercase">
            Quick Start
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">Ready-made system</h2>
          <p className="text-ink-soft">
            Use ChoreMate&apos;s ready-made points and rewards. Add your kids, pick chores, and go.
          </p>
        </button>
        <button
          type="button"
          className="cm-panel space-y-3 p-6 text-left transition hover:-translate-y-0.5"
          onClick={() => choose("custom")}
          disabled={pending}
        >
          <p className="text-sm font-semibold tracking-wide text-accent uppercase">
            Custom Setup
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">Your own rules</h2>
          <p className="text-ink-soft">
            Choose your own points and rewards. We&apos;ll still show examples you can copy.
          </p>
        </button>
      </div>

      {error ? <p className="text-center text-sm text-danger">{error}</p> : null}
    </div>
  );
}

function ChoreEditor({
  initial,
  inspiration,
  onDone,
}: {
  initial: SuggestedChore[];
  inspiration?: SuggestedChore[];
  onDone: () => void;
}) {
  const [chores, setChores] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update(index: number, patch: Partial<SuggestedChore>) {
    setChores((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveSetupChores({ chores });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Chores & points</h2>
        <p className="text-sm text-ink-soft">
          These are examples — edit, remove, or add your own.
        </p>
      </div>

      {inspiration && inspiration.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {inspiration.map((item) => (
            <button
              key={item.title}
              type="button"
              className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm"
              onClick={() => setChores((prev) => [...prev, item])}
            >
              Copy “{item.title}” (+{item.points})
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        {chores.map((chore, index) => (
          <div key={`${chore.title}-${index}`} className="cm-panel grid gap-3 p-4 sm:grid-cols-[1fr_7rem_8rem_auto]">
            <input
              className="cm-input"
              value={chore.title}
              onChange={(e) => update(index, { title: e.target.value })}
              placeholder="Chore name"
            />
            <input
              className="cm-input"
              type="number"
              min={1}
              value={chore.points}
              onChange={(e) => update(index, { points: Number(e.target.value) })}
              aria-label="Points"
            />
            <select
              className="cm-input"
              value={chore.frequency}
              onChange={(e) =>
                update(index, {
                  frequency: e.target.value as SuggestedChore["frequency"],
                })
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="one_off">One-off</option>
            </select>
            <button
              type="button"
              className="cm-btn cm-btn-ghost"
              onClick={() => setChores((prev) => prev.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="cm-btn cm-btn-secondary"
          onClick={() =>
            setChores((prev) => [
              ...prev,
              { title: "New chore", points: 10, frequency: "daily" },
            ])
          }
        >
          Add chore
        </button>
        <button type="button" className="cm-btn cm-btn-primary" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Continue"}
        </button>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

function RewardEditor({
  initial,
  inspiration,
  onDone,
}: {
  initial: SuggestedReward[];
  inspiration?: SuggestedReward[];
  onDone: () => void;
}) {
  const [rewards, setRewards] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update(index: number, patch: Partial<SuggestedReward>) {
    setRewards((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveSetupRewards({ rewards });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Rewards</h2>
        <p className="text-sm text-ink-soft">
          Example ladder — rewards don&apos;t need to involve money.
        </p>
      </div>

      {inspiration && inspiration.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {inspiration.map((item) => (
            <button
              key={item.title}
              type="button"
              className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm"
              onClick={() => setRewards((prev) => [...prev, item])}
            >
              Copy {rewardEmoji(item.icon)} {item.title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        {rewards.map((reward, index) => (
          <div key={`${reward.title}-${index}`} className="cm-panel grid gap-3 p-4 sm:grid-cols-[1fr_8rem_auto]">
            <input
              className="cm-input"
              value={reward.title}
              onChange={(e) => update(index, { title: e.target.value })}
              placeholder="Reward"
            />
            <input
              className="cm-input"
              type="number"
              min={1}
              value={reward.pointsRequired}
              onChange={(e) =>
                update(index, { pointsRequired: Number(e.target.value) })
              }
              aria-label="Points required"
            />
            <button
              type="button"
              className="cm-btn cm-btn-ghost"
              onClick={() => setRewards((prev) => prev.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="cm-btn cm-btn-secondary"
          onClick={() =>
            setRewards((prev) => [
              ...prev,
              { title: "New reward", pointsRequired: 100, icon: "gift" },
            ])
          }
        >
          Add reward
        </button>
        <button type="button" className="cm-btn cm-btn-primary" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Continue"}
        </button>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

function MembersEditor({ onDone }: { onDone: () => void }) {
  const [members, setMembers] = useState([{ name: "", avatar: "star" }]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    const cleaned = members
      .map((m) => ({ ...m, name: m.name.trim() }))
      .filter((m) => m.name);
    if (!cleaned.length) {
      setError("Add at least one child or family member.");
      return;
    }
    startTransition(async () => {
      const result = await saveSetupMembers({ members: cleaned });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Family members</h2>
        <p className="text-sm text-ink-soft">
          Add children (or anyone earning points). Keep it simple for V1.
        </p>
      </div>

      <div className="space-y-4">
        {members.map((member, index) => (
          <div key={index} className="cm-panel space-y-3 p-4">
            <input
              className="cm-input"
              placeholder="Name"
              value={member.name}
              onChange={(e) =>
                setMembers((prev) =>
                  prev.map((m, i) => (i === index ? { ...m, name: e.target.value } : m)),
                )
              }
            />
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  className={`grid h-11 w-11 place-items-center rounded-2xl text-xl ${
                    member.avatar === avatar.id
                      ? "bg-brand text-white"
                      : "bg-brand-soft"
                  }`}
                  onClick={() =>
                    setMembers((prev) =>
                      prev.map((m, i) =>
                        i === index ? { ...m, avatar: avatar.id } : m,
                      ),
                    )
                  }
                  aria-label={avatar.label}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="cm-btn cm-btn-secondary"
          onClick={() => setMembers((prev) => [...prev, { name: "", avatar: "rocket" }])}
        >
          Add member
        </button>
        <button type="button" className="cm-btn cm-btn-primary" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Continue"}
        </button>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function SetupWizard({
  mode,
  existingChores,
  existingRewards,
}: {
  mode: "quick" | "custom";
  existingChores: SuggestedChore[];
  existingRewards: SuggestedReward[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<"members" | "chores" | "rewards" | "done">(
    "members",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const choreInitial = useMemo(() => {
    if (existingChores.length) return existingChores;
    return mode === "quick" ? DEFAULT_CHORES : [];
  }, [existingChores, mode]);

  const rewardInitial = useMemo(() => {
    if (existingRewards.length) return existingRewards;
    return mode === "quick" ? DEFAULT_REWARDS : [];
  }, [existingRewards, mode]);

  function finish() {
    setError(null);
    startTransition(async () => {
      const result = await completeSetup();
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap gap-2 text-sm">
        {(["members", "chores", "rewards", "done"] as const).map((item) => (
          <span
            key={item}
            className={`rounded-full px-3 py-1 ${
              step === item ? "bg-brand text-white" : "bg-white text-ink-soft"
            }`}
          >
            {item}
          </span>
        ))}
      </div>

      {step === "members" ? (
        <MembersEditor onDone={() => setStep("chores")} />
      ) : null}

      {step === "chores" ? (
        <ChoreEditor
          initial={choreInitial}
          inspiration={mode === "custom" ? DEFAULT_CHORES : undefined}
          onDone={() => setStep("rewards")}
        />
      ) : null}

      {step === "rewards" ? (
        <RewardEditor
          initial={rewardInitial}
          inspiration={mode === "custom" ? DEFAULT_REWARDS : undefined}
          onDone={() => setStep("done")}
        />
      ) : null}

      {step === "done" ? (
        <div className="cm-panel space-y-4 p-6">
          <h2 className="text-2xl font-semibold tracking-tight">You&apos;re ready</h2>
          <p className="text-ink-soft">
            After you finish, kids can log in with your household Kid Access Code
            from the parent dashboard.
          </p>
          <button
            type="button"
            className="cm-btn cm-btn-primary"
            onClick={finish}
            disabled={pending}
          >
            {pending ? "Finishing…" : "Open parent dashboard"}
          </button>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button
            type="button"
            className="cm-btn cm-btn-ghost"
            onClick={() => router.push("/setup")}
          >
            Change setup type
          </button>
        </div>
      ) : null}
    </div>
  );
}
