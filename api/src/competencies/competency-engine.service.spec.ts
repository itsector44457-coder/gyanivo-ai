import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyEngineService } from './competency-engine.service';
import { GapSeverity, CompetencyStatus } from './types/competency-engine.types';

describe('CompetencyEngineService', () => {
  let engine: CompetencyEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompetencyEngineService],
    }).compile();

    engine = module.get<CompetencyEngineService>(CompetencyEngineService);
  });

  describe('calculateGap', () => {
    it('should correctly calculate gap when current score is below requirement', () => {
      expect(engine.calculateGap(70, 38)).toBe(32);
      expect(engine.calculateGap(80, 75)).toBe(5);
      expect(engine.calculateGap(60, 25)).toBe(35);
    });

    it('should return 0 when current score equals or exceeds required score (cannot be negative)', () => {
      expect(engine.calculateGap(70, 70)).toBe(0);
      expect(engine.calculateGap(70, 85)).toBe(0);
    });

    it('should return full required score when current score is null (unassessed)', () => {
      expect(engine.calculateGap(60, null)).toBe(60);
    });
  });

  describe('determineSeverity', () => {
    it('should categorize severity according to point deficit rules', () => {
      expect(engine.determineSeverity(0, false)).toBe(GapSeverity.NONE);
      expect(engine.determineSeverity(5, false)).toBe(GapSeverity.LOW);
      expect(engine.determineSeverity(10, false)).toBe(GapSeverity.LOW);
      expect(engine.determineSeverity(15, false)).toBe(GapSeverity.MODERATE);
      expect(engine.determineSeverity(20, false)).toBe(GapSeverity.MODERATE);
      expect(engine.determineSeverity(25, false)).toBe(GapSeverity.HIGH);
      expect(engine.determineSeverity(30, false)).toBe(GapSeverity.HIGH);
      expect(engine.determineSeverity(35, false)).toBe(GapSeverity.CRITICAL);
    });

    it('should mark unassessed competencies as CRITICAL severity', () => {
      expect(engine.determineSeverity(60, true)).toBe(GapSeverity.CRITICAL);
    });
  });

  describe('determineStatus', () => {
    it('should assign correct competency statuses', () => {
      expect(engine.determineStatus(null, 70)).toBe(CompetencyStatus.NOT_ASSESSED);
      expect(engine.determineStatus(38, 70)).toBe(CompetencyStatus.NEEDS_IMPROVEMENT); // < 42 (60% of 70)
      expect(engine.determineStatus(58, 70)).toBe(CompetencyStatus.DEVELOPING); // >= 42 and < 70
      expect(engine.determineStatus(75, 70)).toBe(CompetencyStatus.MEETS_REQUIREMENT); // >= 70 and < 80.5
      expect(engine.determineStatus(90, 70)).toBe(CompetencyStatus.EXCEEDS_REQUIREMENT); // >= 80.5
    });
  });

  describe('calculatePriorityScore', () => {
    it('should give higher priority score to larger gaps and mandatory skills', () => {
      const pythonPriority = engine.calculatePriorityScore(32, 70, 1.0, true, 0.72, false);
      const statsPriority = engine.calculatePriorityScore(5, 80, 1.0, true, 0.85, false);

      expect(pythonPriority).toBeGreaterThan(statsPriority);
      expect(pythonPriority).toBeLessThanOrEqual(1.0);
      expect(statsPriority).toBeGreaterThanOrEqual(0.0);
    });

    it('should return 0.0 for zero gap if assessed', () => {
      expect(engine.calculatePriorityScore(0, 70, 1.0, true, 0.9, false)).toBe(0.0);
    });
  });

  describe('calculateOverallScore', () => {
    it('should calculate weighted average score for assessed competencies', () => {
      const evaluations: any[] = [
        { currentScore: 75, priorityWeight: 1.0 },
        { currentScore: 38, priorityWeight: 1.5 },
        { currentScore: null, priorityWeight: 1.0 }, // Excluded from assessed average
      ];

      // (75 * 1.0 + 38 * 1.5) / (1.0 + 1.5) = (75 + 57) / 2.5 = 132 / 2.5 = 52.8
      expect(engine.calculateOverallScore(evaluations)).toBe(52.8);
    });

    it('should return 0 if no competencies are assessed', () => {
      const evaluations: any[] = [
        { currentScore: null, priorityWeight: 1.0 },
      ];
      expect(engine.calculateOverallScore(evaluations)).toBe(0);
    });
  });

  describe('evaluateCompetencies & Live Demo Scenario', () => {
    it('should correctly evaluate the MoSPI Statistical Officer scenario', () => {
      const requirements = [
        {
          id: 1,
          requiredScore: 80,
          priorityWeight: 1.2,
          isMandatory: true,
          competency: { id: 101, code: 'STAT_SAMPLING', name: 'Sampling', domainId: 1, domain: { id: 1, code: 'STATISTICAL', name: 'Statistical' } },
        },
        {
          id: 2,
          requiredScore: 70,
          priorityWeight: 1.5,
          isMandatory: true,
          competency: { id: 102, code: 'TECH_PYTHON', name: 'Python', domainId: 2, domain: { id: 2, code: 'TECHNICAL', name: 'Technical' } },
        },
        {
          id: 3,
          requiredScore: 65,
          priorityWeight: 1.0,
          isMandatory: true,
          competency: { id: 103, code: 'TECH_SQL', name: 'SQL', domainId: 2, domain: { id: 2, code: 'TECHNICAL', name: 'Technical' } },
        },
        {
          id: 4,
          requiredScore: 60,
          priorityWeight: 1.3,
          isMandatory: true,
          competency: { id: 104, code: 'TECH_GIS', name: 'GIS', domainId: 2, domain: { id: 2, code: 'TECHNICAL', name: 'Technical' } },
        },
      ];

      const employeeCompetencies = [
        { competencyId: 101, currentScore: 75, confidence: 0.85, evidenceCount: 8, lastEvaluatedAt: new Date() },
        { competencyId: 102, currentScore: 38, confidence: 0.72, evidenceCount: 4, lastEvaluatedAt: new Date() },
        { competencyId: 103, currentScore: 58, confidence: 0.8, evidenceCount: 6, lastEvaluatedAt: new Date() },
        { competencyId: 104, currentScore: 25, confidence: 0.65, evidenceCount: 3, lastEvaluatedAt: new Date() },
      ];

      const results = engine.evaluateCompetencies(requirements, employeeCompetencies, 'Statistical Officer');

      const sampling = results.find((r) => r.code === 'STAT_SAMPLING')!;
      const python = results.find((r) => r.code === 'TECH_PYTHON')!;
      const sql = results.find((r) => r.code === 'TECH_SQL')!;
      const gis = results.find((r) => r.code === 'TECH_GIS')!;

      expect(sampling.gap).toBe(5);
      expect(sampling.severity).toBe(GapSeverity.LOW);

      expect(python.gap).toBe(32);
      expect(python.severity).toBe(GapSeverity.CRITICAL);

      expect(sql.gap).toBe(7);
      expect(sql.severity).toBe(GapSeverity.LOW);

      expect(gis.gap).toBe(35);
      expect(gis.severity).toBe(GapSeverity.CRITICAL);

      // Results must be sorted descending by priority (GIS/Python at top)
      expect(['TECH_PYTHON', 'TECH_GIS']).toContain(results[0].code);
      expect(['TECH_PYTHON', 'TECH_GIS']).toContain(results[1].code);
    });
  });
});
