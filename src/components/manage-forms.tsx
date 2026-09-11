"use client";

import { useState, useTransition } from "react";
import {
  createChore,
  createMember,
  createReward,
  deleteChore,
  deleteMember,
  deleteReward,
  regenerateKidCode,
  updateChore,
  updateMember,
  updateReward,
  updateSettings,
} from "@/lib/actions/household";
import { AVATARS, rewardEmoji } from "@/lib/defaults";
import type { Chore, Member, Reward } from "@/lib/types";

export function ChoresManager({ chores }: { chores: Chore[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <form
        className="cm-panel grid gap-3 p-4 sm:grid-cols-[1fr_7rem_9rem_auto]"
        action={(fd) =>
          startTransition(async () => {
            const result = await createChore(fd);
            setError(result.ok ? null : result.error);
          })
        }
      >
        <input className="cm-input" name="title" placeholder="New chore" required />
        <input className="cm-input" name="points" type="number" min={1} defaultValue={10} required />
        <select className="cm-input" name="frequency" defaultValue="daily">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="one_off">One-off</option>
        </select>
        <button className="cm-btn cm-btn-primary" disabled={pending}>
          Add
        </button>
      </form>

      <div className="space-y-3">
        {chores.map((chore) => (
          <form
            key={chore.id}
            className="cm-panel grid gap-3 p-4 lg:grid-cols-[1fr_7rem_9rem_auto_auto]"
            action={(fd) =>
              startTransition(async () => {
                const result = await updateChore(fd);
                setError(result.ok ? null : result.error);
              })
            }
          >
            <input type="hidden" name="id" value={chore.id} />
            <input className="cm-input" name="title" defaultValue={chore.title} required />
            <input className="cm-input" name="points" type="number" min={1} defaultValue={chore.points} required />
            <select className="cm-input" name="frequency" defaultValue={chore.frequency}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="one_off">One-off</option>
            </select>
            <button className="cm-btn cm-btn-secondary" disabled={pending}>
              Save
            </button>
            <button
              className="cm-btn cm-btn-ghost"
              formAction={(fd) =>
                startTransition(async () => {
                  const result = await deleteChore(fd);
                  setError(result.ok ? null : result.error);
                })
              }
            >
              Delete
            </button>
          </form>
        ))}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function RewardsManager({ rewards }: { rewards: Reward[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <form
        className="cm-panel grid gap-3 p-4 sm:grid-cols-[1fr_8rem_auto]"
        action={(fd) =>
          startTransition(async () => {
            const result = await createReward(fd);
            setError(result.ok ? null : result.error);
          })
        }
      >
        <input className="cm-input" name="title" placeholder="New reward" required />
        <input
          className="cm-input"
          name="pointsRequired"
          type="number"
          min={1}
          defaultValue={100}
          required
        />
        <input type="hidden" name="icon" value="gift" />
        <button className="cm-btn cm-btn-primary" disabled={pending}>
          Add
        </button>
      </form>

      <div className="space-y-3">
        {rewards.map((reward) => (
          <form
            key={reward.id}
            className="cm-panel grid gap-3 p-4 lg:grid-cols-[auto_1fr_8rem_auto_auto]"
            action={(fd) =>
              startTransition(async () => {
                const result = await updateReward(fd);
                setError(result.ok ? null : result.error);
              })
            }
          >
            <span className="grid h-12 w-12 place-items-center text-2xl">
              {rewardEmoji(reward.icon)}
            </span>
            <input type="hidden" name="id" value={reward.id} />
            <input type="hidden" name="icon" value={reward.icon} />
            <input className="cm-input" name="title" defaultValue={reward.title} required />
            <input
              className="cm-input"
              name="pointsRequired"
              type="number"
              min={1}
              defaultValue={reward.points_required}
              required
            />
            <button className="cm-btn cm-btn-secondary" disabled={pending}>
              Save
            </button>
            <button
              className="cm-btn cm-btn-ghost"
              formAction={(fd) =>
                startTransition(async () => {
                  const result = await deleteReward(fd);
                  setError(result.ok ? null : result.error);
                })
              }
            >
              Delete
            </button>
          </form>
        ))}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function FamilyManager({ members }: { members: Member[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <form
        className="cm-panel space-y-3 p-4"
        action={(fd) =>
          startTransition(async () => {
            const result = await createMember(fd);
            setError(result.ok ? null : result.error);
          })
        }
      >
        <input className="cm-input" name="name" placeholder="Child name" required />
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((avatar) => (
            <label key={avatar.id} className="cursor-pointer">
              <input type="radio" name="avatar" value={avatar.id} defaultChecked={avatar.id === "star"} className="peer sr-only" />
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-xl peer-checked:bg-brand peer-checked:text-white">
                {avatar.emoji}
              </span>
            </label>
          ))}
        </div>
        <input className="cm-input" name="pin" inputMode="numeric" placeholder="Optional 4-digit PIN" maxLength={4} />
        <button className="cm-btn cm-btn-primary" disabled={pending}>
          Add member
        </button>
      </form>

      <div className="space-y-3">
        {members.map((member) => (
          <form
            key={member.id}
            className="cm-panel space-y-3 p-4"
            action={(fd) =>
              startTransition(async () => {
                const result = await updateMember(fd);
                setError(result.ok ? null : result.error);
              })
            }
          >
            <input type="hidden" name="id" value={member.id} />
            <input className="cm-input" name="name" defaultValue={member.name} required />
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((avatar) => (
                <label key={avatar.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="avatar"
                    value={avatar.id}
                    defaultChecked={member.avatar === avatar.id}
                    className="peer sr-only"
                  />
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-xl peer-checked:bg-brand peer-checked:text-white">
                    {avatar.emoji}
                  </span>
                </label>
              ))}
            </div>
            <input className="cm-input" name="pin" inputMode="numeric" placeholder="Set new PIN (optional)" maxLength={4} />
            <div className="flex flex-wrap gap-2">
              <button className="cm-btn cm-btn-secondary" disabled={pending}>
                Save
              </button>
              <button
                className="cm-btn cm-btn-ghost"
                formAction={(fd) =>
                  startTransition(async () => {
                    fd.set("clearPin", "true");
                    const result = await updateMember(fd);
                    setError(result.ok ? null : result.error);
                  })
                }
              >
                Clear PIN
              </button>
              <button
                className="cm-btn cm-btn-ghost"
                formAction={(fd) =>
                  startTransition(async () => {
                    const result = await deleteMember(fd);
                    setError(result.ok ? null : result.error);
                  })
                }
              >
                Remove
              </button>
            </div>
          </form>
        ))}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function SettingsForm({
  name,
  requireApproval,
  kidCode,
}: {
  name: string;
  requireApproval: boolean;
  kidCode: string;
}) {
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState(kidCode);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <form
        className="cm-panel space-y-4 p-5"
        action={(fd) =>
          startTransition(async () => {
            const result = await updateSettings(fd);
            if (!result.ok) setError(result.error);
            else {
              setError(null);
              setMessage("Settings saved.");
            }
          })
        }
      >
        <label className="block space-y-2 text-sm font-medium">
          Family name
          <input className="cm-input" name="name" defaultValue={name} required />
        </label>
        <label className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
          <span>
            <span className="block font-semibold">Require parent approval</span>
            <span className="text-sm text-ink-soft">
              When on, kids wait for approval before points are awarded.
            </span>
          </span>
          <input
            type="checkbox"
            name="requireApproval"
            defaultChecked={requireApproval}
            className="h-5 w-5"
          />
        </label>
        <button className="cm-btn cm-btn-primary" disabled={pending}>
          Save settings
        </button>
      </form>

      <div className="cm-panel space-y-3 p-5">
        <h2 className="text-xl font-semibold">Kid access code</h2>
        <p className="text-sm text-ink-soft">
          Kids open Kid login, enter this code, then choose their profile. Optional PINs add a little extra protection.
        </p>
        <p className="text-3xl font-semibold tracking-[0.2em] text-brand">{code}</p>
        <button
          type="button"
          className="cm-btn cm-btn-secondary"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await regenerateKidCode();
              if (!result.ok) {
                setError(result.error);
                return;
              }
              if (result.code) setCode(result.code);
              setMessage("New kid code created. Share it with your family.");
            })
          }
        >
          Regenerate code
        </button>
      </div>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
