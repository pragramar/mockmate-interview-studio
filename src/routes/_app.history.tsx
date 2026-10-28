import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { DemoLabel } from "@/components/demo-label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listInterviews } from "@/lib/repo";
import {
  difficultyLabel,
  formatDate,
  modeLabel,
  roleLabel,
} from "@/lib/format";
import type { InterviewSummary } from "@/types";

export const Route = createFileRoute("/_app/history")({
  head: () => ({
    meta: [
      { title: "Interview history — Ripple Interview Coach" },
      {
        name: "description",
        content: "Filterable list of your previous mock interviews and guided practice sessions.",
      },
      { property: "og:title", content: "Interview history — Ripple Interview Coach" },
      {
        property: "og:description",
        content: "Your previous mock interviews and guided practice sessions.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [modeFilter, setModeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    setInterviews(listInterviews());
  }, []);

  const roles = useMemo(
    () => Array.from(new Set(interviews.map((i) => i.role))),
    [interviews],
  );

  const filtered = interviews.filter(
    (i) =>
      (modeFilter === "all" || i.mode === modeFilter) &&
      (roleFilter === "all" || i.role === roleFilter),
  );

  return (
    <AppShell
      title="Interview history"
      description="Every mock interview and guided practice session recorded in this demo workspace, newest first."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">All sessions</h2>
            <DemoLabel />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-40" aria-label="Filter by mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modes</SelectItem>
                <SelectItem value="mock">Mock interviews</SelectItem>
                <SelectItem value="guided">Guided practice</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40" aria-label="Filter by target role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleLabel(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm font-medium">No sessions match these filters</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try clearing the filters, or start a new mock interview to build your history.
              </p>
              <Button asChild>
                <Link to="/interview/new">
                  <Mic className="size-4" /> Start a mock interview
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    Previous interviews with date, role, mode, domain, duration and report
                    availability
                  </caption>
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th scope="col" className="px-4 py-3 font-medium">Date</th>
                      <th scope="col" className="px-4 py-3 font-medium">Role</th>
                      <th scope="col" className="px-4 py-3 font-medium">Mode</th>
                      <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Domain</th>
                      <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Duration</th>
                      <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Difficulty</th>
                      <th scope="col" className="px-4 py-3 font-medium">Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((interview) => (
                      <tr key={interview.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 tabular-nums">{formatDate(interview.createdAt)}</td>
                        <td className="px-4 py-3">{roleLabel(interview.role)}</td>
                        <td className="px-4 py-3">{modeLabel(interview.mode)}</td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {interview.domains.join(", ")}
                        </td>
                        <td className="hidden px-4 py-3 tabular-nums sm:table-cell">
                          {interview.durationMinutes} min
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                          {difficultyLabel(interview.difficulty)}
                        </td>
                        <td className="px-4 py-3">
                          {interview.reportAvailable ? (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/interview/report/${interview.id}`}>View</Link>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Not available — guided practice
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground">
          Guided practice sessions produce coaching feedback in the session itself, so they have
          no separate report. Reports exist for mock interviews only.
        </p>
      </div>
    </AppShell>
  );
}
