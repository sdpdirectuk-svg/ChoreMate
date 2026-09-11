import { describe, expect, it } from "vitest";
import {
  DEFAULT_CHORES,
  DEFAULT_REWARDS,
  generateKidAccessCode,
  rewardEmoji,
} from "@/lib/defaults";
import {
  isChoreAvailableToday,
  nextReward,
  redeemableRewards,
  todayEarnedPoints,
} from "@/lib/chores-logic";
import type { Chore, ChoreCompletion, Reward } from "@/lib/types";

describe("defaults", () => {
  it("provides quick-start chores and rewards", () => {
    expect(DEFAULT_CHORES.length).toBeGreaterThanOrEqual(8);
    expect(DEFAULT_REWARDS.length).toBeGreaterThanOrEqual(4);
    expect(DEFAULT_CHORES.every((c) => c.points > 0)).toBe(true);
    expect(DEFAULT_REWARDS.every((r) => r.pointsRequired > 0)).toBe(true);
  });

  it("generates kid access codes", () => {
    const code = generateKidAccessCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });

  it("maps reward icons", () => {
    expect(rewardEmoji("film")).toBe("🎬");
    expect(rewardEmoji("unknown")).toBe("🎁");
  });
});

describe("chore availability", () => {
  const chore: Chore = {
    id: "c1",
    household_id: "h1",
    title: "Make bed",
    points: 5,
    frequency: "daily",
    active: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it("allows a daily chore with no completions", () => {
    expect(isChoreAvailableToday(chore, [], "m1")).toBe(true);
  });

  it("blocks a daily chore already approved today", () => {
    const completions: ChoreCompletion[] = [
      {
        id: "x1",
        household_id: "h1",
        chore_id: "c1",
        member_id: "m1",
        points: 5,
        status: "approved",
        completed_at: new Date().toISOString(),
        resolved_at: new Date().toISOString(),
        resolved_by: null,
        note: null,
      },
    ];
    expect(isChoreAvailableToday(chore, completions, "m1")).toBe(false);
  });

  it("counts today's earned points", () => {
    const completions: ChoreCompletion[] = [
      {
        id: "x1",
        household_id: "h1",
        chore_id: "c1",
        member_id: "m1",
        points: 5,
        status: "approved",
        completed_at: new Date().toISOString(),
        resolved_at: new Date().toISOString(),
        resolved_by: null,
        note: null,
      },
      {
        id: "x2",
        household_id: "h1",
        chore_id: "c2",
        member_id: "m1",
        points: 10,
        status: "pending",
        completed_at: new Date().toISOString(),
        resolved_at: null,
        resolved_by: null,
        note: null,
      },
    ];
    expect(todayEarnedPoints(completions, "m1")).toBe(5);
  });
});

describe("rewards progress", () => {
  const rewards: Reward[] = [
    {
      id: "r1",
      household_id: "h1",
      title: "Dessert",
      points_required: 50,
      icon: "dessert",
      active: true,
      sort_order: 0,
      created_at: "",
      updated_at: "",
    },
    {
      id: "r2",
      household_id: "h1",
      title: "Film",
      points_required: 100,
      icon: "film",
      active: true,
      sort_order: 1,
      created_at: "",
      updated_at: "",
    },
  ];

  it("finds the next reward", () => {
    const next = nextReward(rewards, 60);
    expect(next?.reward.title).toBe("Film");
    expect(next?.remaining).toBe(40);
  });

  it("lists redeemable rewards", () => {
    expect(redeemableRewards(rewards, 50).map((r) => r.title)).toEqual(["Dessert"]);
  });
});
