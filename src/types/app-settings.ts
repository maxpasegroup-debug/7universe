export type AppSettingsRow = {
  id: number;
  step1_video_en: string;
  step1_video_ml: string;
  step1_video_ta: string;
  step3_video_en: string;
  step3_video_ml: string;
  step3_video_ta: string;
  pdf_url: string;
  join_link: string;
  content_overrides: Record<string, unknown> | Record<string, Record<string, unknown>>;
  updated_at: string;
};
