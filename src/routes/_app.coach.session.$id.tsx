import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  Eye,
  Lightbulb,
  MessageSquareText,
  Repeat,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { DemoLabel } from "@/components/demo-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getExercise, listExercises } from "@/lib/repo";
import { difficultyLabel } from "@/lib/format";

export const Route = createFileRoute("/_app/coach/session/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Guided practice — Ripple Interview Coach` },
      {
        name: "description",
        content:
          "Guided coaching session: attempt the question, request hints and explanations, retry and compare attempts.",
      },
      { property: "og:title", content: "Guided practice session — Ripple" },
      {
        property: "og:description",
        content: "Attempt, hints, retries and a model answer for focused practice.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CoachSessionPage,
});

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function CoachSessionPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const exercise = getExercise(id);

  const [attempts, setAttempts] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [feedbackTiming, setFeedbackTiming] = useState("after-attempt");

  useEffect(() => {
    setFeedbackTiming(
      window.localStorage.getItem("interview-coach-feedback-timing") ?? "after-attempt",
    );
  }, []);

  const nextExercise = useMemo(() => {
    const all = listExercises();
    const index = all.findIndex((e) => e.id === id);
    return all[(index + 1) % all.length];
  }, [id]);

  if (!exercise) {
    return (
      <AppShell title="Practice session">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm font-medium">This exercise doesn't exist</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              The exercise you're looking for isn't part of this demo. Pick another one from the
              coach.
            </p>
            <Button asChild>
              <Link to="/coach">Back to the coach</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const submitAttempt = () => {
    if (!draft.trim()) return;
    setAttempts((prev) => [...prev, draft.trim()]);
    setDraft("");
    setShowModelAnswer(true);
  };

  const canRetry = attempts.length > 0;

  return (
    <AppShell
      title={`Practice — ${exercise.title}`}
      description="Guided practice: this session shows hints, explanations and a model answer on request. Feedback appears according to your timing preference — no scores here, that's what mock interviews are for."
    >
      <div className="space-y-6">
        {/* Exercise header */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-border bg-secondary text-secondary-foreground"
              >
                {exercise.skill}
              </Badge>
              <Badge
                variant="outline"
                className="border-border bg-secondary text-secondary-foreground"
              >
                {difficultyLabel(exercise.difficulty)}
              </Badge>
              <DemoLabel />
            </div>
            <CardTitle className="text-lg">{exercise.title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {exercise.question}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Attempt area */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {attempts.length === 0 ? "Your answer" : `Attempt ${attempts.length + 1}`}
                </CardTitle>
                <CardDescription>
                  {attempts.length === 0
                    ? "Try the question first — the model answer unlocks after your first attempt."
                    : "Re-answer with what you learned from the hints and explanation."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label htmlFor="attempt" className="sr-only">
                  Your answer
                </Label>
                <Textarea
                  id="attempt"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Answer as you would in an interview — a few sentences is enough."
                  rows={6}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {wordCount(draft)} words
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDraft("");
                      }}
                      disabled={!draft}
                    >
                      Clear
                    </Button>
                    <Button onClick={submitAttempt} disabled={!draft.trim()}>
                      <Check className="size-4" />
                      {attempts.length === 0 ? "Submit attempt" : "Submit revised answer"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attempt comparison */}
            {attempts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Repeat className="size-4 text-primary" aria-hidden /> Attempt comparison
                  </CardTitle>
                  <CardDescription>
                    Observable differences between your attempts — length, structure and word
                    choice. This comparison is mechanical, not a judgment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {attempts.map((attempt, index) => (
                    <div key={index} className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Attempt {index + 1} · {wordCount(attempt)} words
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed">{attempt}</p>
                    </div>
                  ))}
                  {attempts.length >= 2 && (
                    <p className="text-sm text-muted-foreground">
                      {wordCount(attempts[attempts.length - 1]) > wordCount(attempts[0])
                        ? "Your revision is longer and more detailed than your first attempt."
                        : wordCount(attempts[attempts.length - 1]) < wordCount(attempts[0])
                          ? "Your revision is tighter than your first attempt."
                          : "Your revision keeps a similar length to your first attempt."}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Model answer — only after an attempt */}
            {showModelAnswer ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpenCheck className="size-4 text-primary" aria-hidden /> Model answer
                  </CardTitle>
                  <CardDescription>
                    One strong way to answer this — compare it with your attempts, don't memorise
                    it.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{exercise.modelAnswer}</p>
                  <Separator className="my-4" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Why this works: </span>
                    {exercise.explanation}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Eye className="mx-auto size-5 text-muted-foreground" aria-hidden />
                  <p className="mt-2 text-sm font-medium">Model answer locked</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                    You'll see a model answer after you submit your first attempt — struggling first
                    is what makes it stick.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coach side panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="size-4 text-primary" aria-hidden /> Hints
                </CardTitle>
                <CardDescription>
                  Request hints one level at a time. Level{" "}
                  {Math.min(hintLevel + 1, exercise.hints.length)} of {exercise.hints.length}{" "}
                  available.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {hintLevel === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No hints shown yet. Try the question on your own first — one rough attempt is
                    enough.
                  </p>
                )}
                {exercise.hints.slice(0, hintLevel).map((hint, index) => (
                  <div key={index} className="rounded-lg border border-border bg-secondary/60 p-3">
                    <p className="text-xs font-medium text-secondary-foreground">
                      Hint level {index + 1}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">{hint}</p>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={hintLevel >= exercise.hints.length}
                  onClick={() => setHintLevel((level) => level + 1)}
                >
                  {hintLevel === 0 ? "Request first hint" : "Request next hint"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquareText className="size-4 text-primary" aria-hidden /> Explanation
                </CardTitle>
                <CardDescription>A full walkthrough of the underlying concept.</CardDescription>
              </CardHeader>
              <CardContent>
                {showExplanation ? (
                  <p className="text-sm leading-relaxed">{exercise.explanation}</p>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowExplanation(true)}
                  >
                    Request explanation
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Coach settings</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Feedback timing:{" "}
                  <span className="font-medium text-foreground">
                    {feedbackTiming === "instant"
                      ? "Instant, as you practise"
                      : feedbackTiming === "end"
                        ? "At the end of the exercise"
                        : "After each attempt"}
                  </span>
                </p>
                <p className="mt-1 text-xs">
                  Change this in Settings — it controls when hints and explanations become available
                  during guided sessions.
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="flex-1" asChild>
                <Link to="/coach/session/$id" params={{ id: nextExercise.id }}>
                  Next exercise <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/coach">All exercises</Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          This session is a demonstration: the coach's feedback is scripted sample content, and{" "}
          <button
            type="button"
            className="text-primary underline-offset-2 hover:underline"
            onClick={() => navigate({ to: "/coach" })}
          >
            other exercises
          </button>{" "}
          follow the same pattern.
        </p>
      </div>
    </AppShell>
  );
}
