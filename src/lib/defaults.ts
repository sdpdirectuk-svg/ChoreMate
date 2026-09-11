export type ChoreFrequency = "daily" | "weekly" | "one_off";
export type SetupMode = "quick" | "custom";
export type MemberRole = "parent" | "child";
export type CompletionStatus = "pending" | "approved" | "rejected";
export type RedemptionStatus = "pending" | "confirmed" | "rejected";

export type SuggestedChore = {
  title: string;
  points: number;
  frequency: ChoreFrequency;
};

export type SuggestedReward = {
  title: string;
  pointsRequired: number;
  icon: string;
};

/** Example default chores for Quick Start (editable, not hard-coded limits). */
export const DEFAULT_CHORES: SuggestedChore[] = [
  { title: "Make your bed", points: 5, frequency: "daily" },
  { title: "Put dirty clothes away", points: 5, frequency: "daily" },
  { title: "Tidy bedroom", points: 10, frequency: "daily" },
  { title: "Set the table", points: 10, frequency: "daily" },
  { title: "Clear the table", points: 10, frequency: "daily" },
  { title: "Empty dishwasher", points: 10, frequency: "daily" },
  { title: "Help with laundry", points: 15, frequency: "weekly" },
  { title: "Vacuum a room", points: 15, frequency: "weekly" },
  { title: "Take rubbish out", points: 10, frequency: "weekly" },
  { title: "Help with a bigger household job", points: 20, frequency: "one_off" },
];

/** Example default rewards — examples parents can edit freely. */
export const DEFAULT_REWARDS: SuggestedReward[] = [
  { title: "Choose dessert", pointsRequired: 50, icon: "dessert" },
  { title: "Choose tonight's film", pointsRequired: 100, icon: "film" },
  { title: "Extra screen/game time", pointsRequired: 150, icon: "game" },
  { title: "Choose a family activity", pointsRequired: 250, icon: "family" },
  { title: "Special reward", pointsRequired: 500, icon: "star" },
];

export const AVATARS = [
  { id: "star", label: "Star", emoji: "⭐" },
  { id: "rocket", label: "Rocket", emoji: "🚀" },
  { id: "fox", label: "Fox", emoji: "🦊" },
  { id: "cat", label: "Cat", emoji: "🐱" },
  { id: "dog", label: "Dog", emoji: "🐶" },
  { id: "unicorn", label: "Unicorn", emoji: "🦄" },
  { id: "soccer", label: "Football", emoji: "⚽" },
  { id: "art", label: "Art", emoji: "🎨" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "book", label: "Book", emoji: "📚" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export const REWARD_ICONS: Record<string, string> = {
  dessert: "🍨",
  film: "🎬",
  game: "🎮",
  family: "🎉",
  star: "🌟",
  gift: "🎁",
  takeaway: "🍕",
  park: "🏞️",
  sleepover: "🌙",
};

export function avatarEmoji(id: string): string {
  return AVATARS.find((a) => a.id === id)?.emoji ?? "⭐";
}

export function rewardEmoji(icon: string): string {
  return REWARD_ICONS[icon] ?? "🎁";
}

export function generateKidAccessCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
