import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  FileText,
  Info,
  Languages,
  Printer,
  Quote,
  TriangleAlert,
} from "lucide-react";

import { DemoLabel } from "@/components/demo-label";
import { SpeechTimeline } from "@/components/charts/speech-timeline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getReport } from "@/lib/repo";
import { modeLabel, roleLabel } from "@/lib/format";
import type { Confidence, MetricRecord } from "@/types";

export const Route = createFileRoute("/interview/report/$id")({
  head: () => ({
    meta: [
      { title: "Interview report — Ripple Interview Coach" },
      {
        name: "description",
        content:
          "Evidence-based interview report: separate technical and communication assessments, transcript-linked strengths, priorities and speech metrics.",
      },
      { property: "og:title", content: "Interview report — Ripple" },
      {
        property: "og:description",
        content: "Evidence-based feedback grounded in what you actually said.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ReportPage,
});

const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
  unavailable: "Unavailable",
};

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const tone =
    confidence === "high"
      ? "text-success"
      : confidence === "unavailable"
        ? "text-muted-foreground"
        : confidence === "low"
          ? "text-warning"
          : "text-muted-foreground";
  return (
    <span className={`shrink-0 text-[11px] font-medium ${tone}`}>
      {CONFIDENCE_LABELS[confidence]}
    </span>
  );
}

function MetricRow({ metric }: { metric: MetricRecord }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{metric.label}</p>
        <ConfidenceBadge confidence={metric.confidence} />
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums">
        {metric.value !== null ? (
          <>
            {metric.value}
            {metric.unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{metric.unit}</span>}
          </>
        ) : (
          <span className="text-sm font-normal text-muted-foreground">Unavailable</span>
        )}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{metric.explanation}</p>
    </div>
  );
}

function EvidenceBlock({
  quote,
  timestamp,
  source,
  why,
}: {
  quote: string;
  timestamp: string;
  source: string;
  why: string;
}) {
  return (
    <div className="mt-3 rounded-lg border-l-2 border-primary bg-secondary/50 p-3">
      <p className="flex items-start gap-2 text-sm italic leading-relaxed">
        <Quote className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
        "{quote}"
      </p>
      <p className="mt-2 text-xs text-muted-foreground tabular-nums">
        {source} · {timestamp}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Why this supports it: </span>
        {why}
      </p>
    </div>
  );
}

function ReportPage() {
  const { id } = Route.useParams();
  const report = getReport(id);

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleAlert className="size-5 text-warning" aria-hidden /> No report for this
              session
            </CardTitle>
            <CardDescription>
              Reports exist for mock interviews completed in this demo. Guided practice gives its
              feedback inside the session instead.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/interview/new">Start a mock interview</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/history">View history</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Report header */}
      <header className="border-b border-border print-hide">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <div className="flex items-center gap-2">
            <DemoLabel />
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-4" /> Print
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        {/* A. Summary */}
        <section aria-labelledby="summary-heading">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-border bg-secondary text-secondary-foreground">
              {modeLabel(report.mode)}
            </Badge>
            <Badge variant="outline" className="border-border bg-secondary text-secondary-foreground">
              {roleLabel(report.role)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {report.domainSummary} · {report.durationLabel}
            </span>
          </div>
          <h1 id="summary-heading" className="mt-3 text-2xl font-semibold tracking-tight">
            Interview report
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.evaluatedAnswers} evaluated answers · Session {report.sessionId}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card className="print-block">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Technical assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">
                  {report.technical.score ?? "—"}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/100</span>
                </p>
                <p className="mt-1 text-sm">{report.technical.band}</p>
                <div className="mt-2 flex items-center gap-2">
                  <ConfidenceBadge confidence={report.technical.reliability} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {report.technical.note}
                </p>
              </CardContent>
            </Card>
            <Card className="print-block">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Communication assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">
                  {report.communication.score ?? "—"}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/100</span>
                </p>
                <p className="mt-1 text-sm">{report.communication.band}</p>
                <div className="mt-2 flex items-center gap-2">
                  <ConfidenceBadge confidence={report.communication.reliability} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {report.communication.note}
                </p>
              </CardContent>
            </Card>
          </div>

          <Alert className="mt-4">
            <Info className="size-4" />
            <AlertTitle>Evidence quality</AlertTitle>
            <AlertDescription className="leading-relaxed">{report.evidenceQuality}</AlertDescription>
          </Alert>

          <p className="mt-4 rounded-lg border border-border bg-secondary/60 p-3 text-sm leading-relaxed">
            This is practice feedback, not a prediction of any hiring decision.
          </p>
        </section>

        <Separator />

        {/* B. Strengths */}
        <section aria-labelledby="strengths-heading" className="print-block">
          <h2 id="strengths-heading" className="text-xl font-semibold tracking-tight">
            Strengths
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Up to three observations, each backed by a transcript excerpt.
          </p>
          <div className="mt-4 space-y-4">
            {report.strengths.map((strength) => (
              <Card key={strength.title} className="print-block">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BadgeCheck className="size-4 text-success" aria-hidden />
                    {strength.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {strength.observation}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EvidenceBlock {...strength.evidence} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* C. Improvement priorities */}
        <section aria-labelledby="improvements-heading" className="print-block">
          <h2 id="improvements-heading" className="text-xl font-semibold tracking-tight">
            Improvement priorities
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Observed issues, their relevance, and one concrete practice action each.
          </p>
          <div className="mt-4 space-y-4">
            {report.improvements.map((improvement) => (
              <Card key={improvement.title} className="print-block">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TriangleAlert className="size-4 text-warning" aria-hidden />
                    {improvement.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {improvement.observedIssue}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <EvidenceBlock {...improvement.evidence} />
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium">Relevance: </span>
                    <span className="text-muted-foreground">{improvement.relevance}</span>
                  </p>
                  <p className="rounded-lg border border-border bg-secondary/50 p-3 text-sm leading-relaxed">
                    <span className="font-medium">Practice action: </span>
                    {improvement.practiceAction}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* D. Question-by-question breakdown */}
        <section aria-labelledby="questions-heading" className="print-block">
          <h2 id="questions-heading" className="text-xl font-semibold tracking-tight">
            Question-by-question breakdown
          </h2>
          <div className="mt-4 space-y-3">
            {report.questions.map((question, index) => (
              <details
                key={question.id}
                className="group rounded-xl border border-border bg-card"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Question {index + 1}
                      {question.evidenceRef && (
                        <span className="ml-2 normal-case tabular-nums">
                          · evidence at {question.evidenceRef}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm font-medium leading-relaxed">{question.question}</p>
                  </div>
                  <span className="mt-1 shrink-0 text-xs text-muted-foreground group-open:hidden">
                    Show
                  </span>
                  <span className="mt-1 hidden shrink-0 text-xs text-muted-foreground group-open:inline">
                    Hide
                  </span>
                </summary>
                <div className="border-t border-border p-4 text-sm">
                  <p className="italic leading-relaxed text-muted-foreground">
                    "{question.responseExcerpt}"
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold">Expected concepts</p>
                      <ul className="mt-1.5 space-y-1">
                        {question.expectedConcepts.map((concept) => (
                          <li key={concept} className="text-xs text-muted-foreground">{concept}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-success">Demonstrated</p>
                      <ul className="mt-1.5 space-y-1">
                        {question.demonstrated.map((concept) => (
                          <li key={concept} className="text-xs text-muted-foreground">{concept}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-warning">Missing or incorrect</p>
                      <ul className="mt-1.5 space-y-1">
                        {question.missing.map((concept) => (
                          <li key={concept} className="text-xs text-muted-foreground">{concept}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="mt-4 rounded-lg border border-border bg-secondary/50 p-3 text-sm leading-relaxed">
                    <span className="font-medium">Evaluator feedback: </span>
                    {question.evaluatorFeedback}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* E. Speech delivery */}
        <section aria-labelledby="speech-heading" className="print-block">
          <h2 id="speech-heading" className="text-xl font-semibold tracking-tight">
            Speech delivery
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Each metric carries its value, unit, confidence and method. Metrics without reliable
            evidence would show "Unavailable" with a reason.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                report.speech.wpm,
                report.speech.speakingDuration,
                report.speech.pauseDuration,
                report.speech.fillers,
                report.speech.interruptions,
                report.speech.transcriptCoverage,
              ] as MetricRecord[]
            ).map((metric) => (
              <MetricRow key={metric.label} metric={metric} />
            ))}
          </div>
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Speech and silence timeline</CardTitle>
              <CardDescription>
                Deterministic visualisation built from audio energy and transcript timestamps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpeechTimeline timeline={report.speech.timeline} />
            </CardContent>
          </Card>
        </section>

        {/* F. Language feedback */}
        <section aria-labelledby="language-heading" className="print-block">
          <h2 id="language-heading" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Languages className="size-5 text-primary" aria-hidden /> Language feedback
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Meaning-preserving rewrites with explanations.
          </p>
          <div className="mt-4 space-y-3">
            {report.languageFeedback.map((item, index) => (
              <div key={index} className="rounded-xl border border-border bg-card p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs font-medium text-muted-foreground">Original</p>
                    <p className="mt-1 text-sm">{item.original}</p>
                  </div>
                  <div className="rounded-lg border border-primary bg-secondary/50 p-3">
                    <p className="text-xs font-medium text-primary">Suggested</p>
                    <p className="mt-1 text-sm">{item.correction}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{item.explanation}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Meaning preserved: {item.meaningPreserved ? "yes" : "reviewed"}.{" "}
                  {item.transcriptionUncertain &&
                    "This excerpt came from a lower-certainty transcription segment."}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* G. Resume and project feedback */}
        <section aria-labelledby="resume-heading" className="print-block">
          <h2 id="resume-heading" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <FileText className="size-5 text-primary" aria-hidden /> Resume and project feedback
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Neutral observations about ownership and depth — no inferences about personality or
            ability.
          </p>
          <ul className="mt-4 space-y-2.5">
            {report.resumeFeedback.map((observation, index) => (
              <li key={index} className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed">
                {observation}
              </li>
            ))}
          </ul>
        </section>

        {/* H. Practice plan */}
        <section aria-labelledby="practice-heading" className="print-block">
          <h2 id="practice-heading" className="text-xl font-semibold tracking-tight">
            Practice plan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Three drills that map to this report's priorities.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {report.practicePlan.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <p className="text-sm font-medium">{action.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{action.description}</p>
                <p className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
                  Open drill <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* I. Methodology and limitations */}
        <section aria-labelledby="methodology-heading" className="print-block">
          <h2 id="methodology-heading" className="text-xl font-semibold tracking-tight">
            Methodology and limitations
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Calculated by deterministic code</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
                  {report.methodology.deterministic.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Model-generated judgments</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
                  {report.methodology.modelGenerated.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Unavailable or unreliable</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
                  {report.methodology.unavailable.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Limitations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {report.methodology.limitations}
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Demo build: this report is a fully scripted sample fixture adapted to your session's
            configuration — it does not analyse real audio.
          </p>
        </section>
      </main>
    </div>
  );
}
