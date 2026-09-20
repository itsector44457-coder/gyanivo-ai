-- Ensure sourceMaterialId column exists safely without breaking existing tables
ALTER TABLE "public"."AssessmentQuestionBankItem" ADD COLUMN IF NOT EXISTS "sourceMaterialId" INTEGER;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AssessmentQuestionBankItem_sourceMaterialId_idx" ON "public"."AssessmentQuestionBankItem"("sourceMaterialId");
