import type { StepKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type JourneyStepDTO = {
  id: string;
  title: string;
  kind: StepKind;
  sortOrder: number;
  videoUrl: string | null;
  pdfUrl: string | null;
  actionUrl: string | null;
};

export type JourneyWithLanguage = {
  language: { id: string; name: string; code: string };
  steps: JourneyStepDTO[];
};

function mapSteps(
  steps: Array<{
    id: string;
    title: string;
    stepType: StepKind;
    sortOrder: number;
    actionUrl: string | null;
    content: { videoUrl: string } | null;
    material: { fileUrl: string } | null;
  }>,
): JourneyStepDTO[] {
  return steps.map((s) => ({
    id: s.id,
    title: s.title,
    kind: s.stepType,
    sortOrder: s.sortOrder,
    videoUrl: s.content?.videoUrl ?? null,
    pdfUrl: s.material?.fileUrl ?? null,
    actionUrl: s.actionUrl,
  }));
}

export async function loadJourneyWithLanguage(code: string): Promise<JourneyWithLanguage | null> {
  const lang = await prisma.language.findFirst({
    where: { code: code.toLowerCase(), isActive: true },
  });
  if (!lang) return null;

  const rows = await prisma.step.findMany({
    where: { languageId: lang.id },
    orderBy: { sortOrder: "asc" },
    include: { content: true, material: true },
  });

  return {
    language: { id: lang.id, name: lang.name, code: lang.code },
    steps: mapSteps(rows),
  };
}

export async function loadJourneyByLanguageCode(code: string): Promise<JourneyStepDTO[] | null> {
  const data = await loadJourneyWithLanguage(code);
  return data?.steps ?? null;
}

export function completableSteps(steps: { id: string; kind: StepKind }[]): { id: string; kind: StepKind }[] {
  return steps.filter((s) => s.kind === "video" || s.kind === "pdf");
}

export function computeLegacyStepFlags(
  orderedSteps: { id: string; kind: StepKind }[],
  completed: Set<string>,
): { step1Completed: boolean; step2Completed: boolean; step3Completed: boolean } {
  const c = completableSteps(orderedSteps);
  return {
    step1Completed: c[0] ? completed.has(c[0].id) : false,
    step2Completed: c[1] ? completed.has(c[1].id) : false,
    step3Completed: c[2] ? completed.has(c[2].id) : false,
  };
}

export function pointsForCompletableIndex(index: number): number {
  if (index === 0) return 10;
  if (index === 1) return 15;
  if (index === 2) return 20;
  return 10;
}
