import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileText, Lightbulb, Mic, ShieldCheck, Upload } from "lucide-react";
import { useState } from "react";

import { DemoLabel } from "@/components/demo-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSession, defaultConfig } from "@/lib/repo";
import { cn } from "@/lib/utils";
import type {
  Difficulty,
  InterviewConfig,
  InterviewDuration,
  Seniority,
  TargetRole,
} from "@/types";

export const Route = createFileRoute("/interview/new")({
  head: () => ({
    meta: [
      { title: "New interview — Ripple Interview Coach" },
      {
        name: "description",
        content:
          "Configure a mock interview or guided practice: role, domains, difficulty, duration, resume and consent.",
      },
      { property: "og:title", content: "Set up an interview — Ripple" },
      {
        property: "og:description",
        content: "Configure a mock interview or guided practice session.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: InterviewSetupPage,
});

const STEPS = [
  { id: 1, label: "Mode" },
  { id: 2, label: "Preferences" },
  { id: 3, label: "Consent" },
  { id: 4, label: "Review" },
] as const;

const ROLES: { value: TargetRole; label: string }[] = [
  { value: "sde", label: "SDE" },
  { value: "backend", label: "Backend" },
  { value: "frontend", label: "Frontend" },
  { value: "data", label: "Data" },
  { value: "ml", label: "ML" },
  { value: "qa", label: "QA" },
  { value: "devops", label: "DevOps" },
  { value: "other", label: "Other" },
];

const SENIORITIES: { value: Seniority; label: string }[] = [
  { value: "fresher", label: "Fresher" },
  { value: "early", label: "0–2 years" },
  { value: "mid", label: "2–5 years" },
];

const DOMAINS = [
  "Data structures",
  "Algorithms",
  "System design",
  "Databases",
  "JavaScript",
  "React",
  "Networking",
  "Operating systems",
  "OOP",
];

const RESUME_MAX_BYTES = 5 * 1024 * 1024;

function StepIndicator({ step, onJump }: { step: number; onJump: (step: number) => void }) {
  return (
    <ol aria-label="Setup progress" className="flex flex-wrap items-center gap-2 sm:gap-4">
      {STEPS.map((s, index) => {
        const state = s.id === step ? "current" : s.id < step ? "done" : "upcoming";
        return (
          <li key={s.id} className="flex items-center gap-2 sm:gap-4">
            {index > 0 && <span aria-hidden className="h-px w-6 bg-border sm:w-10" />}
            <button
              type="button"
              onClick={() => s.id < step && onJump(s.id)}
              disabled={s.id >= step}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full px-1 py-0.5 text-sm",
                state === "current" && "font-semibold",
                state === "done" && "text-muted-foreground hover:text-foreground cursor-pointer",
                state === "upcoming" && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                  state === "current" && "bg-primary text-primary-foreground",
                  state === "done" && "border border-primary text-primary",
                  state === "upcoming" && "border border-border text-muted-foreground",
                )}
              >
                {s.id}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function InterviewSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<InterviewConfig>(() => defaultConfig("mock"));
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  const update = (patch: Partial<InterviewConfig>) => setConfig((c) => ({ ...c, ...patch }));

  const handleResume = (file: File | undefined) => {
    setResumeError(null);
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setResumeError("Only PDF resumes are accepted.");
      return;
    }
    if (file.size > RESUME_MAX_BYTES) {
      setResumeError("Resume must be 5 MB or smaller.");
      return;
    }
    update({ resumeFileName: file.name });
  };

  const goToConsent = () => {
    if (config.domains.length === 0) {
      setDomainError("Pick at least one domain so the interview has focus.");
      return;
    }
    setDomainError(null);
    setStep(3);
  };

  const goToReview = () => {
    if (!config.consents.ageConfirmed || !config.consents.processAudio) {
      setConsentError(
        "Age confirmation and audio processing consent are required to run an interview.",
      );
      return;
    }
    setConsentError(null);
    setStep(4);
  };

  const finish = () => {
    const session = createSession(config);
    if (config.mode === "guided") {
      // Guided practice is exercise-based: hand off to the coach's exercise picker.
      navigate({ to: "/coach", search: {} });
    } else {
      navigate({ to: "/interview/lobby/$id", params: { id: session.summary.id } });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border print-hide">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <a href="/dashboard">
              <ArrowLeft className="size-4" /> Dashboard
            </a>
          </Button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            Interview setup <DemoLabel />
          </div>
          <span className="w-24" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <StepIndicator step={step} onJump={setStep} />

        {/* Step 1 — Mode */}
        {step === 1 && (
          <section aria-label="Select interview mode" className="mt-8">
            <h1 className="text-2xl font-semibold tracking-tight">How do you want to practise?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              These two modes are deliberately different — what they show while you work is not the
              same.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                {
                  mode: "mock" as const,
                  icon: Mic,
                  title: "Realistic Mock Interview",
                  body: "Test your knowledge under assessment conditions. Detailed feedback comes after the interview.",
                  points: [
                    "No hints or answers during the session",
                    "Timer, progress and follow-up questions",
                    "Evidence-based report at the end",
                  ],
                },
                {
                  mode: "guided" as const,
                  icon: Lightbulb,
                  title: "Guided Practice Coach",
                  body: "Learn through hints, explanations, retries, and targeted feedback.",
                  points: [
                    "Hints at the level you choose",
                    "Model answers after you attempt",
                    "Attempt-to-attempt comparison",
                  ],
                },
              ].map((option) => {
                const selected = config.mode === option.mode;
                const Icon = option.icon;
                return (
                  <button
                    key={option.mode}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => update({ mode: option.mode })}
                    className={cn(
                      "rounded-xl border p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      selected
                        ? "border-primary bg-secondary"
                        : "border-border bg-card hover:bg-accent",
                    )}
                  >
                    <Icon className="size-5 text-primary" aria-hidden />
                    <p className="mt-3 font-semibold">{option.title}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{option.body}</p>
                    <ul className="mt-4 space-y-1.5">
                      {option.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <span
                            aria-hidden
                            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setStep(2)}>
                Continue <ArrowRight className="size-4" />
              </Button>
            </div>
          </section>
        )}

        {/* Step 2 — Preferences */}
        {step === 2 && (
          <section aria-label="Configure interview preferences" className="mt-8">
            <h1 className="text-2xl font-semibold tracking-tight">Configure the interview</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sensible defaults are pre-filled for a fresher preparing for technical interviews.
            </p>
            <div className="mt-6 space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Target role</Label>
                  <Select
                    value={config.role}
                    onValueChange={(v) => update({ role: v as TargetRole })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seniority">Seniority</Label>
                  <Select
                    value={config.seniority}
                    onValueChange={(v) => update({ seniority: v as Seniority })}
                  >
                    <SelectTrigger id="seniority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SENIORITIES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Domain focus</Label>
                <p className="text-xs text-muted-foreground">
                  Pick one or more topics to emphasise.
                </p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Domain focus">
                  {DOMAINS.map((domain) => {
                    const selected = config.domains.includes(domain);
                    return (
                      <button
                        key={domain}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          update({
                            domains: selected
                              ? config.domains.filter((d) => d !== domain)
                              : [...config.domains, domain],
                          })
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:bg-accent",
                        )}
                      >
                        {domain}
                      </button>
                    );
                  })}
                </div>
                {domainError && (
                  <p role="alert" className="text-sm text-destructive">
                    {domainError}
                  </p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={config.difficulty}
                    onValueChange={(v) => update({ difficulty: v as Difficulty })}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    value={String(config.durationMinutes)}
                    onValueChange={(v) =>
                      update({ durationMinutes: Number(v) as InterviewDuration })
                    }
                  >
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jd">Job description (optional)</Label>
                <Textarea
                  id="jd"
                  value={config.jobDescription ?? ""}
                  onChange={(event) => update({ jobDescription: event.target.value })}
                  placeholder="Paste the job posting — questions will draw on it where it overlaps with your domains."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">Resume (PDF, up to 5 MB)</Label>
                {config.resumeFileName ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/60 px-3 py-2.5">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <FileText className="size-4 shrink-0 text-primary" aria-hidden />
                      <span className="truncate">{config.resumeFileName}</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setConfig((c) => { const next = { ...c }; delete next.resumeFileName; return next; });
                        setResumeError(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="resume"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-card px-3 py-6 text-sm text-muted-foreground transition-colors hover:bg-accent"
                  >
                    <Upload className="size-4" aria-hidden /> Upload your resume
                    <input
                      id="resume"
                      type="file"
                      accept="application/pdf,.pdf"
                      className="sr-only"
                      onChange={(event) => handleResume(event.target.files?.[0])}
                    />
                  </label>
                )}
                {resumeError && (
                  <p role="alert" className="text-sm text-destructive">
                    {resumeError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  The demo records only the file name — no file is uploaded anywhere.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Interview language</Label>
                <Select value={config.language} onValueChange={(v) => update({ language: v })}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only English is supported in this demonstration build.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button onClick={goToConsent}>
                Continue <ArrowRight className="size-4" />
              </Button>
            </div>
          </section>
        )}

        {/* Step 3 — Consent */}
        {step === 3 && (
          <section aria-label="Consent and privacy" className="mt-8">
            <h1 className="text-2xl font-semibold tracking-tight">Consent and privacy</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              In a connected build, your audio is transcribed and analysed to produce feedback. That
              processing is not private from the AI provider that performs it — this demo makes no
              claim otherwise, and everything here is simulated anyway.
            </p>
            <div className="mt-6 space-y-4">
              {[
                {
                  key: "ageConfirmed" as const,
                  required: true,
                  title: "I confirm I am 18 or older",
                  detail:
                    "Required. This demo is intended for adults preparing for employment interviews.",
                },
                {
                  key: "processAudio" as const,
                  required: true,
                  title: "I consent to my audio being processed for this interview",
                  detail:
                    "Required for mock interviews. Audio is transcribed and analysed to produce the report.",
                },
                {
                  key: "retainAudio" as const,
                  required: false,
                  title: "Retain my audio so I can review my answers later",
                  detail:
                    "Optional, off by default. Retained audio stays available until you delete it.",
                },
                {
                  key: "productImprovement" as const,
                  required: false,
                  title: "Allow anonymised use of my excerpts to improve the product",
                  detail: "Optional, off by default. No such pipeline exists in this demo.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4",
                    item.required ? "border-border bg-card" : "border-border bg-secondary/50",
                  )}
                >
                  <Checkbox
                    id={item.key}
                    checked={config.consents[item.key]}
                    onCheckedChange={(checked) =>
                      update({
                        consents: { ...config.consents, [item.key]: checked === true },
                      })
                    }
                    className="mt-0.5"
                    aria-describedby={`${item.key}-detail`}
                  />
                  <div>
                    <Label htmlFor={item.key} className="text-sm font-medium">
                      {item.title}
                      {item.required && (
                        <Badge
                          variant="outline"
                          className="ml-2 border-border bg-background text-[10px]"
                        >
                          Required
                        </Badge>
                      )}
                    </Label>
                    <p id={`${item.key}-detail`} className="mt-1 text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
              {consentError && (
                <p role="alert" className="text-sm text-destructive">
                  {consentError}
                </p>
              )}
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button onClick={goToReview}>
                <ShieldCheck className="size-4" /> Continue to review
              </Button>
            </div>
          </section>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <section aria-label="Review configuration" className="mt-8">
            <h1 className="text-2xl font-semibold tracking-tight">Review your setup</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything below was captured from your earlier steps. Edit a section if something
              looks off.
            </p>
            <div className="mt-6 space-y-3">
              {[
                {
                  title: "Mode",
                  edit: () => setStep(1),
                  rows: [
                    [
                      config.mode === "mock" ? "Realistic Mock Interview" : "Guided Practice Coach",
                      config.mode === "mock"
                        ? "Assessment conditions; feedback after the interview."
                        : "Hints, retries and model answers as you practise.",
                    ],
                  ],
                },
                {
                  title: "Preferences",
                  edit: () => setStep(2),
                  rows: [
                    [
                      "Target role",
                      ROLES.find((r) => r.value === config.role)?.label ?? config.role,
                    ],
                    [
                      "Seniority",
                      SENIORITIES.find((s) => s.value === config.seniority)?.label ??
                        config.seniority,
                    ],
                    ["Domain focus", config.domains.join(", ") || "—"],
                    [
                      "Difficulty",
                      config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1),
                    ],
                    ["Duration", `${config.durationMinutes} minutes`],
                    ["Language", config.language],
                    ["Job description", config.jobDescription?.trim() ? "Added" : "Not provided"],
                    ["Resume", config.resumeFileName ?? "Not uploaded"],
                  ],
                },
                {
                  title: "Consent",
                  edit: () => setStep(3),
                  rows: [
                    [
                      "Age confirmation (18+)",
                      config.consents.ageConfirmed ? "Confirmed" : "Not confirmed",
                    ],
                    [
                      "Audio processing",
                      config.consents.processAudio ? "Consented" : "Not consented",
                    ],
                    ["Audio retention", config.consents.retainAudio ? "Yes" : "No"],
                    ["Product improvement use", config.consents.productImprovement ? "Yes" : "No"],
                  ],
                },
              ].map((section) => (
                <Card key={section.title}>
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={section.edit}>
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[180px_1fr]">
                      {section.rows.map(([label, value]) => (
                        <div key={label} className="contents">
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
              ))}
            </div>
            {consentError && (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {consentError}
              </p>
            )}
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button onClick={finish}>
                {config.mode === "mock" ? "Go to the lobby" : "Open the coach"}{" "}
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Demo build: sessions are created locally in your browser and clearly labelled as
              demonstration data.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
