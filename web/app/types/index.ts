export type UserRole = "EMPLOYEE" | "TRAINER" | "ADMIN";

export interface UserProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  designation: string;
  department: string;
  ministry: string;
  cadre: string;
  role: UserRole;
  joiningDate: string;
}

export type CompetencyDomain =
  | "Statistical"
  | "Technical"
  | "Digital Governance"
  | "Behavioural / Managerial";

export type CompetencyPriority = "Critical" | "High" | "Medium" | "Low";

export interface Competency {
  id: string;
  code: string;
  name: string;
  domain: CompetencyDomain;
  description: string;
  maxLevel: number;
}

export interface EvidenceItem {
  id: string;
  type: "Diagnostic Assessment" | "Training Completion" | "Practice" | "Post-training Assessment";
  title: string;
  date: string;
  score?: number;
  weight: number;
  sourceDoc?: string;
  page?: number;
}

export interface EmployeeCompetency {
  id: string;
  competencyId: string;
  name: string;
  domain: CompetencyDomain;
  currentLevel: number;
  roleTargetLevel: number;
  gap: number;
  priority: CompetencyPriority;
  lastUpdated: string;
  historicalScores: { date: string; score: number }[];
  evidence: EvidenceItem[];
  importanceForRole: "High" | "Medium" | "Low";
  priorityReason: string;
}

export interface SkillGap {
  id: string;
  competencyId: string;
  competencyName: string;
  domain: CompetencyDomain;
  currentScore: number;
  requiredScore: number;
  gap: number;
  importance: "High" | "Medium" | "Low";
  priority: CompetencyPriority;
  recommendedCourseId?: string;
  recommendedCourseTitle?: string;
  explanation: string;
}

export interface Course {
  id: string;
  title: string;
  provider: "NSSTA Training Academy" | "iGOT Karmayogi Portal" | "MoSPI In-House";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationHours: number;
  matchPercentage: number;
  targetCompetencies: string[];
  description: string;
  recommendationReason: string;
  status: "Not Started" | "In Progress" | "Completed";
  progressPercentage?: number;
  timeRemaining?: string;
  lastActivity?: string;
  thumbnailUrl?: string;
}

export interface LearningPathNode {
  id: string;
  title: string;
  type: "Diagnostic" | "Course" | "Practice" | "Post-Assessment" | "Milestone";
  competencyName: string;
  status: "COMPLETED" | "CURRENT" | "UPCOMING" | "LOCKED";
  duration: string;
  expectedCompetencyImpact: string;
  targetScore: number;
  courseId?: string;
  assessmentId?: string;
}

export interface QuestionOption {
  id: string;
  label: "A" | "B" | "C" | "D";
  text: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  competency: string;
  subCompetency?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  confidenceScore: number; // e.g. 0.94
  sourceDocument: string;
  sourcePage: number;
  sourceChunkId: string;
  sourceSnippet: string;
  status: "APPROVED" | "PENDING_REVIEW" | "REJECTED";
  rejectionReason?: string;
  usageCount: number;
}

export interface Assessment {
  id: string;
  title: string;
  competency: string;
  type: "Diagnostic" | "Adaptive" | "Post-Training" | "Benchmark";
  questionCount: number;
  durationMinutes: number;
  attemptsAllowed: number;
  attemptsUsed: number;
  status: "Assigned" | "Available" | "Completed";
  dueDate?: string;
  lastScore?: number;
  completedDate?: string;
  isAdaptive: boolean;
  questions: Question[];
}

export interface AssessmentAttemptResult {
  assessmentId: string;
  assessmentTitle: string;
  competencyName: string;
  scorePercentage: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpentSeconds: number;
  previousCompetencyScore: number;
  newCompetencyScore: number;
  scoreGain: number;
  averageDifficulty: "Easy" | "Medium" | "Hard";
  strengths: string[];
  weakAreas: string[];
  recommendedReinforcement: {
    title: string;
    courseId: string;
    description: string;
  };
  answers: {
    questionId: string;
    questionText: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: string;
    sourceDocument: string;
    sourcePage: number;
    competency: string;
  }[];
}

export type ProcessingStatus = "Uploaded" | "Processing" | "Ready" | "Failed";

export interface TrainingMaterial {
  id: string;
  title: string;
  programme: string;
  competencyDomain: CompetencyDomain;
  competencies: string[];
  language: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  processingStatus: ProcessingStatus;
  processingProgress: number; // 0 to 100
  questionsGeneratedCount: number;
  pageCount: number;
  chunksCount: number;
  extractedTopics: string[];
}

export interface JobRole {
  id: string;
  title: string;
  department: string;
  employeeCount: number;
  competencyCount: number;
  description: string;
}

export interface RoleCompetencyRequirement {
  id: string;
  roleId: string;
  competencyId: string;
  competencyName: string;
  domain: CompetencyDomain;
  requiredLevel: number; // 0-100
  minimumLevel: number; // 0-100
  priority: CompetencyPriority;
  isMandatory: boolean;
}

export interface DepartmentSummary {
  id: string;
  code: string;
  name: string;
  headOfDept: string;
  employeeCount: number;
  averageCompetency: number;
  criticalGapsCount: number;
  trainingCompletionRate: number;
}

export interface AdminEmployeeListItem {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  competencyScore: number;
  criticalGapsCount: number;
  trainingStatus: "On Track" | "Needs Attention" | "Completed" | "Pending";
  lastAssessmentDate: string;
  status: "Active" | "Inactive";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  target: string;
  details: string;
}
