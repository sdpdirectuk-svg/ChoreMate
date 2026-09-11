"use client";

import { useEffect, useState, useTransition } from "react";
import {
  resolveCompletion,
  resolveRedemption,
  undoCompletion,
} from "@/lib/actions/flow";
import { Celebrate } from "@/components/celebrate";

export function ApprovalActions({
  completionId,
}: {
  completionId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (!celebrate) return;
    const timer = window.setTimeout(() => setCelebrate(false), 1800);
    return () => window.clearTimeout(timer);
  }, [celebrate]);

  function act(decision: "approved" | "rejected") {
    setError(null);
    startTransition(async () => {
      const result = await resolveCompletion({ completionId, decision });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (decision === "approved") setCelebrate(true);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="cm-btn cm-btn-primary px-4 text-sm"
        disabled={pending}
        onClick={() => act("approved")}
      >
        Approve
      </button>
      <button
        type="button"
        className="cm-btn cm-btn-secondary px-4 text-sm"
        disabled={pending}
        onClick={() => act("rejected")}
      >
        Reject
      </button>
      {error ? <p className="w-full text-sm text-danger">{error}</p> : null}
      <Celebrate show={celebrate} message="Points awarded" />
    </div>
  );
}

export function UndoCompletionButton({ completionId }: { completionId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="cm-btn cm-btn-ghost px-3 text-sm"
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          void undoCompletion(completionId);
        })
      }
    >
      Undo
    </button>
  );
}

export function RedemptionActions({ redemptionId }: { redemptionId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (!celebrate) return;
    const timer = window.setTimeout(() => setCelebrate(false), 1800);
    return () => window.clearTimeout(timer);
  }, [celebrate]);

  function act(decision: "confirmed" | "rejected") {
    setError(null);
    startTransition(async () => {
      const result = await resolveRedemption({ redemptionId, decision });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (decision === "confirmed") setCelebrate(true);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="cm-btn cm-btn-accent px-4 text-sm"
        disabled={pending}
        onClick={() => act("confirmed")}
      >
        Confirm reward
      </button>
      <button
        type="button"
        className="cm-btn cm-btn-secondary px-4 text-sm"
        disabled={pending}
        onClick={() => act("rejected")}
      >
        Reject
      </button>
      {error ? <p className="w-full text-sm text-danger">{error}</p> : null}
      <Celebrate show={celebrate} message="Reward unlocked" />
    </div>
  );
}
