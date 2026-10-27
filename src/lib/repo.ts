import {
  COACH_EXERCISES,
  DEMO_INTERVIEWS,
  MOCK_INTERVIEW_SCRIPT,
  SAMPLE_REPORT,
} from "@/data/fixtures";
import type {
  CoachExercise,
  InterviewConfig,
  InterviewSummary,
  Report,
} from "@/types";

/**
 * Demo data layer.
 *
 * All state is local to the browser (localStorage + fixtures). Nothing here
 * talks to a backend; callers must present results as demonstration data.
 */

const SESSIONS_KEY = "interview-coach-sessions";
const CONFIG_KEY = "interview-coach-last-config";

function readLocalSessions(): StoredSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as StoredSession[]) : [];
  } catch {
    return [];
  }
}

function writeLocalSessions(sessions: StoredSession[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // Storage unavailable: session still works in memory for this page.
  }
}

export type StoredSession = {
  summary: InterviewSummary;
  config: InterviewConfig;
};

export function newSessionId(): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `s-${Date.now().toString(36)}-${random}`;
}

export function createSession(config: InterviewConfig): StoredSession {
  const id = newSessionId();
  const summary: InterviewSummary = {
    id,
    createdAt: new Date().toISOString(),
    mode: config.mode,
    role: config.role,
    domains: config.domains,
    difficulty: config.difficulty,
    durationMinutes: config.durationMinutes,
    status: "lobby",
    reportAvailable: false,
    demo: true,
  };
  const session: StoredSession = { summary, config };
  const all = [session, ...readLocalSessions().filter((s) => s.summary.id !== id)];
  writeLocalSessions(all);
  saveLastConfig(config);
  return session;
}

export function getSession(id: string): StoredSession | undefined {
  const local = readLocalSessions().find((s) => s.summary.id === id);
  if (local) return local;
  const fixture = DEMO_INTERVIEWS.find((d) => d.id === id);
  if (fixture) {
    return {
      summary: fixture,
      config: defaultConfig(fixture.mode),
    };
  }
  return undefined;
}

export function updateSessionStatus(id: string, status: InterviewSummary["status"]) {
  const all = readLocalSessions();
  const found = all.find((s) => s.summary.id === id);
  if (!found) return;
  found.summary.status = status;
  writeLocalSessions(all);
}

export function markReportAvailable(id: string) {
  const all = readLocalSessions();
  const found = all.find((s) => s.summary.id === id);
  if (!found) return;
  found.summary.status = "completed";
  found.summary.reportAvailable = true;
  writeLocalSessions(all);
}

export function listInterviews(): InterviewSummary[] {
  const local = readLocalSessions().map((s) => s.summary);
  const fixtureIds = new Set(DEMO_INTERVIEWS.map((d) => d.id));
  const merged = [...local, ...DEMO_INTERVIEWS.filter((d) => !fixtureIds.has(d.id))];
  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getReport(sessionId: string): Report | undefined {
  const known =
    DEMO_INTERVIEWS.some((d) => d.id === sessionId) ||
    readLocalSessions().some((s) => s.summary.id === sessionId);
  if (!known) return undefined;
  const local = readLocalSessions().find((s) => s.summary.id === sessionId);
  const config = local?.config;
  return {
    ...SAMPLE_REPORT,
    id: `report-${sessionId}`,
    sessionId,
    mode: config?.mode ?? SAMPLE_REPORT.mode,
    role: config?.role ?? SAMPLE_REPORT.role,
    domainSummary: config?.domains?.join(" · ") ?? SAMPLE_REPORT.domainSummary,
    durationLabel: config ? `${config.durationMinutes} min` : SAMPLE_REPORT.durationLabel,
  };
}

export function getExercise(id: string): CoachExercise | undefined {
  return COACH_EXERCISES.find((e) => e.id === id);
}

export function listExercises(): CoachExercise[] {
  return COACH_EXERCISES;
}

export function getInterviewScript() {
  return MOCK_INTERVIEW_SCRIPT;
}

export function saveLastConfig(config: InterviewConfig) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // Non-critical.
  }
}

export function loadLastConfig(): InterviewConfig | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    return raw ? (JSON.parse(raw) as InterviewConfig) : undefined;
  } catch {
    return undefined;
  }
}

export function defaultConfig(mode: "mock" | "guided"): InterviewConfig {
  return {
    mode,
    role: "sde",
    seniority: "fresher",
    domains: mode === "guided" ? ["Data structures"] : ["Data structures", "Algorithms"],
    difficulty: "intermediate",
    language: "English",
    durationMinutes: 30,
    consents: {
      ageConfirmed: false,
      processAudio: false,
      retainAudio: false,
      productImprovement: false,
    },
  };
}
