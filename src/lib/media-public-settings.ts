import { youtubeEmbedId } from "@/lib/youtube";

export type PublicAppSettings = {
  step1VideoUrl: string;
  step2PdfUrl: string;
  step3VideoUrl: string;
  joinLink: string;
};

export type MediaBundle = {
  orientationVideoId: string;
  businessVideoId: string;
  earningPdfUrl: string;
  joinLink: string;
};

export function mediaFromPublicSettings(s: PublicAppSettings): MediaBundle {
  return {
    orientationVideoId: youtubeEmbedId(s.step1VideoUrl),
    businessVideoId: youtubeEmbedId(s.step3VideoUrl),
    earningPdfUrl: s.step2PdfUrl.trim(),
    joinLink: s.joinLink.trim(),
  };
}
