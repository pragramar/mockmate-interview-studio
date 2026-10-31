/** Domain contracts for the AI Interview & Communication Coach. */

export type InterviewMode = "mock" | "guided";

export type TargetRole = "sde" | "backend" | "frontend" | "data" | "ml" | "qa" | "devops" | "other";

export type Seniority = "fresher" | "early" | "mid";

export type Difficulty = "easy" | "intermediate" | "advanced";

export type InterviewDuration = 15 | 30 | 45;

export type Consents = {
  ageConfirmed: boolean;
  processAudio: boolean;
  retainAudio: boolean;
  productImprovement: boolean;
};

export type InterviewConfig = {
  mode: InterviewMode;
  role: TargetRole;
  seniority: Seniority;
  domains: string[];
  jobDescription?: string;
  resumeFileName?: string;
  difficulty: Difficulty;
  language: string;
  durationMinutes: InterviewDuration;
  consents: Consents;
};

export type InterviewStatus = "draft" | "lobby" | "in_progress" | "completed";

export type InterviewSummary = {
  id: string;
  createdAt: string; // ISO date
  mode: InterviewMode;
  role: TargetRole;
  domains: string[];
  difficulty: Difficulty;
  durationMinutes: InterviewDuration;
  status: InterviewStatus;
  reportAvailable: boolean;
  demo?: boolean;
};

export type EvidenceRef = {
  quote: string;
  timestamp: string;
  source: string;
  why: string;
};

export type Strength = {
  title: string;
  observation: string;
  evidence: EvidenceRef;
};

export type Improvement = {
  title: string;
  observedIssue: string;
  evidence: EvidenceRef;
  relevance: string;
  practiceAction: string;
};

export type QuestionResult = {
  id: string;
  question: string;
  responseExcerpt: string;
  expectedConcepts: string[];
  demonstrated: string[];
  missing: string[];
  evaluatorFeedback: string;
  evidenceRef?: string;
};

export type Confidence = "high" | "medium" | "low" | "unavailable";

export type MetricRecord = {
  label: string;
  value: string | null;
  unit?: string;
  confidence: Confidence;
  explanation: string;
};

export type TimelineSegment = {
  kind: "speech" | "silence";
  startSec: number;
  endSec: number;
};

export type SpeechDelivery = {
  wpm: MetricRecord;
  speakingDuration: MetricRecord;
  pauseDuration: MetricRecord;
  fillers: MetricRecord;
  interruptions: MetricRecord;
  transcriptCoverage: MetricRecord;
  timeline: TimelineSegment[];
};

export type LanguageFeedbackItem = {
  original: string;
  correction: string;
  explanation: string;
  meaningPreserved: boolean;
  transcriptionUncertain?: boolean;
};

export type PracticeAction = {
  title: string;
  description: string;
  href: string;
};

export type ScoreAssessment = {
  score: number | null; // 0–100; null when unreliable
  band: string;
  reliability: Confidence;
  note: string;
};

export type Report = {
  id: string;
  sessionId: string;
  mode: InterviewMode;
  role: TargetRole;
  domainSummary: string;
  durationLabel: string;
  evaluatedAnswers: number;
  evidenceQuality: string;
  technical: ScoreAssessment;
  communication: ScoreAssessment;
  strengths: Strength[];
  improvements: Improvement[];
  questions: QuestionResult[];
  speech: SpeechDelivery;
  languageFeedback: LanguageFeedbackItem[];
  resumeFeedback: string[];
  practicePlan: PracticeAction[];
  methodology: {
    deterministic: string[];
    modelGenerated: string[];
    unavailable: string[];
    limitations: string;
  };
  demo: boolean;
};

export type CoachExercise = {
  id: string;
  skill: string;
  title: string;
  difficulty: Difficulty;
  question: string;
  hints: string[]; // escalating hint levels
  explanation: string;
  modelAnswer: string;
};

export type CoachAttempt = {
  id: string;
  exerciseId: string;
  text: string;
  createdAt: string;
};

export type ProgressPoint = {
  label: string;
  technicalScore: number;
  communicationScore: number;
  wordsPerMinute: number;
};

export type PractisedSkill = {
  name: string;
  sessions: number;
  lastPractised: string;
};
