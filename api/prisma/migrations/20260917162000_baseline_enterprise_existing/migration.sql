-- CreateEnum
CREATE TYPE "public"."AssessmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."AssessmentType" AS ENUM ('DIAGNOSTIC', 'TRAINING', 'POST_TRAINING', 'PRACTICE');

-- CreateEnum
CREATE TYPE "public"."AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."CompetencyHistorySourceType" AS ENUM ('DIAGNOSTIC_ASSESSMENT', 'TRAINING_ASSESSMENT', 'MANUAL_APPROVED_ADJUSTMENT', 'MIGRATION', 'SYSTEM_RECALCULATION');

-- CreateEnum
CREATE TYPE "public"."CourseDifficulty" AS ENUM ('FOUNDATIONAL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "public"."DifficultySource" AS ENUM ('PROVIDER_METADATA', 'AI_ESTIMATED', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."EnrollmentSource" AS ENUM ('LOCAL_PLATFORM_EVENT', 'OFFICIAL_PROVIDER_SYNC');

-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED');

-- CreateEnum
CREATE TYPE "public"."MappingMethod" AS ENUM ('SEMANTIC', 'PROVIDER_METADATA', 'LLM_ASSISTED', 'HUMAN_OVERRIDE');

-- CreateEnum
CREATE TYPE "public"."MappingStatus" AS ENUM ('APPROVED', 'PENDING_REVIEW', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ProviderStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'NOT_CONFIGURED', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."SystemRole" AS ENUM ('EMPLOYEE', 'TRAINER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "public"."Assessment" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."AssessmentType" NOT NULL DEFAULT 'DIAGNOSTIC',
    "status" "public"."AssessmentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "competencyId" INTEGER,
    "createdByUserId" INTEGER,
    "timeLimitMinutes" INTEGER,
    "questionCount" INTEGER NOT NULL DEFAULT 10,
    "passingScore" DOUBLE PRECISION,
    "adaptiveEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentAnswerAttempt" (
    "id" SERIAL NOT NULL,
    "assessmentAttemptId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "selectedOption" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "difficulty" "public"."QuestionDifficulty" NOT NULL,
    "responseTimeMs" INTEGER,
    "attemptSequence" INTEGER NOT NULL,
    "estimatedMasteryBefore" DOUBLE PRECISION,
    "estimatedMasteryAfter" DOUBLE PRECISION,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentAnswerAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentAttempt" (
    "id" SERIAL NOT NULL,
    "assessmentId" INTEGER,
    "employeeProfileId" INTEGER NOT NULL,
    "competencyId" INTEGER NOT NULL,
    "status" "public"."AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "currentDifficulty" "public"."QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "totalQuestions" INTEGER NOT NULL DEFAULT 10,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "rawScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "initialCompetencyScore" DOUBLE PRECISION,
    "finalCompetencyScore" DOUBLE PRECISION,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentQuestionBankItem" (
    "id" SERIAL NOT NULL,
    "competencyId" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'MCQ',
    "difficulty" "public"."QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "options" JSONB NOT NULL,
    "correctOption" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'CURATED_FRAMEWORK',
    "sourceReference" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentQuestionBankItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Competency" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domainId" INTEGER NOT NULL,
    "parentCompetencyId" INTEGER,
    "proficiencyScaleMin" INTEGER NOT NULL DEFAULT 1,
    "proficiencyScaleMax" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompetencyDomain" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompetencyHistory" (
    "id" SERIAL NOT NULL,
    "employeeProfileId" INTEGER NOT NULL,
    "competencyId" INTEGER NOT NULL,
    "previousScore" DOUBLE PRECISION NOT NULL,
    "newScore" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "changeReason" TEXT,
    "sourceType" "public"."CompetencyHistorySourceType" NOT NULL DEFAULT 'DIAGNOSTIC_ASSESSMENT',
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "providerName" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "language" TEXT NOT NULL DEFAULT 'English',
    "difficultyLevel" "public"."CourseDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "difficultySource" "public"."DifficultySource" NOT NULL DEFAULT 'PROVIDER_METADATA',
    "courseUrl" TEXT,
    "thumbnailUrl" TEXT,
    "learningOutcomes" JSONB,
    "tags" JSONB,
    "prerequisitesText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sourceUpdatedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseCompetency" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "competencyId" INTEGER NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,
    "mappingMethod" "public"."MappingMethod" NOT NULL DEFAULT 'SEMANTIC',
    "mappingReliability" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "evidence" TEXT,
    "status" "public"."MappingStatus" NOT NULL DEFAULT 'APPROVED',
    "approvedByUserId" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoursePrerequisite" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "prerequisiteCourseId" INTEGER,
    "prerequisiteCompetencyId" INTEGER,
    "minimumCompetencyScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseProvider" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerType" TEXT NOT NULL DEFAULT 'EXTERNAL_PLATFORM',
    "baseUrl" TEXT,
    "status" "public"."ProviderStatus" NOT NULL DEFAULT 'ACTIVE',
    "capabilities" JSONB,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseRecommendation" (
    "id" SERIAL NOT NULL,
    "employeeProfileId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "competencyId" INTEGER NOT NULL,
    "recommendationScore" DOUBLE PRECISION NOT NULL,
    "rankingPosition" INTEGER NOT NULL,
    "reasons" JSONB NOT NULL,
    "preCompetencyScore" DOUBLE PRECISION,
    "postCompetencyScore" DOUBLE PRECISION,
    "outcomeImprovement" DOUBLE PRECISION,
    "recommendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CourseRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseSyncRun" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "public"."SyncStatus" NOT NULL DEFAULT 'SUCCESS',
    "itemsFetched" INTEGER NOT NULL DEFAULT 0,
    "itemsCreated" INTEGER NOT NULL DEFAULT 0,
    "itemsUpdated" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorSummary" TEXT,

    CONSTRAINT "CourseSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Department" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmployeeCompetency" (
    "id" SERIAL NOT NULL,
    "employeeProfileId" INTEGER NOT NULL,
    "competencyId" INTEGER NOT NULL,
    "currentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "lastEvaluatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmployeeProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "employeeCode" TEXT,
    "designation" TEXT NOT NULL,
    "cadre" TEXT,
    "currentAssignment" TEXT,
    "educationalQualification" TEXT,
    "experienceYears" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "departmentId" INTEGER,
    "jobRoleId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobRole" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "departmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoleCompetencyRequirement" (
    "id" SERIAL NOT NULL,
    "jobRoleId" INTEGER NOT NULL,
    "competencyId" INTEGER NOT NULL,
    "requiredScore" DOUBLE PRECISION NOT NULL,
    "priorityWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "minimumScore" DOUBLE PRECISION,
    "sourceReference" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleCompetencyRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrainingEnrollment" (
    "id" SERIAL NOT NULL,
    "employeeProfileId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "completionSource" "public"."EnrollmentSource" NOT NULL DEFAULT 'LOCAL_PLATFORM_EVENT',
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "score" DOUBLE PRECISION,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "systemRole" "public"."SystemRole" NOT NULL DEFAULT 'EMPLOYEE',
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assessment_competencyId_idx" ON "public"."Assessment"("competencyId" ASC);

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "public"."Assessment"("status" ASC);

-- CreateIndex
CREATE INDEX "Assessment_type_idx" ON "public"."Assessment"("type" ASC);

-- CreateIndex
CREATE INDEX "AssessmentAnswerAttempt_assessmentAttemptId_idx" ON "public"."AssessmentAnswerAttempt"("assessmentAttemptId" ASC);

-- CreateIndex
CREATE INDEX "AssessmentAnswerAttempt_questionId_idx" ON "public"."AssessmentAnswerAttempt"("questionId" ASC);

-- CreateIndex
CREATE INDEX "AssessmentAttempt_competencyId_idx" ON "public"."AssessmentAttempt"("competencyId" ASC);

-- CreateIndex
CREATE INDEX "AssessmentAttempt_employeeProfileId_idx" ON "public"."AssessmentAttempt"("employeeProfileId" ASC);

-- CreateIndex
CREATE INDEX "AssessmentAttempt_status_idx" ON "public"."AssessmentAttempt"("status" ASC);

-- CreateIndex
CREATE INDEX "AssessmentQuestionBankItem_competencyId_idx" ON "public"."AssessmentQuestionBankItem"("competencyId" ASC);

-- CreateIndex
CREATE INDEX "AssessmentQuestionBankItem_difficulty_idx" ON "public"."AssessmentQuestionBankItem"("difficulty" ASC);

-- CreateIndex
CREATE INDEX "AssessmentQuestionBankItem_isActive_idx" ON "public"."AssessmentQuestionBankItem"("isActive" ASC);

-- CreateIndex
CREATE INDEX "AuthSession_refreshTokenHash_idx" ON "public"."AuthSession"("refreshTokenHash" ASC);

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "public"."AuthSession"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Competency_code_key" ON "public"."Competency"("code" ASC);

-- CreateIndex
CREATE INDEX "Competency_domainId_idx" ON "public"."Competency"("domainId" ASC);

-- CreateIndex
CREATE INDEX "Competency_parentCompetencyId_idx" ON "public"."Competency"("parentCompetencyId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyDomain_code_key" ON "public"."CompetencyDomain"("code" ASC);

-- CreateIndex
CREATE INDEX "CompetencyHistory_competencyId_idx" ON "public"."CompetencyHistory"("competencyId" ASC);

-- CreateIndex
CREATE INDEX "CompetencyHistory_createdAt_idx" ON "public"."CompetencyHistory"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "CompetencyHistory_employeeProfileId_idx" ON "public"."CompetencyHistory"("employeeProfileId" ASC);

-- CreateIndex
CREATE INDEX "Course_difficultyLevel_idx" ON "public"."Course"("difficultyLevel" ASC);

-- CreateIndex
CREATE INDEX "Course_isActive_idx" ON "public"."Course"("isActive" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Course_providerId_externalId_key" ON "public"."Course"("providerId" ASC, "externalId" ASC);

-- CreateIndex
CREATE INDEX "Course_providerId_idx" ON "public"."Course"("providerId" ASC);

-- CreateIndex
CREATE INDEX "CourseCompetency_competencyId_idx" ON "public"."CourseCompetency"("competencyId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CourseCompetency_courseId_competencyId_key" ON "public"."CourseCompetency"("courseId" ASC, "competencyId" ASC);

-- CreateIndex
CREATE INDEX "CourseCompetency_courseId_idx" ON "public"."CourseCompetency"("courseId" ASC);

-- CreateIndex
CREATE INDEX "CourseCompetency_relevanceScore_idx" ON "public"."CourseCompetency"("relevanceScore" ASC);

-- CreateIndex
CREATE INDEX "CourseCompetency_status_idx" ON "public"."CourseCompetency"("status" ASC);

-- CreateIndex
CREATE INDEX "CoursePrerequisite_courseId_idx" ON "public"."CoursePrerequisite"("courseId" ASC);

-- CreateIndex
CREATE INDEX "CoursePrerequisite_prerequisiteCompetencyId_idx" ON "public"."CoursePrerequisite"("prerequisiteCompetencyId" ASC);

-- CreateIndex
CREATE INDEX "CoursePrerequisite_prerequisiteCourseId_idx" ON "public"."CoursePrerequisite"("prerequisiteCourseId" ASC);

-- CreateIndex
CREATE INDEX "CourseProvider_code_idx" ON "public"."CourseProvider"("code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CourseProvider_code_key" ON "public"."CourseProvider"("code" ASC);

-- CreateIndex
CREATE INDEX "CourseProvider_status_idx" ON "public"."CourseProvider"("status" ASC);

-- CreateIndex
CREATE INDEX "CourseRecommendation_competencyId_idx" ON "public"."CourseRecommendation"("competencyId" ASC);

-- CreateIndex
CREATE INDEX "CourseRecommendation_courseId_idx" ON "public"."CourseRecommendation"("courseId" ASC);

-- CreateIndex
CREATE INDEX "CourseRecommendation_employeeProfileId_idx" ON "public"."CourseRecommendation"("employeeProfileId" ASC);

-- CreateIndex
CREATE INDEX "CourseRecommendation_recommendedAt_idx" ON "public"."CourseRecommendation"("recommendedAt" ASC);

-- CreateIndex
CREATE INDEX "CourseSyncRun_providerId_idx" ON "public"."CourseSyncRun"("providerId" ASC);

-- CreateIndex
CREATE INDEX "CourseSyncRun_startedAt_idx" ON "public"."CourseSyncRun"("startedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "public"."Department"("code" ASC);

-- CreateIndex
CREATE INDEX "EmployeeCompetency_competencyId_idx" ON "public"."EmployeeCompetency"("competencyId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeCompetency_employeeProfileId_competencyId_key" ON "public"."EmployeeCompetency"("employeeProfileId" ASC, "competencyId" ASC);

-- CreateIndex
CREATE INDEX "EmployeeCompetency_employeeProfileId_idx" ON "public"."EmployeeCompetency"("employeeProfileId" ASC);

-- CreateIndex
CREATE INDEX "EmployeeProfile_departmentId_idx" ON "public"."EmployeeProfile"("departmentId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_employeeCode_key" ON "public"."EmployeeProfile"("employeeCode" ASC);

-- CreateIndex
CREATE INDEX "EmployeeProfile_jobRoleId_idx" ON "public"."EmployeeProfile"("jobRoleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_userId_key" ON "public"."EmployeeProfile"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_code_key" ON "public"."JobRole"("code" ASC);

-- CreateIndex
CREATE INDEX "JobRole_departmentId_idx" ON "public"."JobRole"("departmentId" ASC);

-- CreateIndex
CREATE INDEX "RoleCompetencyRequirement_competencyId_idx" ON "public"."RoleCompetencyRequirement"("competencyId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "RoleCompetencyRequirement_jobRoleId_competencyId_key" ON "public"."RoleCompetencyRequirement"("jobRoleId" ASC, "competencyId" ASC);

-- CreateIndex
CREATE INDEX "RoleCompetencyRequirement_jobRoleId_idx" ON "public"."RoleCompetencyRequirement"("jobRoleId" ASC);

-- CreateIndex
CREATE INDEX "TrainingEnrollment_courseId_idx" ON "public"."TrainingEnrollment"("courseId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingEnrollment_employeeProfileId_courseId_key" ON "public"."TrainingEnrollment"("employeeProfileId" ASC, "courseId" ASC);

-- CreateIndex
CREATE INDEX "TrainingEnrollment_employeeProfileId_idx" ON "public"."TrainingEnrollment"("employeeProfileId" ASC);

-- CreateIndex
CREATE INDEX "TrainingEnrollment_status_idx" ON "public"."TrainingEnrollment"("status" ASC);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE INDEX "User_systemRole_idx" ON "public"."User"("systemRole" ASC);

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "public"."Competency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentAnswerAttempt" ADD CONSTRAINT "AssessmentAnswerAttempt_assessmentAttemptId_fkey" FOREIGN KEY ("assessmentAttemptId") REFERENCES "public"."AssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentAnswerAttempt" ADD CONSTRAINT "AssessmentAnswerAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."AssessmentQuestionBankItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "public"."Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_employeeProfileId_fkey" FOREIGN KEY ("employeeProfileId") REFERENCES "public"."EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentQuestionBankItem" ADD CONSTRAINT "AssessmentQuestionBankItem_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "public"."Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Competency" ADD CONSTRAINT "Competency_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "public"."CompetencyDomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Competency" ADD CONSTRAINT "Competency_parentCompetencyId_fkey" FOREIGN KEY ("parentCompetencyId") REFERENCES "public"."Competency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompetencyHistory" ADD CONSTRAINT "CompetencyHistory_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "public"."Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompetencyHistory" ADD CONSTRAINT "CompetencyHistory_employeeProfileId_fkey" FOREIGN KEY ("employeeProfileId") REFERENCES "public"."EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."CourseProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseCompetency" ADD CONSTRAINT "CourseCompetency_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseCompetency" ADD CONSTRAINT "CourseCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "public"."Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseCompetency" ADD CONSTRAINT "CourseCompetency_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_prerequisiteCompetencyId_fkey" FOREIGN KEY ("prerequisiteCompetencyId") REFERENCES "public"."Competency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_prerequisiteCourseId_fkey" FOREIGN KEY ("prerequisiteCourseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseRecommendation" ADD CONSTRAINT "CourseRecommendation_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "public"."Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseRecommendation" ADD CONSTRAINT "CourseRecommendation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseRecommendation" ADD CONSTRAINT "CourseRecommendation_employeeProfileId_fkey" FOREIGN KEY ("employeeProfileId") REFERENCES "public"."EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseSyncRun" ADD CONSTRAINT "CourseSyncRun_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."CourseProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeCompetency" ADD CONSTRAINT "EmployeeCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "public"."Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeCompetency" ADD CONSTRAINT "EmployeeCompetency_employeeProfileId_fkey" FOREIGN KEY ("employeeProfileId") REFERENCES "public"."EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "public"."JobRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobRole" ADD CONSTRAINT "JobRole_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoleCompetencyRequirement" ADD CONSTRAINT "RoleCompetencyRequirement_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "public"."Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoleCompetencyRequirement" ADD CONSTRAINT "RoleCompetencyRequirement_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "public"."JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainingEnrollment" ADD CONSTRAINT "TrainingEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainingEnrollment" ADD CONSTRAINT "TrainingEnrollment_employeeProfileId_fkey" FOREIGN KEY ("employeeProfileId") REFERENCES "public"."EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
