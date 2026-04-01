import "dotenv/config";
import { ContentCategory, MaterialKind, PrismaClient, StepKind } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertLanguage(name: string, code: string) {
  return prisma.language.upsert({
    where: { code },
    create: { name, code, isActive: true },
    update: { name, isActive: true },
  });
}

async function main() {
  const settingsRows = await prisma.appSettings.findMany();

  if (settingsRows.length === 0) {
    console.log("No app_settings rows — seeding default EN journey + language stubs.");

    const en = await upsertLanguage("English", "en");
    await upsertLanguage("മലയാളം", "ml");
    await upsertLanguage("தமிழ்", "ta");

    const existingSteps = await prisma.step.count({ where: { languageId: en.id } });
    if (existingSteps === 0) {
      const c1 = await prisma.content.create({
        data: {
          languageId: en.id,
          contentType: ContentCategory.orientation,
          title: "Orientation",
          videoUrl: "jfKfPfyJRdk",
          sortOrder: 0,
        },
      });
      const mat = await prisma.material.create({
        data: {
          languageId: en.id,
          title: "Earning plan",
          fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          materialType: MaterialKind.pdf,
        },
      });
      const c2 = await prisma.content.create({
        data: {
          languageId: en.id,
          contentType: ContentCategory.training,
          title: "Business video",
          videoUrl: "2vjPBrBU-TM",
          sortOrder: 1,
        },
      });
      await prisma.step.createMany({
        data: [
          {
            languageId: en.id,
            title: "Orientation",
            stepType: StepKind.video,
            contentId: c1.id,
            sortOrder: 0,
          },
          {
            languageId: en.id,
            title: "Earning plan",
            stepType: StepKind.pdf,
            materialId: mat.id,
            sortOrder: 1,
          },
          {
            languageId: en.id,
            title: "Business",
            stepType: StepKind.video,
            contentId: c2.id,
            sortOrder: 2,
          },
          {
            languageId: en.id,
            title: "Join 7Universe",
            stepType: StepKind.action,
            actionUrl: "https://example.com/join",
            sortOrder: 3,
          },
        ],
      });
    }
    return;
  }

  for (const s of settingsRows) {
    const label =
      s.language === "en" ? "English" : s.language === "ml" ? "മലയാളം" : s.language === "ta" ? "தமிழ்" : s.language;
    const lang = await upsertLanguage(label, s.language);

    const n = await prisma.step.count({ where: { languageId: lang.id } });
    if (n > 0) continue;

    const c1 = await prisma.content.create({
      data: {
        languageId: lang.id,
        contentType: ContentCategory.orientation,
        title: "Orientation",
        videoUrl: s.step1VideoUrl,
        sortOrder: 0,
      },
    });
    const mat = await prisma.material.create({
      data: {
        languageId: lang.id,
        title: "Earning plan",
        fileUrl: s.step2PdfUrl,
        materialType: MaterialKind.pdf,
      },
    });
    const c2 = await prisma.content.create({
      data: {
        languageId: lang.id,
        contentType: ContentCategory.training,
        title: "Business video",
        videoUrl: s.step3VideoUrl,
        sortOrder: 1,
      },
    });
    await prisma.step.createMany({
      data: [
        {
          languageId: lang.id,
          title: "Orientation",
          stepType: StepKind.video,
          contentId: c1.id,
          sortOrder: 0,
        },
        {
          languageId: lang.id,
          title: "Earning plan",
          stepType: StepKind.pdf,
          materialId: mat.id,
          sortOrder: 1,
        },
        {
          languageId: lang.id,
          title: "Business",
          stepType: StepKind.video,
          contentId: c2.id,
          sortOrder: 2,
        },
        {
          languageId: lang.id,
          title: "Join",
          stepType: StepKind.action,
          actionUrl: s.joinLink || "https://example.com/join",
          sortOrder: 3,
        },
      ],
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
