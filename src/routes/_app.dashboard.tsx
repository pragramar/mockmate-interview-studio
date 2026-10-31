import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, CalendarClock, Mic, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { DemoLabel } from "@/components/demo-label";
import { ProgressChart } from "@/components/charts/progress-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PROGRESS_SERIES, PRACTISED_SKILLS, SAMPLE_REPORT } from "@/data/fixtures";
import { listInterviews } from "@/lib/repo";
import { formatDate, modeLabel, roleLabel } from "@/lib/format";
import type { InterviewSummary } from "@/types";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ripple Interview Coach" },
      {
        name: "description",
        content:
          "Your practice overview: recent interviews, latest evidence-based report summary and recommended next drills.",
      },
      { property: "og:title", content: "Dashboard — Ripple Interview Coach" },
      {
        property: "og:description",
        content: "Recent interviews, latest report summary and recommended practice.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: DashboardPage,
});

function StatusBadge({ interview }: { interview: InterviewSummary }) {
  if (interview.status === "completed") {
    return (
      <Badge variant="outline" className="border-border bg-secondary text-secondary-foreground">
        {interview.reportAvailable ? "Report ready" : "Completed"}
      </Badge>
    );
  }
  if (interview.status === "in_progress") {
    return (
      <Badge variant="outline" className="border-border bg-secondary text-secondary-foreground">
        In progress
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-border bg-secondary text-secondary-foreground">
      Draft
    </Badge>
  );
}

function DashboardPage() {
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);

  // Load after hydration so locally created demo sessions appear without an
  // SSR/hydration mismatch.
  useEffect(() => {
    setInterviews(listInterviews());
  }, []);

  const latestWithReport = interviews.find((i) => i.reportAvailable);

  return (
    <AppShell
      title="Overview"
      description={
        "Everything here is demonstration data so you can explore the full workflow — configure an interview, run a simulated session and review an evidence-based report."
      }
    >
      <div className="space-y-6">
        {/* Greeting + primary actions */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight">Good to see you, Demo user</h2>
                <DemoLabel />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Your last mock interview was on {formatDate("2026-10-24T10:12:00Z")} — System design
                and Databases.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/interview/new">
                  <Mic className="size-4" /> Start mock interview
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/coach">
                  <Sparkles className="size-4" /> Continue practising
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Progress over time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progress over time</CardTitle>
              <CardDescription>
                Technical and communication assessments across your last six sessions. Small samples
                — treat trends as indications, not verdicts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressChart data={PROGRESS_SERIES} />
              <p className="mt-3 text-xs text-muted-foreground">
                Only compatible sessions (same role and difficulty band) are compared. Demo series
                with six data points.
              </p>
            </CardContent>
          </Card>

          {/* Latest report summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest report</CardTitle>
              <CardDescription>
                {latestWithReport
                  ? `${modeLabel(latestWithReport.mode)} · ${roleLabel(latestWithReport.role)} · ${formatDate(latestWithReport.createdAt)}`
                  : "No interviews with reports yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Technical</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">72</p>
                  <p className="text-[11px] text-muted-foreground">Medium confidence</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Communication</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">64</p>
                  <p className="text-[11px] text-muted-foreground">Medium confidence</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-start gap-2">
                  <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  <span>
                    <span className="font-medium">Strength:</span> structured, summary-first
                    answers.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                  <span>
                    <span className="font-medium">Priority:</span> quantify scaling arguments with
                    estimates.
                  </span>
                </p>
              </div>
              <Separator />
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/interview/report/${latestWithReport?.id ?? "demo-1"}`}>
                  Open full report <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent interview activity</CardTitle>
              <CardDescription>Your last sessions, newest first.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {interviews.slice(0, 5).map((interview) => (
                  <li
                    key={interview.id}
                    className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {modeLabel(interview.mode)} · {roleLabel(interview.role)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(interview.createdAt)} · {interview.domains.join(", ")} ·{" "}
                        {interview.durationMinutes} min
                      </p>
                    </div>
                    <StatusBadge interview={interview} />
                    {interview.reportAvailable ? (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/interview/report/${interview.id}`}>View report</Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/coach">Practise instead</Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <Button variant="ghost" size="sm" asChild>
                <Link to="/history">
                  View all history <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recommended practice */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended practice</CardTitle>
                <CardDescription>From your latest report's improvement priorities.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {SAMPLE_REPORT.practicePlan.map((action) => (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="block rounded-lg border border-border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recently practised skills</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {PRACTISED_SKILLS.map((skill) => (
                    <li
                      key={skill.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span>{skill.name}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarClock className="size-3.5" aria-hidden />
                        {skill.sessions} sessions
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
