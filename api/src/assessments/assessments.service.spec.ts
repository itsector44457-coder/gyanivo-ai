import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentsService } from './assessments.service';
import { AdaptiveAssessmentEngineService } from './adaptive-assessment-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { AttemptStatus, QuestionDifficulty } from './types/assessment.types';

describe('AssessmentsService', () => {
  let service: AssessmentsService;

  const mockProfile = {
    id: 1,
    userId: 1,
    employeeCode: 'MOSPI-SSS-8842',
    designation: 'Statistical Officer',
    jobRoleId: 1,
    jobRole: {
      requirements: [
        {
          competencyId: 101,
          requiredScore: 70,
          isMandatory: true,
          competency: {
            id: 101,
            code: 'TECH_PYTHON',
            name: 'Python',
            domain: { name: 'Technical' },
          },
        },
      ],
    },
    competencies: [
      {
        competencyId: 101,
        currentScore: 38,
        confidence: 0.72,
        evidenceCount: 4,
      },
    ],
  };

  const mockQuestion = {
    id: 1,
    competencyId: 101,
    questionText: 'What is the correct way to load a CSV in pandas?',
    difficulty: QuestionDifficulty.MEDIUM,
    options: [
      { id: 'A', text: 'pd.read_csv("file.csv")' },
      { id: 'B', text: 'pd.load_csv("file.csv")' },
    ],
    correctOption: 'A',
    explanation: 'pd.read_csv() is the standard pandas function.',
  };

  const mockPrisma = {
    employeeProfile: {
      findUnique: jest.fn().mockResolvedValue(mockProfile),
    },
    competency: {
      findUnique: jest.fn().mockResolvedValue({ id: 101, code: 'TECH_PYTHON', name: 'Python' }),
    },
    employeeCompetency: {
      findUnique: jest.fn().mockResolvedValue({ currentScore: 38, confidence: 0.72, evidenceCount: 4 }),
      upsert: jest.fn().mockResolvedValue({}),
    },
    assessmentAttempt: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 1,
        employeeProfileId: 1,
        competencyId: 101,
        status: AttemptStatus.IN_PROGRESS,
        totalQuestions: 10,
        currentQuestionIndex: 0,
        currentDifficulty: QuestionDifficulty.MEDIUM,
        initialCompetencyScore: 38,
        startedAt: new Date(),
        answers: [],
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        employeeProfileId: 1,
        competencyId: 101,
        status: AttemptStatus.IN_PROGRESS,
        totalQuestions: 1, // trigger completion on 1st answer for test
        currentQuestionIndex: 0,
        correctAnswers: 0,
        startedAt: new Date(),
        initialCompetencyScore: 38,
        competency: {
          id: 101,
          name: 'Python',
          code: 'TECH_PYTHON',
          domain: { name: 'Technical' },
          roleRequirements: [{ requiredScore: 70 }],
        },
        answers: [],
      }),
      update: jest.fn().mockResolvedValue({}),
    },
    assessmentQuestionBankItem: {
      findMany: jest.fn().mockResolvedValue([mockQuestion]),
      findUnique: jest.fn().mockResolvedValue(mockQuestion),
    },
    assessmentAnswerAttempt: {
      create: jest.fn().mockResolvedValue({}),
    },
    competencyHistory: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockImplementation(async (cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentsService,
        {
          provide: AdaptiveAssessmentEngineService,
          useValue: {
            determineInitialDifficulty: jest.fn().mockReturnValue(QuestionDifficulty.MEDIUM),
            determineNextDifficulty: jest.fn().mockReturnValue(QuestionDifficulty.HARD),
            selectNextQuestion: jest.fn().mockReturnValue(mockQuestion),
            updateMasteryProbability: jest.fn().mockResolvedValue(0.51),
            calculateUpdatedConfidence: jest.fn().mockReturnValue(0.85),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AssessmentsService>(AssessmentsService);
  });

  it('should list available diagnostics and unassessed competencies', async () => {
    const res = await service.getMyAssessments(1);
    expect(res.success).toBe(true);
    expect(res.data.availableDiagnostics).toHaveLength(1);
    expect(res.data.availableDiagnostics[0].code).toBe('TECH_PYTHON');
  });

  it('should start a diagnostic assessment and sanitize the question (no correctOption)', async () => {
    const res = await service.startDiagnostic(1, { competencyId: 101 });
    expect(res.success).toBe(true);
    expect(res.data.question).toBeDefined();
    expect(res.data.question.id).toBe(1);
    expect((res.data.question as any).correctOption).toBeUndefined(); // Question security
  });

  it('should evaluate answers server-side, update BKT, and complete attempt', async () => {
    const res = await service.submitAnswer(1, 1, {
      questionId: 1,
      selectedOption: 'A',
      responseTimeMs: 5000,
    });

    expect(res.success).toBe(true);
    expect(res.data.isCorrect).toBe(true);
    expect(res.data.correctOption).toBe('A');
    expect(res.data.explanation).toBeDefined();
    expect(res.data.isCompleted).toBe(true);
    expect(res.data.resultsSummary).toBeDefined();
    expect(res.data.resultsSummary?.newScore).toBe(51);
    expect(res.data.resultsSummary?.evidenceReliability).toBe(0.85);
  });

  it('should NEVER leak correctOption or explanation during in-progress assessment', async () => {
    // Mock an attempt that is not completed after this answer
    mockPrisma.assessmentAttempt.findUnique.mockResolvedValueOnce({
      id: 2,
      employeeProfileId: 1,
      competencyId: 101,
      status: AttemptStatus.IN_PROGRESS,
      totalQuestions: 10,
      currentQuestionIndex: 0,
      correctAnswers: 0,
      startedAt: new Date(),
      initialCompetencyScore: 38,
      competency: {
        id: 101,
        name: 'Python',
        code: 'TECH_PYTHON',
        domain: { name: 'Technical' },
        roleRequirements: [{ requiredScore: 70 }],
      },
      answers: [],
    });

    const res = await service.submitAnswer(1, 2, {
      questionId: 1,
      selectedOption: 'B',
      responseTimeMs: 3000,
    });

    expect(res.success).toBe(true);
    expect(res.data.isCompleted).toBe(false);
    expect(res.data.correctOption).toBeUndefined(); // Must NOT leak
    expect(res.data.explanation).toBeUndefined(); // Must NOT leak
    expect(res.data.nextQuestion).toBeDefined();
  });

  it('should reject duplicate submission for the same question', async () => {
    mockPrisma.assessmentAttempt.findUnique.mockResolvedValueOnce({
      id: 3,
      employeeProfileId: 1,
      competencyId: 101,
      status: AttemptStatus.IN_PROGRESS,
      totalQuestions: 10,
      currentQuestionIndex: 1,
      correctAnswers: 1,
      startedAt: new Date(),
      initialCompetencyScore: 38,
      competency: {
        id: 101,
        name: 'Python',
        code: 'TECH_PYTHON',
        domain: { name: 'Technical' },
        roleRequirements: [{ requiredScore: 70 }],
      },
      answers: [{ questionId: 1, isCorrect: true }],
    });

    await expect(
      service.submitAnswer(1, 3, {
        questionId: 1,
        selectedOption: 'A',
        responseTimeMs: 2000,
      }),
    ).rejects.toThrow('This question has already been answered in this session');
  });
});

