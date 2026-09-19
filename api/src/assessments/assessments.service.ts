import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdaptiveAssessmentEngineService } from './adaptive-assessment-engine.service';
import {
  QuestionDifficulty,
  AttemptStatus,
  SanitizedAssessmentQuestion,
  AnswerSubmissionResult,
  AssessmentResultSummary,
  MyAssessmentsSummary,
} from './types/assessment.types';
import { StartDiagnosticDto } from './dto/start-diagnostic.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class AssessmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: AdaptiveAssessmentEngineService,
  ) {}

  /**
   * Helper to retrieve the employee profile for the authenticated user.
   */
  private async getEmployeeProfile(userId: number) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { userId },
      include: {
        department: true,
        jobRole: {
          include: {
            requirements: {
              include: {
                competency: {
                  include: {
                    domain: true,
                  },
                },
              },
            },
          },
        },
        competencies: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    return profile;
  }

  /**
   * GET /assessments/my
   */
  async getMyAssessments(userId: number): Promise<{ success: boolean; data: MyAssessmentsSummary }> {
    const profile = await this.getEmployeeProfile(userId);
    const requirements = profile.jobRole?.requirements || [];
    const empCompetencyMap = new Map<number, any>();
    profile.competencies.forEach((ec) => empCompetencyMap.set(ec.competencyId, ec));

    // Active in-progress attempts
    const inProgress = await this.prisma.assessmentAttempt.findMany({
      where: {
        employeeProfileId: profile.id,
        status: AttemptStatus.IN_PROGRESS,
      },
      include: {
        competency: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    const inProgressMap = new Map<number, number>();
    inProgress.forEach((att) => inProgressMap.set(att.competencyId, att.id));

    // Completed attempts
    const completed = await this.prisma.assessmentAttempt.findMany({
      where: {
        employeeProfileId: profile.id,
        status: AttemptStatus.COMPLETED,
      },
      include: {
        competency: true,
      },
      orderBy: { completedAt: 'desc' },
      take: 6,
    });

    const availableDiagnostics = requirements.map((req) => {
      const current = empCompetencyMap.get(req.competencyId);
      const isAssessed = current && current.currentScore !== null;
      const currentScore = isAssessed ? current.currentScore : null;
      const gap = isAssessed ? Math.max(0, req.requiredScore - currentScore) : req.requiredScore;

      return {
        competencyId: req.competencyId,
        code: req.competency.code,
        name: req.competency.name,
        domain: req.competency.domain.name,
        requiredScore: req.requiredScore,
        currentScore,
        gap,
        isMandatory: req.isMandatory,
        needsAssessment: !isAssessed,
        activeAttemptId: inProgressMap.get(req.competencyId),
      };
    });

    return {
      success: true,
      data: {
        availableDiagnostics,
        inProgressAttempts: inProgress.map((att) => ({
          attemptId: att.id,
          competencyId: att.competencyId,
          competencyName: att.competency.name,
          startedAt: att.startedAt,
          currentQuestionIndex: att.currentQuestionIndex,
          totalQuestions: att.totalQuestions,
          currentDifficulty: att.currentDifficulty as QuestionDifficulty,
        })),
        recentCompleted: completed.map((att) => ({
          attemptId: att.id,
          competencyId: att.competencyId,
          competencyName: att.competency.name,
          completedAt: att.completedAt || att.updatedAt,
          rawScore: att.rawScore,
          initialScore: att.initialCompetencyScore,
          finalScore: att.finalCompetencyScore || 0,
        })),
      },
    };
  }

  /**
   * POST /assessments/diagnostic/start
   */
  async startDiagnostic(userId: number, dto: StartDiagnosticDto) {
    const profile = await this.getEmployeeProfile(userId);

    const competency = await this.prisma.competency.findUnique({
      where: { id: dto.competencyId },
    });

    if (!competency) {
      throw new NotFoundException(`Competency with id ${dto.competencyId} not found`);
    }

    // Check for existing active attempt
    let attempt = await this.prisma.assessmentAttempt.findFirst({
      where: {
        employeeProfileId: profile.id,
        competencyId: dto.competencyId,
        status: AttemptStatus.IN_PROGRESS,
      },
      include: {
        answers: true,
      },
    });

    const empComp = await this.prisma.employeeCompetency.findUnique({
      where: {
        employeeProfileId_competencyId: {
          employeeProfileId: profile.id,
          competencyId: dto.competencyId,
        },
      },
    });

    const initialScore = empComp ? empComp.currentScore : null;
    const initialDifficulty = this.engine.determineInitialDifficulty(initialScore);

    if (!attempt) {
      attempt = await this.prisma.assessmentAttempt.create({
        data: {
          employeeProfileId: profile.id,
          competencyId: dto.competencyId,
          status: AttemptStatus.IN_PROGRESS,
          totalQuestions: 10,
          currentQuestionIndex: 0,
          currentDifficulty: initialDifficulty,
          initialCompetencyScore: initialScore,
        },
        include: {
          answers: true,
        },
      });
    }

    // Load available questions from question bank
    const questions = await this.prisma.assessmentQuestionBankItem.findMany({
      where: {
        competencyId: dto.competencyId,
        isActive: true,
      },
    });

    if (questions.length === 0) {
      throw new BadRequestException(
        `No assessment questions available in the question bank for competency ${competency.name}`,
      );
    }

    const seenIds = new Set<number>(attempt.answers.map((a) => a.questionId));
    const nextQuestionItem = this.engine.selectNextQuestion(
      questions,
      seenIds,
      attempt.currentDifficulty as QuestionDifficulty,
    );

    if (!nextQuestionItem) {
      throw new BadRequestException('All questions for this competency have already been evaluated.');
    }

    const sanitized: SanitizedAssessmentQuestion = {
      id: nextQuestionItem.id,
      questionText: nextQuestionItem.questionText,
      difficulty: nextQuestionItem.difficulty as QuestionDifficulty,
      options: nextQuestionItem.options as any,
      questionNumber: attempt.currentQuestionIndex + 1,
      totalQuestions: attempt.totalQuestions,
    };

    return {
      success: true,
      data: {
        attemptId: attempt.id,
        competencyId: competency.id,
        competencyName: competency.name,
        competencyCode: competency.code,
        startedAt: attempt.startedAt,
        initialScore,
        question: sanitized,
      },
    };
  }

  /**
   * POST /assessments/attempts/:attemptId/answer
   */
  async submitAnswer(
    userId: number,
    attemptId: number,
    dto: SubmitAnswerDto,
  ): Promise<{ success: boolean; data: AnswerSubmissionResult }> {
    const profile = await this.getEmployeeProfile(userId);

    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        competency: {
          include: {
            domain: true,
            roleRequirements: {
              where: { jobRoleId: profile.jobRoleId || 0 },
            },
          },
        },
        answers: {
          orderBy: { attemptSequence: 'asc' },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Assessment attempt with id ${attemptId} not found`);
    }

    if (attempt.employeeProfileId !== profile.id) {
      throw new ForbiddenException('You are not authorized to submit answers for this attempt');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('This assessment attempt has already been completed or closed');
    }

    // Check duplicate submission
    const alreadyAnswered = attempt.answers.some((a) => a.questionId === dto.questionId);
    if (alreadyAnswered) {
      throw new BadRequestException('This question has already been answered in this session');
    }

    // Load question
    const question = await this.prisma.assessmentQuestionBankItem.findUnique({
      where: { id: dto.questionId },
    });

    if (!question || question.competencyId !== attempt.competencyId) {
      throw new BadRequestException('Question does not belong to this competency assessment');
    }

    // Evaluate correctness server-side
    const selectedNormalized = dto.selectedOption.trim().toUpperCase();
    const correctNormalized = question.correctOption.trim().toUpperCase();
    const isCorrect = selectedNormalized === correctNormalized;

    // Determine prior mastery for BKT
    const lastAnswer = attempt.answers[attempt.answers.length - 1];
    let priorMasteryProb: number;

    if (lastAnswer && lastAnswer.estimatedMasteryAfter !== null) {
      priorMasteryProb = lastAnswer.estimatedMasteryAfter;
    } else if (attempt.initialCompetencyScore !== null) {
      priorMasteryProb = attempt.initialCompetencyScore / 100;
    } else {
      priorMasteryProb = 0.5; // Default diagnostic prior
    }

    // Run BKT mastery update
    const updatedMasteryProb = await this.engine.updateMasteryProbability(
      priorMasteryProb,
      isCorrect,
      question.difficulty as QuestionDifficulty,
      dto.responseTimeMs,
    );

    const nextIndex = attempt.currentQuestionIndex + 1;
    const newCorrectCount = attempt.correctAnswers + (isCorrect ? 1 : 0);

    // Calculate streak for difficulty progression
    const recentAnswers = [...attempt.answers.map((a) => a.isCorrect), isCorrect];
    let streak = 0;
    for (let i = recentAnswers.length - 1; i >= 0; i--) {
      if (recentAnswers[i] === isCorrect) {
        streak += isCorrect ? 1 : -1;
      } else {
        break;
      }
    }

    const nextDifficulty = this.engine.determineNextDifficulty(
      question.difficulty as QuestionDifficulty,
      isCorrect,
      streak,
    );

    const isCompleted = nextIndex >= attempt.totalQuestions;

    let finalSummary: AssessmentResultSummary | undefined;
    let nextSanitizedQuestion: SanitizedAssessmentQuestion | undefined;

    if (isCompleted) {
      // Assessment Completed Transaction
      const finalScore = Math.round(updatedMasteryProb * 100 * 10) / 10;
      const rawScorePercent = Math.round((newCorrectCount / attempt.totalQuestions) * 100);

      const existingComp = await this.prisma.employeeCompetency.findUnique({
        where: {
          employeeProfileId_competencyId: {
            employeeProfileId: profile.id,
            competencyId: attempt.competencyId,
          },
        },
      });

      const previousScore = existingComp ? existingComp.currentScore : null;
      const newEvidenceCount = (existingComp?.evidenceCount || 0) + attempt.totalQuestions;
      const newConfidence = this.engine.calculateUpdatedConfidence(
        existingComp?.confidence,
        newEvidenceCount,
      );

      const durationSec = Math.round((Date.now() - attempt.startedAt.getTime()) / 1000);

      await this.prisma.$transaction(async (tx) => {
        // 1. Record Answer Attempt
        await tx.assessmentAnswerAttempt.create({
          data: {
            assessmentAttemptId: attempt.id,
            questionId: question.id,
            selectedOption: selectedNormalized,
            isCorrect,
            difficulty: question.difficulty as QuestionDifficulty,
            responseTimeMs: dto.responseTimeMs || null,
            attemptSequence: nextIndex,
            estimatedMasteryBefore: priorMasteryProb,
            estimatedMasteryAfter: updatedMasteryProb,
          },
        });

        // 2. Mark Attempt Completed
        await tx.assessmentAttempt.update({
          where: { id: attempt.id },
          data: {
            status: AttemptStatus.COMPLETED,
            completedAt: new Date(),
            currentQuestionIndex: nextIndex,
            correctAnswers: newCorrectCount,
            rawScore: rawScorePercent,
            finalCompetencyScore: finalScore,
            durationSeconds: durationSec,
          },
        });

        // 3. Upsert Employee Competency
        await tx.employeeCompetency.upsert({
          where: {
            employeeProfileId_competencyId: {
              employeeProfileId: profile.id,
              competencyId: attempt.competencyId,
            },
          },
          update: {
            currentScore: finalScore,
            confidence: newConfidence,
            evidenceCount: newEvidenceCount,
            lastEvaluatedAt: new Date(),
          },
          create: {
            employeeProfileId: profile.id,
            competencyId: attempt.competencyId,
            currentScore: finalScore,
            confidence: newConfidence,
            evidenceCount: newEvidenceCount,
            lastEvaluatedAt: new Date(),
          },
        });

        // 4. Create Competency History Event
        await tx.competencyHistory.create({
          data: {
            employeeProfileId: profile.id,
            competencyId: attempt.competencyId,
            previousScore: previousScore !== null ? previousScore : 0,
            newScore: finalScore,
            confidence: newConfidence,
            changeReason: `Adaptive diagnostic assessment completed (${newCorrectCount}/${attempt.totalQuestions} correct)`,
            sourceType: 'DIAGNOSTIC_ASSESSMENT',
            sourceId: String(attempt.id),
          },
        });
      });

      // Prepare completion summary
      const roleReq = attempt.competency?.roleRequirements?.[0];
      const requiredScore = roleReq ? roleReq.requiredScore : 70;
      const prevGap = previousScore !== null ? Math.max(0, requiredScore - previousScore) : requiredScore;
      const newGap = Math.max(0, requiredScore - finalScore);

      finalSummary = {
        attemptId: attempt.id,
        competencyId: attempt.competencyId,
        competencyName: attempt.competency?.name || 'Competency Assessment',
        competencyCode: attempt.competency?.code || 'STAT_EVAL',
        domainName: attempt.competency?.domain?.name || 'Statistical Methods & Official Frameworks',
        requiredScore,
        previousScore,
        newScore: finalScore,
        scoreChange: previousScore !== null ? Math.round((finalScore - previousScore) * 10) / 10 : finalScore,
        previousGap: prevGap,
        newGap: newGap,
        gapChange: Math.round((prevGap - newGap) * 10) / 10,
        evidenceReliability: newConfidence,
        evidenceCount: newEvidenceCount,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: newCorrectCount,
        accuracy: rawScorePercent,
        durationSeconds: durationSec,
        difficultyBreakdown: {
          easy: { total: 0, correct: 0 },
          medium: { total: 0, correct: 0 },
          hard: { total: 0, correct: 0 },
        },
      };
    } else {
      // In-progress: Persist single answer and load next question
      await this.prisma.$transaction(async (tx) => {
        await tx.assessmentAnswerAttempt.create({
          data: {
            assessmentAttemptId: attempt.id,
            questionId: question.id,
            selectedOption: selectedNormalized,
            isCorrect,
            difficulty: question.difficulty as QuestionDifficulty,
            responseTimeMs: dto.responseTimeMs || null,
            attemptSequence: nextIndex,
            estimatedMasteryBefore: priorMasteryProb,
            estimatedMasteryAfter: updatedMasteryProb,
          },
        });

        await tx.assessmentAttempt.update({
          where: { id: attempt.id },
          data: {
            currentQuestionIndex: nextIndex,
            currentDifficulty: nextDifficulty,
            correctAnswers: newCorrectCount,
          },
        });
      });

      // Select next question
      const allCompQuestions = await this.prisma.assessmentQuestionBankItem.findMany({
        where: {
          competencyId: attempt.competencyId,
          isActive: true,
        },
      });

      const seenIds = new Set<number>([
        ...attempt.answers.map((a) => a.questionId),
        dto.questionId,
      ]);

      const nextQ = this.engine.selectNextQuestion(
        allCompQuestions,
        seenIds,
        nextDifficulty,
      );

      if (nextQ) {
        nextSanitizedQuestion = {
          id: nextQ.id,
          questionText: nextQ.questionText,
          difficulty: nextQ.difficulty as QuestionDifficulty,
          options: nextQ.options as any,
          questionNumber: nextIndex + 1,
          totalQuestions: attempt.totalQuestions,
        };
      }
    }

    return {
      success: true,
      data: {
        isCorrect,
        selectedOption: selectedNormalized,
        // Security: correctOption and explanation are ONLY revealed after the full
        // assessment is complete. Never expose the answer mid-session to prevent
        // frontend exploitation or network sniffing of correct answers.
        correctOption: isCompleted ? correctNormalized : undefined,
        explanation: isCompleted ? question.explanation : undefined,
        estimatedMastery: Math.round(updatedMasteryProb * 100 * 10) / 10,
        nextDifficulty,
        isCompleted,
        nextQuestion: nextSanitizedQuestion,
        resultsSummary: finalSummary,
      },
    };
  }

  /**
   * GET /assessments/attempts/:attemptId/results
   */
  async getAttemptResults(
    userId: number,
    attemptId: number,
  ): Promise<{ success: boolean; data: AssessmentResultSummary }> {
    const profile = await this.getEmployeeProfile(userId);

    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        competency: {
          include: {
            domain: true,
            roleRequirements: {
              where: { jobRoleId: profile.jobRoleId || 0 },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Assessment attempt ${attemptId} not found`);
    }

    if (attempt.employeeProfileId !== profile.id) {
      throw new ForbiddenException('Unauthorized to view this attempt result');
    }

    const empComp = await this.prisma.employeeCompetency.findUnique({
      where: {
        employeeProfileId_competencyId: {
          employeeProfileId: profile.id,
          competencyId: attempt.competencyId,
        },
      },
    });

    const roleReq = attempt.competency?.roleRequirements?.[0];
    const requiredScore = roleReq ? roleReq.requiredScore : 70;
    const finalScore = attempt.finalCompetencyScore || (empComp ? empComp.currentScore : 50);
    const prevScore = attempt.initialCompetencyScore;
    const prevGap = prevScore !== null ? Math.max(0, requiredScore - prevScore) : requiredScore;
    const newGap = Math.max(0, requiredScore - finalScore);

    const breakdown = {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 },
    };

    attempt.answers.forEach((ans) => {
      const diff = (ans.difficulty || 'MEDIUM').toLowerCase() as 'easy' | 'medium' | 'hard';
      if (breakdown[diff]) {
        breakdown[diff].total += 1;
        if (ans.isCorrect) breakdown[diff].correct += 1;
      }
    });

    return {
      success: true,
      data: {
        attemptId: attempt.id,
        competencyId: attempt.competencyId,
        competencyName: attempt.competency?.name || 'Competency Assessment',
        competencyCode: attempt.competency?.code || 'STAT_EVAL',
        domainName: attempt.competency?.domain?.name || 'Statistical Methods & Official Frameworks',
        requiredScore,
        previousScore: prevScore,
        newScore: finalScore,
        scoreChange: prevScore !== null ? Math.round((finalScore - prevScore) * 10) / 10 : finalScore,
        previousGap: prevGap,
        newGap: newGap,
        gapChange: Math.round((prevGap - newGap) * 10) / 10,
        evidenceReliability: empComp?.confidence || 0.8,
        evidenceCount: empComp?.evidenceCount || 10,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        accuracy: attempt.rawScore,
        durationSeconds: attempt.durationSeconds || 180,
        difficultyBreakdown: breakdown,
      },
    };
  }

  /**
   * GET /assessments/:id (Metadata)
   */
  async getAssessmentById(id: number) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        competency: {
          include: {
            domain: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with id ${id} not found`);
    }

    return {
      success: true,
      assessment,
    };
  }
}
