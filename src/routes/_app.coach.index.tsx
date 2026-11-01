import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, Lightbulb, Repeat } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { DemoLabel } from "@/components/demo-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { listExercises } from "@/lib/repo";
import { difficultyLabel } from "@/lib/format";

export const Route = createFileRoute("/_app/coach/")({
  head: () => ({
    meta: [
      { title: "Guided practice coach — MockMate Interview Coach" },
      {
        name: "description",
        content:
          "Skill-focused practice with hints, explanations, retries and model answers — shown only after you attempt.",
      },
      { property: "og:title", content: "Guided practice coach — MockMate" },
      {
        property: "og:description",
        content: "Hints, explanations, retries and model answers for focused skills practice.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CoachPage,
});

function CoachPage() {
  const exercises = listExercises();
  const [hintLevel, setHintLevel] = useState("level-1");

  return (
    <AppShell
      title="Practice coach"
      description="A warmer, instructional space: attempt the question first, then request hints at the level you need, retry, and study the model answer. The coach points out observable differences between attempts — never unsupported claims of improvement."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Choose an exercise</h2>
            <DemoLabel />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Default hint level</span>
            <Select value={hintLevel} onValueChange={setHintLevel}>
              <SelectTrigger className="w-40" aria-label="Default hint level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="level-1">Start subtle</SelectItem>
                <SelectItem value="level-2">Start detailed</SelectItem>
                <SelectItem value="level-3">Start explicit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="border-border bg-secondary text-secondary-foreground"
                  >
                    {exercise.skill}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {difficultyLabel(exercise.difficulty)}
                  </span>
                </div>
                <CardTitle className="text-base">{exercise.title}</CardTitle>
                <CardDescription className="line-clamp-2">{exercise.question}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="size-3.5" aria-hidden /> {exercise.hints.length} hint
                    levels
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Repeat className="size-3.5" aria-hidden /> Retry & compare
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpenCheck className="size-3.5" aria-hidden /> Model answer
                  </span>
                </div>
                <Button asChild className="w-full">
                  <Link to="/coach/session/$id" params={{ id: exercise.id }}>
                    Start practice <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              How guided practice differs from a mock interview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            Here you can ask for hints, see explanations, rewrite and retry answers, and compare
            attempts — the coach stays on your side. In a{" "}
            <Link to="/interview/new" className="text-primary hover:underline">
              mock interview
            </Link>
            , none of that appears while the session runs: it is assessment conditions, and all
            feedback waits until the report.
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
