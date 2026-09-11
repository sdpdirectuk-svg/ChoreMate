"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  completeChoreAsChild,
  endChildSession,
  lookupKidHousehold,
  requestRewardAsChild,
  startChildSession,
} from "@/lib/actions/flow";
import { Celebrate } from "@/components/celebrate";
import { AvatarBubble, PointsPill, ProgressBar } from "@/components/ui-bits";
import { rewardEmoji } from "@/lib/defaults";

type KidProfile = {
  id: string;
  household_id: string;
  name: string;
  avatar: string;
  points: number;
  has_pin: boolean;
};

export function KidLoginClient() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [profiles, setProfiles] = useState<KidProfile[] | null>(null);
  const [selected, setSelected] = useState<KidProfile | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function findFamily() {
    setError(null);
    startTransition(async () => {
      const result = await lookupKidHousehold(code);
      if (!result.ok) {
        setProfiles(null);
        setError(result.error);
        return;
      }
      setProfiles(result.children);
    });
  }

  function enterAs(profile: KidProfile) {
    if (profile.has_pin) {
      setSelected(profile);
      return;
    }
    startTransition(async () => {
      const result = await startChildSession({ code, memberId: profile.id });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/kid/home");
      router.refresh();
    });
  }

  function submitPin() {
    if (!selected) return;
    startTransition(async () => {
      const result = await startChildSession({
        code,
        memberId: selected.id,
        pin,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/kid/home");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="space-y-2 text-center">
        <h1
          className="text-4xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          Kid login
        </h1>
        <p className="text-ink-soft">Ask a parent for your family code.</p>
      </div>

      <div className="cm-panel space-y-4 p-5">
        <label className="block space-y-2 text-sm font-medium">
          Family code
          <input
            className="cm-input text-center text-2xl tracking-[0.25em] uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            placeholder="ABC123"
            autoCapitalize="characters"
          />
        </label>
        <button
          type="button"
          className="cm-btn cm-btn-primary w-full"
          onClick={findFamily}
          disabled={pending || code.trim().length < 4}
        >
          Find my family
        </button>
      </div>

      {profiles ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-ink-soft">Who are you?</p>
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className="cm-touch-row"
              onClick={() => enterAs(profile)}
              disabled={pending}
            >
              <AvatarBubble avatar={profile.avatar} name={profile.name} />
              <span className="flex-1 text-left">
                <span className="block text-lg font-semibold">{profile.name}</span>
                <span className="text-sm text-ink-soft">{profile.points} points</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {selected ? (
        <div className="cm-panel space-y-3 p-5">
          <p className="font-semibold">Enter PIN for {selected.name}</p>
          <input
            className="cm-input text-center text-2xl tracking-[0.4em]"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
          />
          <button
            type="button"
            className="cm-btn cm-btn-primary w-full"
            onClick={submitPin}
            disabled={pending || pin.length !== 4}
          >
            Continue
          </button>
        </div>
      ) : null}

      {error ? <p className="text-center text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function KidHomeClient({
  name,
  avatar,
  points,
  todayPoints,
  chores,
  rewards,
  next,
}: {
  name: string;
  avatar: string;
  points: number;
  todayPoints: number;
  chores: {
    id: string;
    title: string;
    points: number;
    available: boolean;
    pending: boolean;
  }[];
  rewards: {
    id: string;
    title: string;
    icon: string;
    pointsRequired: number;
    requested: boolean;
  }[];
  next: { title: string; required: number; remaining: number } | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("Nice work!");
  const [celebrate, setCelebrate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!celebrate) return;
    const timer = window.setTimeout(() => setCelebrate(false), 1800);
    return () => window.clearTimeout(timer);
  }, [celebrate]);

  const progressValue = useMemo(() => {
    if (!next) return points;
    return Math.min(points, next.required);
  }, [next, points]);

  function complete(choreId: string) {
    setError(null);
    startTransition(async () => {
      const result = await completeChoreAsChild(choreId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(
        result.status === "pending"
          ? "Sent for approval"
          : "Points earned!",
      );
      setCelebrate(true);
      router.refresh();
    });
  }

  function requestReward(rewardId: string) {
    setError(null);
    startTransition(async () => {
      const result = await requestRewardAsChild(rewardId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Reward requested!");
      setCelebrate(true);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-7 pb-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AvatarBubble avatar={avatar} name={name} size="lg" />
          <div>
            <p className="text-sm text-ink-soft">Hi,</p>
            <h1
              className="text-3xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-sora), sans-serif" }}
            >
              {name}
            </h1>
          </div>
        </div>
        <button
          type="button"
          className="cm-btn cm-btn-ghost text-sm"
          onClick={() =>
            startTransition(async () => {
              await endChildSession();
              router.push("/kid");
              router.refresh();
            })
          }
        >
          Switch
        </button>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <div className="cm-panel p-4">
          <p className="text-sm text-ink-soft">Today</p>
          <p className="text-2xl font-semibold text-accent">{todayPoints}</p>
          <p className="text-sm text-ink-soft">points earned</p>
        </div>
        <div className="cm-panel p-4">
          <p className="text-sm text-ink-soft">Total</p>
          <p className="text-2xl font-semibold">{points}</p>
          <p className="text-sm text-ink-soft">points</p>
        </div>
      </section>

      {next ? (
        <section className="cm-panel space-y-3 p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-wide text-brand uppercase">
                Next reward
              </p>
              <p className="text-xl font-semibold">{next.title}</p>
            </div>
            <p className="text-sm font-semibold text-ink-soft">
              {next.remaining > 0 ? `${next.remaining} to go` : "Ready!"}
            </p>
          </div>
          <ProgressBar value={progressValue} max={next.required} />
          <p className="text-sm text-ink-soft">{next.required} points</p>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">Your chores</h2>
        {chores.length === 0 ? (
          <p className="text-ink-soft">All clear for now. Nice!</p>
        ) : (
          chores.map((chore) => (
            <button
              key={chore.id}
              type="button"
              className="cm-touch-row"
              disabled={!chore.available || chore.pending || pending}
              onClick={() => complete(chore.id)}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg border-2 ${
                  chore.pending
                    ? "border-warning bg-accent-soft"
                    : chore.available
                      ? "border-[var(--line)]"
                      : "border-brand bg-brand-soft"
                }`}
              >
                {chore.pending ? "…" : chore.available ? "" : "✓"}
              </span>
              <span className="flex-1 text-left">
                <span className="block text-lg font-semibold">{chore.title}</span>
                <span className="text-sm text-ink-soft">
                  {chore.pending
                    ? "Waiting for approval"
                    : chore.available
                      ? "Tap to complete"
                      : "Done for now"}
                </span>
              </span>
              <PointsPill points={chore.points} />
            </button>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">Rewards</h2>
        {rewards.map((reward) => {
          const canRequest = points >= reward.pointsRequired && !reward.requested;
          return (
            <div key={reward.id} className="cm-panel flex items-center gap-3 p-4">
              <span className="text-3xl" aria-hidden>
                {rewardEmoji(reward.icon)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{reward.title}</p>
                <p className="text-sm text-ink-soft">{reward.pointsRequired} points</p>
              </div>
              {reward.requested ? (
                <span className="cm-chip">Requested</span>
              ) : (
                <button
                  type="button"
                  className="cm-btn cm-btn-accent px-4 text-sm"
                  disabled={!canRequest || pending}
                  onClick={() => requestReward(reward.id)}
                >
                  {canRequest ? "Request" : "Keep going"}
                </button>
              )}
            </div>
          );
        })}
      </section>

      {error ? <p className="text-center text-sm text-danger">{error}</p> : null}
      <Celebrate show={celebrate} message={message} />
    </div>
  );
}
