-- CMS onboarding: languages, content library, materials, steps + progress.completed_step_ids

CREATE TYPE "ContentCategory" AS ENUM ('orientation', 'training', 'advanced');

CREATE TYPE "MaterialKind" AS ENUM ('pdf', 'link');

CREATE TYPE "StepKind" AS ENUM ('video', 'pdf', 'action');

CREATE TABLE "languages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

CREATE TABLE "cms_contents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "language_id" UUID NOT NULL,
    "type" "ContentCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cms_contents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cms_materials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "language_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "type" "MaterialKind" NOT NULL,

    CONSTRAINT "cms_materials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cms_steps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "language_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" "StepKind" NOT NULL,
    "content_id" UUID,
    "material_id" UUID,
    "action_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cms_steps_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "cms_contents" ADD CONSTRAINT "cms_contents_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cms_materials" ADD CONSTRAINT "cms_materials_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cms_steps" ADD CONSTRAINT "cms_steps_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cms_steps" ADD CONSTRAINT "cms_steps_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "cms_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cms_steps" ADD CONSTRAINT "cms_steps_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "cms_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "cms_contents_language_id_type_idx" ON "cms_contents"("language_id", "type");

CREATE INDEX "cms_materials_language_id_idx" ON "cms_materials"("language_id");

CREATE INDEX "cms_steps_language_id_sort_order_idx" ON "cms_steps"("language_id", "sort_order");

ALTER TABLE "progress" ADD COLUMN "completed_step_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
