-- CreateEnum
CREATE TYPE "MaterialProcessingStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GeneratedQuestionReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "AssessmentQuestionBankItem" ADD COLUMN     "sourceMaterialId" INTEGER;

-- CreateTable
CREATE TABLE "TrainingMaterial" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "originalFileName" TEXT NOT NULL,
    "storedFileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "status" "MaterialProcessingStatus" NOT NULL DEFAULT 'UPLOADED',
    "processingError" TEXT,
    "pageCount" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'English',
    "extractedText" TEXT,
    "competencyId" INTEGER,
    "uploadedByUserId" INTEGER NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialChunk" (
    "id" SERIAL NOT NULL,
    "materialId" INTEGER NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "pageNumber" INTEGER,
    "text" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedQuestion" (
    "id" SERIAL NOT NULL,
    "materialId" INTEGER NOT NULL,
    "sourceChunkId" INTEGER,
    "competencyId" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'MCQ',
    "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "options" JSONB NOT NULL,
    "correctOption" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "sourcePage" INTEGER,
    "sourceExcerpt" TEXT,
    "generatorProvider" TEXT,
    "generatorModel" TEXT,
    "confidence" DOUBLE PRECISION,
    "status" "GeneratedQuestionReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "reviewedByUserId" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "questionBankItemId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingMaterial_uploadedByUserId_idx" ON "TrainingMaterial"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "TrainingMaterial_competencyId_idx" ON "TrainingMaterial"("competencyId");

-- CreateIndex
CREATE INDEX "TrainingMaterial_status_idx" ON "TrainingMaterial"("status");

-- CreateIndex
CREATE INDEX "TrainingMaterial_createdAt_idx" ON "TrainingMaterial"("createdAt");

-- CreateIndex
CREATE INDEX "MaterialChunk_materialId_idx" ON "MaterialChunk"("materialId");

-- CreateIndex
CREATE INDEX "MaterialChunk_pageNumber_idx" ON "MaterialChunk"("pageNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialChunk_materialId_chunkIndex_key" ON "MaterialChunk"("materialId", "chunkIndex");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedQuestion_questionBankItemId_key" ON "GeneratedQuestion"("questionBankItemId");

-- CreateIndex
CREATE INDEX "GeneratedQuestion_materialId_idx" ON "GeneratedQuestion"("materialId");

-- CreateIndex
CREATE INDEX "GeneratedQuestion_sourceChunkId_idx" ON "GeneratedQuestion"("sourceChunkId");

-- CreateIndex
CREATE INDEX "GeneratedQuestion_competencyId_idx" ON "GeneratedQuestion"("competencyId");

-- CreateIndex
CREATE INDEX "GeneratedQuestion_status_idx" ON "GeneratedQuestion"("status");

-- CreateIndex
CREATE INDEX "GeneratedQuestion_reviewedByUserId_idx" ON "GeneratedQuestion"("reviewedByUserId");

-- CreateIndex
CREATE INDEX "AssessmentQuestionBankItem_sourceMaterialId_idx" ON "AssessmentQuestionBankItem"("sourceMaterialId");

-- AddForeignKey
ALTER TABLE "AssessmentQuestionBankItem" ADD CONSTRAINT "AssessmentQuestionBankItem_sourceMaterialId_fkey" FOREIGN KEY ("sourceMaterialId") REFERENCES "TrainingMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingMaterial" ADD CONSTRAINT "TrainingMaterial_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingMaterial" ADD CONSTRAINT "TrainingMaterial_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialChunk" ADD CONSTRAINT "MaterialChunk_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "TrainingMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedQuestion" ADD CONSTRAINT "GeneratedQuestion_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "TrainingMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedQuestion" ADD CONSTRAINT "GeneratedQuestion_sourceChunkId_fkey" FOREIGN KEY ("sourceChunkId") REFERENCES "MaterialChunk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedQuestion" ADD CONSTRAINT "GeneratedQuestion_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedQuestion" ADD CONSTRAINT "GeneratedQuestion_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedQuestion" ADD CONSTRAINT "GeneratedQuestion_questionBankItemId_fkey" FOREIGN KEY ("questionBankItemId") REFERENCES "AssessmentQuestionBankItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
