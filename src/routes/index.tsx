import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  AudioLines,
  BadgeCheck,
  BookOpenCheck,
  CircleDot,
  FileText,
  Lightbulb,
  ListChecks,
  MessagesSquare,
  Mic,
  MicOff,
  ShieldCheck,
  Timer,
  TriangleAlert,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Ripple — Practice the interview, improve with evidence",
      },
      {
        name: "description",
        content:
          "Realistic technical mock interviews and guided practice for B.Tech CSE students and early-career engineers, with feedback grounded in what you actually said.",
      },
      { property: "og:title", content: "Ripple — AI Interview & Communication Coach" },
      {
        property: "og:description",
        content: "Practice the interview. Understand your performance. Improve with evidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

/* ------------------------------------------------------------------ */
/* Hero product preview — built from real UI patterns, not an image.  */
/* ------------------------------------------------------------------ */

function AudioBars({ className = "" }: { className?: string }) {
  const bars = [6, 11, 7, 14, 9, 5, 12, 8, 15, 7, 10, 6];
  return (
    <div className={`flex items-end gap-1 ${className}`} aria-hidden>
      {bars.map((height, index) => (
        <span
          key={index}
          className="w-1 rounded-full bg-primary/70"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      {/* Session header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex size-2 rounded-full bg-primary" aria-hidden />
          <span>Mock interview · Backend · 30 min</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 tabular-nums">
            <Timer className="size-3.5" aria-hidden /> 12:41
          </span>
          <span className="flex items-center gap-1.5">
            <Mic className="size-3.5 text-primary" aria-hidden /> Live
          </span>
        </div>
      </div>
      {/* Question area */}
      <div className="px-4 py-5 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Question 3 of 5 · System design
        </p>
        <p className="mt-2 text-sm leading-relaxed sm:text-base">
          "Design the schema for <em>orders</em> when the hot query is the last N orders per user.
          Take me through your choices."
        </p>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-secondary px-3 py-2.5">
          <AudioBars />
          <span className="text-xs text-muted-foreground">Interviewer speaking</span>
        </div>
        {/* Transcript excerpt */}
        <div className="mt-4 rounded-lg border border-border bg-background p-3">
          <p className="text-xs font-medium text-foreground">Your answer</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            "I'd index on user_id plus created_at because the hot query is 'last N orders per
            user'…"
          </p>
        </div>
      </div>
      {/* Evidence-linked report preview */}
      <div className="rounded-b-2xl border-t border-border bg-secondary/60 px-4 py-4 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          After the interview — report preview
        </p>
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2.5">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            <p className="text-xs leading-relaxed">
              <span className="font-medium">Structured answers</span> — summary-first pattern at
              4:12, Q2.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <p className="text-xs leading-relaxed">
              <span className="font-medium">Scaling arguments stay qualitative</span> — no estimates
              in the sharding answer, 14:02.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" asChild>
            <Link to="/interview/report/$id" params={{ id: "demo-1" }}>
              View a sample report <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                           */
/* ------------------------------------------------------------------ */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

function TwoModes() {
  return (
    <section id="modes" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Two ways to practise"
        title="Assessment conditions, or a coach on your side."
        description="The same design system, two visibly different experiences. What each mode shows — and withholds — is deliberate."
      />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <Mic className="size-4" aria-hidden />
            </span>
            <h3 className="text-lg font-semibold">Realistic mock interview</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A neutral interviewer, a timer, and questions that follow up on what you said. No hints,
            no corrections, no model answers while the interview runs — exactly like the real thing.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              "Scores and feedback appear only after you finish",
              "Progress, elapsed time and mic state stay visible",
              "End or interrupt the interview at any point",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CircleDot className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <Button className="mt-6 self-start" asChild>
            <Link to="/interview/new">
              Start a mock interview <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="flex flex-col rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <Lightbulb className="size-4" aria-hidden />
            </span>
            <h3 className="text-lg font-semibold">Guided practice coach</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A warmer, instructional space. Ask for hints at the level you need, get explanations,
            retry an answer and compare attempts, then study the model answer once you've tried.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              "Configurable hint levels and feedback timing",
              "Meaning-preserving grammar rewrites",
              "Attempt-to-attempt comparison — observable differences, not hype",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CircleDot className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="mt-6 self-start" asChild>
            <Link to="/coach">
              Explore guided practice <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ReportPreview() {
  return (
    <section id="features" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="Evidence, not vibes"
              title="A report you can argue with."
              description="Every observation in the report links to what you actually said — a quote, a timestamp, a reason. Where evidence is thin, the report says so instead of pretending to know."
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Technical and communication assessments are reported separately, each with its own
                reliability note — never blended into a single headline number.
              </p>
              <p>
                Metrics carry their method: words per minute is calculated by code; qualitative
                observations are model-generated from your transcript and marked as such.
              </p>
              <p className="font-medium text-foreground">
                "This is practice feedback, not a prediction of any hiring decision."
              </p>
            </div>
            <Button variant="outline" className="mt-6" asChild>
              <Link to="/interview/report/$id" params={{ id: "demo-1" }}>
                Open the full sample report <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="size-3.5" aria-hidden /> Report · Mock interview · Backend · 31
              min
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Technical</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">72</p>
                <p className="text-[11px] text-muted-foreground">Medium confidence · 5 answers</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Communication</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">64</p>
                <p className="text-[11px] text-muted-foreground">Medium confidence · transcript</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {[
                {
                  icon: BadgeCheck,
                  tone: "text-success",
                  title: "Strength",
                  body: "Summary-first structure — evidenced at 4:12 with a transcript excerpt.",
                },
                {
                  icon: TriangleAlert,
                  tone: "text-warning",
                  title: "Improvement priority",
                  body: "Quantify scaling arguments — practice action: one estimation drill per design question.",
                },
                {
                  icon: AudioLines,
                  tone: "text-primary",
                  title: "Speech delivery",
                  body: "128 wpm · 34 fillers · 94% transcript coverage — each with its method and confidence.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <item.icon className={`mt-0.5 size-4 shrink-0 ${item.tone}`} aria-hidden />
                  <div>
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Configure",
      body: "Pick a role, domains, difficulty and duration. Add a job description or upload your resume — questions are grounded in them.",
    },
    {
      title: "Check your setup",
      body: "The lobby verifies your microphone and shows exactly what will happen to your audio before you begin.",
    },
    {
      title: "Interview",
      body: "Answer follow-ups in real time. A focused interface keeps progress, time and mic state visible and everything else out of the way.",
    },
    {
      title: "Review the evidence",
      body: "Get an evidence-based report with strengths, priorities and a practice plan that links straight into guided drills.",
    },
  ];
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeading eyebrow="How it works" title="From setup to a practice plan in four steps." />
      <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-xl border border-border bg-card p-5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground tabular-nums">
              {index + 1}
            </span>
            <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ResumeAndCommunication() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <FileText className="size-4" aria-hidden />
              </span>
              <h3 className="text-lg font-semibold">Resume-grounded questions</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Upload your resume and the interview asks about the projects you actually claim — with
              follow-ups that probe depth instead of accepting buzzwords.
            </p>
            <blockquote className="mt-4 rounded-lg border-l-2 border-primary bg-background p-3 text-sm leading-relaxed">
              "Your resume lists a REST API with authentication — what happens when two requests hit
              the same endpoint at the same time?"
            </blockquote>
            <p className="mt-3 text-xs text-muted-foreground">
              Illustrative example of follow-up behaviour in a demo session.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <MessagesSquare className="size-4" aria-hidden />
              </span>
              <h3 className="text-lg font-semibold">Communication you can measure</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pacing, pause patterns, filler words and turn-taking are measured from your transcript
              and audio — each metric shown with its method, unit and confidence.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ListChecks className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                Per-metric reliability, with "Unavailable" and a reason when evidence is missing
              </li>
              <li className="flex items-start gap-2">
                <BookOpenCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                Meaning-preserving grammar rewrites, not style criticism
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function EvidenceQuality() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
        <SectionHeading
          eyebrow="Honest about limits"
          title="Evidence quality and uncertainty, stated plainly."
          description="An interview is a small sample. The report distinguishes what was measured, what was judged, and what simply wasn't available — so you can weigh feedback instead of over-trusting it."
        />
        <div className="space-y-3">
          {[
            {
              title: "Calculated by code",
              body: "Timing, pacing and the speech timeline are deterministic — same audio in, same numbers out.",
            },
            {
              title: "Model-generated, labelled",
              body: "Qualitative observations are model judgments of your transcript, marked as such, with reliability per assessment.",
            },
            {
              title: "Unavailable, with a reason",
              body: "Low-certainty transcription is excluded from language feedback rather than quietly included.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
            >
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center sm:px-12">
        <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Practice the interview. Understand your performance. Improve with evidence.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
          Start with a 15-minute mock interview or a guided drill — no setup, and all demonstration
          data is clearly labelled.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/interview/new">
              Start a mock interview <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/coach">Explore guided practice</Link>
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Demonstration build — simulated interviewer and sample data, no account needed.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <Badge
                variant="secondary"
                className="mb-5 gap-1.5 bg-secondary text-secondary-foreground"
              >
                <MicOff className="size-3" aria-hidden />
                For B.Tech CSE students and early-career engineers
              </Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
                Practice the interview. Understand your performance. Improve with evidence.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Realistic technical interviews and guided practice, with feedback grounded in what
                you actually said — not guesswork.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to="/interview/new">
                    Start a mock interview <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/coach">Explore guided practice</Link>
                </Button>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
                {[
                  { term: "Two modes", detail: "Assessment or coaching" },
                  { term: "Evidence-based", detail: "Every claim has a quote" },
                  { term: "15–45 min", detail: "Fits around classes" },
                ].map((item) => (
                  <div key={item.term}>
                    <dt className="font-semibold">{item.term}</dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <HeroPreview />
          </div>
        </section>
        <TwoModes />
        <ReportPreview />
        <HowItWorks />
        <ResumeAndCommunication />
        <EvidenceQuality />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
