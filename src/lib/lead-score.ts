export type LeadInputs = {
  step1_completed: boolean;
  step2_completed: boolean;
  step3_completed: boolean;
  converted: boolean;
};

/** Computes 0–100 score from onboarding signals. */
export function computeLeadScore(input: LeadInputs): number {
  let s = 0;
  if (input.step1_completed) s += 12;
  if (input.step2_completed) s += 18;
  if (input.step3_completed) s += 28;
  if (input.step1_completed && input.step2_completed && input.step3_completed) s += 12;
  if (input.converted) s += 30;
  return Math.min(100, s);
}

export function isHighIntent(score: number, step3: boolean): boolean {
  return step3 || score >= 72;
}
