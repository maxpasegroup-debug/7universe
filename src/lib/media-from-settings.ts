import type { AppSettingsRow } from "@/types/app-settings";
import type { LanguageCode } from "@/lib/i18n";

export type MediaBundle = {
  orientationVideoId: string;
  businessVideoId: string;
  earningPdfUrl: string;
  joinLink: string;
};

export function mediaFromSettings(settings: AppSettingsRow, lang: LanguageCode): MediaBundle {
  const s1 =
    lang === "en" ? settings.step1_video_en : lang === "ml" ? settings.step1_video_ml : settings.step1_video_ta;
  const s3 =
    lang === "en" ? settings.step3_video_en : lang === "ml" ? settings.step3_video_ml : settings.step3_video_ta;
  return {
    orientationVideoId: s1.trim(),
    businessVideoId: s3.trim(),
    earningPdfUrl: settings.pdf_url.trim(),
    joinLink: settings.join_link.trim(),
  };
}
