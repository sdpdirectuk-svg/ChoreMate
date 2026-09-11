import type {
  ChoreFrequency,
  CompletionStatus,
  MemberRole,
  RedemptionStatus,
  SetupMode,
} from "@/lib/defaults";

export type Household = {
  id: string;
  owner_id: string;
  name: string;
  setup_mode: SetupMode;
  require_approval: boolean;
  kid_access_code: string;
  setup_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Member = {
  id: string;
  household_id: string;
  name: string;
  role: MemberRole;
  avatar: string;
  pin_hash: string | null;
  points: number;
  created_at: string;
  updated_at: string;
};

export type Chore = {
  id: string;
  household_id: string;
  title: string;
  points: number;
  frequency: ChoreFrequency;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Reward = {
  id: string;
  household_id: string;
  title: string;
  points_required: number;
  icon: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ChoreCompletion = {
  id: string;
  household_id: string;
  chore_id: string;
  member_id: string;
  points: number;
  status: CompletionStatus;
  completed_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  note: string | null;
};

export type RewardRedemption = {
  id: string;
  household_id: string;
  reward_id: string;
  member_id: string;
  points_spent: number;
  status: RedemptionStatus;
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  note: string | null;
};

export type PointLedgerEntry = {
  id: string;
  household_id: string;
  member_id: string;
  delta: number;
  reason: string;
  ref_type: string | null;
  ref_id: string | null;
  created_at: string;
  created_by: string | null;
};

export type ChildSessionPayload = {
  householdId: string;
  memberId: string;
  memberName: string;
};
