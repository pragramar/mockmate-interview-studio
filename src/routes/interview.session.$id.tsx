import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AudioLines,
  Captions,
  CircleAlert,
  CircleStop,
  Mic,
  MicOff,
  ShieldCheck,
  Signal,
  Timer,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DemoLabel } from "@/components/demo-label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getInterviewScript, getSession, markReportAvailable } from "@/lib/repo";
import { formatClock, modeLabel, roleLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/interview/session/$id")({
  head: () => ({
    meta: [
      { title: "Live interview — Ripple Interview Coach" },
      {
        name: "description",
        content: "Focused live interview view: current question, timer, progress and mic controls.",
      },
      { property: "og:title", content: "Live interview — Ripple" },
      { property: "og:description", content: "The focused interview experience." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SessionPage,
});

type Phase =
  "connecting" | "ready" | "interviewer" | "listening" | "processing" | "completing" | "completed";

const PHASE_LABELS: Record<Phase, string> = {
  connecting: "Connecting…",
  ready: "Ready — the interviewer will begin",
  interviewer: "Interviewer speaking",
  listening: "Listening to you",
  processing: "Processing your response…",
  completing: "Completing the interview…",
  completed: "Interview complete",
};

const TYPING_SPEED_MS = 28;

function SessionPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const session = getSession(id);

  const [phase, setPhase] = useState<Phase>("connecting");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Load the scripted demo question bank after mount (keeps module scope SSR-safe).
  const [questions, setQuestions] = useState<ReturnType<typeof getInterviewScript> | null>(null);
  useEffect(() => {
    if (session) setQuestions(getInterviewScript());
  }, [session]);

  // Connecting → ready
  useEffect(() => {
    if (phase !== "connecting") return;
    const timer = setTimeout(() => setPhase("ready"), 1400);
    return () => clearTimeout(timer);
  }, [phase]);

  // Ready → interviewer speaking
  useEffect(() => {
    if (phase !== "ready") return;
    const timer = setTimeout(() => {
      setPhase("interviewer");
      setTypedLength(0);
    }, 900);
    return () => clearTimeout(timer);
  }, [phase]);

  // Interviewer types out the current line
  useEffect(() => {
    if (phase !== "interviewer" || !questions) return;
    const line = questions[questionIndex].interviewerLine;
    if (typedLength >= line.length) {
      const timer = setTimeout(() => {
        setPhase("listening");
      }, 700);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setTypedLength((n) => n + 1), TYPING_SPEED_MS);
    return () => clearTimeout(timer);
  }, [phase, typedLength, questionIndex, questions]);

  // Listening: simulated mic level animation
  useEffect(() => {
    if (phase !== "listening" || muted) {
      setMicLevel(0);
      return;
    }
    let frame: number;
    const tick = () => {
      setMicLevel(25 + Math.round(Math.random() * 45));
      frame = requestAnimationFrame(tick);
    };
    // ~8 fps random walk is enough for a restrained indicator
    const interval = setInterval(() => tick(), 120);
    return () => {
      clearInterval(interval);
      cancelAnimationFrame(frame);
      setMicLevel(0);
    };
  }, [phase, muted]);

  // Elapsed timer
  useEffect(() => {
    if (phase === "completed" || phase === "completing") return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Processing → next question or completing
  useEffect(() => {
    if (phase !== "processing" || !questions) return;
    const timer = setTimeout(() => {
      if (questionIndex + 1 >= questions.length) {
        setPhase("completing");
      } else {
        setQuestionIndex((i) => i + 1);
        setTypedLength(0);
        setPhase("interviewer");
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase, questionIndex, questions]);

  // Completing → navigate to report
  useEffect(() => {
    if (phase !== "completing") return;
    const timer = setTimeout(() => {
      if (session) markReportAvailable(session.summary.id);
      setPhase("completed");
      navigate({ to: "/interview/report/$id", params: { id } });
    }, 1800);
    return () => clearTimeout(timer);
  }, [phase, session, navigate, id]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight });
  }, [typedLength, questionIndex, phase]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <CircleAlert className="size-6 text-warning" aria-hidden />
            <p className="text-sm font-medium">This interview session doesn't exist</p>
            <p className="text-sm text-muted-foreground">
              Sessions are created locally by the setup wizard in this demo.
            </p>
            <Button asChild>
              <a href="/interview/new">Set up an interview</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { config, summary } = session;
  const current = questions?.[questionIndex];
  const typedLine = current ? current.interviewerLine.slice(0, typedLength) : "";
  const totalQuestions = questions?.length ?? 5;

  const endNow = () => {
    if (session) markReportAvailable(session.summary.id);
    navigate({ to: "/interview/report/$id", params: { id } });
  };

  const listening = phase === "listening";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top status bar */}
      <header className="border-b border-border print-hide">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                phase === "connecting" || phase === "processing" || phase === "completing"
                  ? "animate-pulse bg-warning"
                  : "bg-success",
              )}
              aria-hidden
            />
            <span className="truncate text-muted-foreground">
              {modeLabel(summary.mode)} · {roleLabel(summary.role)} · Demo simulation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 border-border bg-secondary text-secondary-foreground"
            >
              <DemoLabel />
            </Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <CircleStop className="size-4" /> End interview
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End this interview now?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The interview stops here and your report is generated from the answers so far —
                    fewer answers mean thinner evidence. This action can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep going</AlertDialogCancel>
                  <AlertDialogAction onClick={endNow}>End interview</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_300px]">
        {/* Main area */}
        <section
          aria-label="Interview room"
          className="flex min-h-[60vh] flex-col rounded-xl border border-border bg-card"
        >
          {/* State banner */}
          <div
            aria-live="polite"
            className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  listening
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {listening ? <Mic className="size-4" /> : <AudioLines className="size-4" />}
              </span>
              <div>
                <p className="text-sm font-semibold">{PHASE_LABELS[phase]}</p>
                <p className="text-xs text-muted-foreground">
                  {listening
                    ? muted
                      ? "Your microphone is muted in this demo"
                      : "Simulated microphone active — speak or continue when ready"
                    : phase === "interviewer"
                      ? "A scripted demo interviewer is asking the question"
                      : "Simulated interview — no live AI is connected"}
                </p>
              </div>
            </div>
            <div className="hidden items-end gap-1 sm:flex" aria-hidden>
              {(listening && !muted ? [8, 14, 6, 16, 10, 5, 13, 7] : [3, 3, 3, 3, 3, 3, 3, 3]).map(
                (height, index) => (
                  <span
                    key={index}
                    className={cn(
                      "w-1 rounded-full transition-all duration-150",
                      listening && !muted ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                    style={{ height: `${height}px` }}
                  />
                ),
              )}
            </div>
          </div>

          {/* Question area */}
          <div className="flex flex-1 flex-col px-4 py-6 sm:px-6">
            {phase === "connecting" && (
              <div className="m-auto text-center">
                <Signal
                  className="mx-auto size-6 animate-pulse text-muted-foreground"
                  aria-hidden
                />
                <p className="mt-3 text-sm text-muted-foreground">Establishing the demo session…</p>
              </div>
            )}
            {phase === "ready" && (
              <div className="m-auto max-w-md text-center">
                <p className="text-sm text-muted-foreground">
                  Connected. The interviewer will ask the first question in a moment.
                </p>
              </div>
            )}
            {(phase === "interviewer" || phase === "listening" || phase === "processing") &&
              current && (
                <>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Question {questionIndex + 1} of {totalQuestions} · {current.topic}
                  </p>
                  <p className="mt-3 text-lg leading-relaxed sm:text-xl">{typedLine}</p>
                  {listening && (
                    <div className="mt-auto pt-6">
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/60 px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                          In a real session you would answer aloud. This demo advances on your
                          command.
                        </p>
                        <Button
                          onClick={() => setPhase("processing")}
                          disabled={phase !== "listening"}
                        >
                          I'm done answering
                        </Button>
                      </div>
                    </div>
                  )}
                  {phase === "processing" && (
                    <p className="mt-6 text-sm text-muted-foreground">
                      Recording your response in the transcript… (simulated)
                    </p>
                  )}
                </>
              )}
            {phase === "completing" && (
              <div className="m-auto text-center">
                <p className="text-sm text-muted-foreground">
                  Wrapping up and generating the report…
                </p>
              </div>
            )}
          </div>

          {/* Captions / transcript */}
          {captionsOn && (
            <div className="border-t border-border">
              <div
                ref={transcriptRef}
                className="max-h-40 overflow-y-auto px-4 py-3 sm:px-5"
                aria-label="Interview transcript"
                role="log"
              >
                <p className="text-xs font-medium text-muted-foreground">Captions (live)</p>
                <p className="mt-1.5 text-sm leading-relaxed">{typedLine || "…"}</p>
                {listening && (
                  <p className="mt-2 text-sm italic text-muted-foreground">
                    [You are answering — simulated transcript]
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Side panel */}
        <aside aria-label="Interview status" className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Timer className="size-4" aria-hidden /> Elapsed
                </span>
                <span className="text-lg font-semibold tabular-nums">{formatClock(elapsed)}</span>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="tabular-nums">
                    {Math.min(questionIndex + 1, totalQuestions)}/{totalQuestions}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${((questionIndex + (phase === "processing" ? 1 : 0)) / totalQuestions) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current topic</span>
                <span className="font-medium">{current?.topic ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Connection</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="size-1.5 rounded-full bg-success" aria-hidden />
                  Simulated · stable
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Planned duration</span>
                <span className="tabular-nums">{config.durationMinutes} min</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 pt-6">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setMuted((m) => !m)}
              >
                {muted ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                {muted ? "Unmute (demo)" : "Mute microphone"}
              </Button>
              <Button
                variant={captionsOn ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={() => setCaptionsOn((c) => !c)}
                aria-pressed={captionsOn}
              >
                <Captions className="size-4" /> {captionsOn ? "Hide captions" : "Show captions"}
              </Button>
              <p className="flex items-start gap-1.5 pt-1 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                {config.consents.retainAudio
                  ? "Audio retention is on for this demo session."
                  : "Audio is not retained in this demo session."}
              </p>
              <p className="text-xs text-muted-foreground">
                Mode A policy: no hints, scores or model answers are shown during a mock interview.
              </p>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
