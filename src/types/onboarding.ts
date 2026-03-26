export type OnboardingProfileRow = {
  id: string;
  mobile: string;
  name: string;
  language: string;
  step1_completed: boolean;
  step2_completed: boolean;
  step3_completed: boolean;
  referral_code: string | null;
  referrer_id: string | null;
  lead_score: number;
  high_intent: boolean;
  converted: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
};

export type OnboardingProgress = Pick<
  OnboardingProfileRow,
  "id" | "step1_completed" | "step2_completed" | "step3_completed"
>;

export type OnboardingProfilePublic = OnboardingProfileRow & {
  referral_count: number;
};
