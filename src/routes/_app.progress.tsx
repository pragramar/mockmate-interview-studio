import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { DemoLabel } from "@/components/demo-label";
import { ProgressChart } from "@/components/charts/progress-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PROGRESS_SERIES, PRACTISED_SKILLS, SAMPLE_REPORT } from "@/data/fixtures";
import { formatRelative } from "@/lib/format";

export const Route = createFileRoute("/_app/progress")({
  head: () => ({
    meta: [
      { title: "Progress — MockMate Interview Coach" },
      {
        name: "description",
        content:
          "Longitudinal view of your technical and communication practice, with comparable sessions only.",
      },
      { property: "og:title", content: "Progress — MockMate Interview Coach" },
      {
        property: "og:description",
        content: "Technical and communication trends across your practice sessions.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const first = PROGRESS_SERIES[0]!;
  const last = PROGRESS_SERIES[PROGRESS_SERIES.length - 1]!;
  const technicalDelta = last.technicalScore - first.technicalScore;
  const communicationDelta = last.communicationScore - first.communicationScore;

  return (
    <AppShell
      title="Progress"
      description="Longitudinal progress across your demo sessions. Comparisons are drawn only between compatible sessions with comparable evidence quality."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Trends</h2>
          <DemoLabel />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Technical and communication assessments</CardTitle>
            <CardDescription>
              Six comparable mock-interview sessions, same role band. Scores are model-assessed
              summaries — see each report's methodology for how they were produced.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart data={PROGRESS_SERIES} height={300} />
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session-to-session comparison</CardTitle>
              <CardDescription>
                {first.label} → {last.label}, computed from the same role band and difficulty.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Technical assessment</span>
                <span className="font-medium tabular-nums">
                  {first.technicalScore} → {last.technicalScore} ({technicalDelta >= 0 ? "+" : ""}
                  {technicalDelta})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Communication assessment</span>
                <span className="font-medium tabular-nums">
                  {first.communicationScore} → {last.communicationScore} (
                  {communicationDelta >= 0 ? "+" : ""}
                  {communicationDelta})
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                These deltas describe score changes across six sessions. With samples this small
                they are indications — the reports' evidence excerpts are the more reliable signal.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Repeated weaknesses</CardTitle>
              <CardDescription>Issues flagged in more than one report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SAMPLE_REPORT.improvements.map((improvement) => (
                <div
                  key={improvement.title}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <p className="text-sm font-medium">{improvement.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{improvement.practiceAction}</p>
                </div>
              ))}
              <Link
                to="/coach"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Drill these in guided practice <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills practised</CardTitle>
            <CardDescription>Where your demo sessions have concentrated.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRACTISED_SKILLS.map((skill) => (
                <li key={skill.name} className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm font-medium">{skill.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {skill.sessions} sessions · last {formatRelative(skill.lastPractised)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Completed practice drills from guided sessions appear in your interview history; they do
          not produce scores, so they are excluded from trend comparisons.
        </p>
      </div>
    </AppShell>
  );
}
