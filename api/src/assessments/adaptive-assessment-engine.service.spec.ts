import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AdaptiveAssessmentEngineService } from './adaptive-assessment-engine.service';
import { QuestionDifficulty } from './types/assessment.types';

describe('AdaptiveAssessmentEngineService', () => {
  let engine: AdaptiveAssessmentEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdaptiveAssessmentEngineService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8000'),
          },
        },
      ],
    }).compile();

    engine = module.get<AdaptiveAssessmentEngineService>(AdaptiveAssessmentEngineService);
  });

  describe('determineInitialDifficulty', () => {
    it('should assign MEDIUM for unassessed competency (null / undefined)', () => {
      expect(engine.determineInitialDifficulty(null)).toBe(QuestionDifficulty.MEDIUM);
      expect(engine.determineInitialDifficulty(undefined)).toBe(QuestionDifficulty.MEDIUM);
    });

    it('should assign EASY for low competency score (<35)', () => {
      expect(engine.determineInitialDifficulty(25)).toBe(QuestionDifficulty.EASY);
      expect(engine.determineInitialDifficulty(0)).toBe(QuestionDifficulty.EASY);
    });

    it('should assign MEDIUM for moderate competency score (35-70)', () => {
      expect(engine.determineInitialDifficulty(38)).toBe(QuestionDifficulty.MEDIUM);
      expect(engine.determineInitialDifficulty(60)).toBe(QuestionDifficulty.MEDIUM);
      expect(engine.determineInitialDifficulty(70)).toBe(QuestionDifficulty.MEDIUM);
    });

    it('should assign HARD for high competency score (>70)', () => {
      expect(engine.determineInitialDifficulty(75)).toBe(QuestionDifficulty.HARD);
      expect(engine.determineInitialDifficulty(95)).toBe(QuestionDifficulty.HARD);
    });
  });

  describe('determineNextDifficulty', () => {
    it('should promote EASY to MEDIUM after correct streak', () => {
      expect(
        engine.determineNextDifficulty(QuestionDifficulty.EASY, true, 1),
      ).toBe(QuestionDifficulty.MEDIUM);
    });

    it('should promote MEDIUM to HARD after consecutive correct streak >= 2', () => {
      expect(
        engine.determineNextDifficulty(QuestionDifficulty.MEDIUM, true, 1),
      ).toBe(QuestionDifficulty.MEDIUM);
      expect(
        engine.determineNextDifficulty(QuestionDifficulty.MEDIUM, true, 2),
      ).toBe(QuestionDifficulty.HARD);
    });

    it('should demote HARD to MEDIUM after incorrect streak', () => {
      expect(
        engine.determineNextDifficulty(QuestionDifficulty.HARD, false, -1),
      ).toBe(QuestionDifficulty.MEDIUM);
    });

    it('should demote MEDIUM to EASY after consecutive incorrect streak <= -2', () => {
      expect(
        engine.determineNextDifficulty(QuestionDifficulty.MEDIUM, false, -1),
      ).toBe(QuestionDifficulty.MEDIUM);
      expect(
        engine.determineNextDifficulty(QuestionDifficulty.MEDIUM, false, -2),
      ).toBe(QuestionDifficulty.EASY);
    });
  });

  describe('selectNextQuestion', () => {
    const mockQuestions = [
      { id: 1, difficulty: QuestionDifficulty.EASY },
      { id: 2, difficulty: QuestionDifficulty.EASY },
      { id: 3, difficulty: QuestionDifficulty.MEDIUM },
      { id: 4, difficulty: QuestionDifficulty.HARD },
    ];

    it('should select unseen question matching target difficulty', () => {
      const seen = new Set<number>([1]);
      const nextQ = engine.selectNextQuestion(mockQuestions, seen, QuestionDifficulty.EASY);
      expect(nextQ).toBeDefined();
      expect(nextQ?.id).toBe(2);
      expect(nextQ?.difficulty).toBe(QuestionDifficulty.EASY);
    });

    it('should fallback gracefully when target difficulty questions are exhausted', () => {
      const seen = new Set<number>([4]); // HARD is exhausted
      const nextQ = engine.selectNextQuestion(mockQuestions, seen, QuestionDifficulty.HARD);
      expect(nextQ).toBeDefined();
      expect([QuestionDifficulty.MEDIUM, QuestionDifficulty.EASY]).toContain(nextQ?.difficulty);
    });

    it('should return null when all questions are exhausted', () => {
      const seen = new Set<number>([1, 2, 3, 4]);
      const nextQ = engine.selectNextQuestion(mockQuestions, seen, QuestionDifficulty.MEDIUM);
      expect(nextQ).toBeNull();
    });
  });

  describe('calculateLocalBKT', () => {
    it('should increase mastery probability on correct answer', () => {
      const prior = 0.38;
      const updated = engine.calculateLocalBKT(prior, true, QuestionDifficulty.MEDIUM);
      expect(updated).toBeGreaterThan(prior);
      expect(updated).toBeLessThanOrEqual(0.99);
    });

    it('should decrease mastery probability on incorrect answer', () => {
      const prior = 0.65;
      const updated = engine.calculateLocalBKT(prior, false, QuestionDifficulty.MEDIUM);
      expect(updated).toBeLessThan(prior);
      expect(updated).toBeGreaterThanOrEqual(0.01);
    });

    it('should give higher upward movement for correct HARD question than correct EASY question', () => {
      const prior = 0.50;
      const hardResult = engine.calculateLocalBKT(prior, true, QuestionDifficulty.HARD);
      const easyResult = engine.calculateLocalBKT(prior, true, QuestionDifficulty.EASY);
      expect(hardResult).toBeGreaterThanOrEqual(easyResult);
    });
  });

  describe('calculateUpdatedConfidence', () => {
    it('should increase statistical confidence deterministically with evidence count', () => {
      const initial = 0.50;
      const updated = engine.calculateUpdatedConfidence(initial, 10);
      expect(updated).toBeGreaterThan(initial);
      expect(updated).toBeLessThanOrEqual(0.95);
    });
  });
});
