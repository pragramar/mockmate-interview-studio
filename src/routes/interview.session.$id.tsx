import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  Captions,
  CircleAlert,
  LogOut,
  Mic,
  MicOff,
  Radio,
  VideoOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import interviewerAvatar from "@/assets/interviewer-avatar.png";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getInterviewScript, getSession, markReportAvailable } from "@/lib/repo";
import { formatClock, modeLabel, roleLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/interview/session/$id")({
  head: () => ({
    meta: [
      { title: "Live interview — MockMate Interview Coach" },
      {
        name: "description",
        content:
          "Focused live interview view: the AI interviewer on one side, your camera on the other, live transcription below.",
      },
      { property: "og:title", content: "Live interview — MockMate" },
      { property: "og:description", content: "The focused interview experience." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SessionPage,
});

type Phase =
  | "connecting"
  | "ready"
  | "interviewer"
  | "listening"
  | "processing"
  | "completing";

type CameraState = "requesting" | "live" | "denied" | "unavailable";

const PHASE_LABELS: Record<Phase, string> = {
  connecting: "Connecting…",
  ready: "Ready — the interviewer will begin",
  interviewer: "Interviewer speaking",
  listening: "Listening to you",
  processing: "Processing your response…",
  completing: "Completing the interview…",
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
  const [cameraState, setCameraState] = useState<CameraState>("requesting");
  const [cameraMessage, setCameraMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load the scripted demo question bank after mount (keeps module scope SSR-safe).
  const [questions, setQuestions] = useState<ReturnType<typeof getInterviewScript> | null>(null);
  useEffect(() => {
    if (session) setQuestions(getInterviewScript());
  }, [session]);

  /* ---------------------------- Camera ---------------------------- */
  const startCamera = async () => {
    setCameraState("requesting");
    setCameraMessage(null);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable");
      setCameraMessage(
        "Camera capture isn't available in this browser or context. The interview continues without your video — everything else still works.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraState("live");
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setCameraState("denied");
        setCameraMessage(
          "Camera permission was denied. To recover, allow the camera for this page in your browser's site settings, then retry. The demo continues without video meanwhile.",
        );
      } else {
        setCameraState("unavailable");
        setCameraMessage(
          "No usable camera was found. Connect one and retry, or continue without video.",
        );
      }
    }
  };

  useEffect(() => {
    void startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  /* ------------------------ Session state machine ------------------------ */
  // Connecting → ready → interviewer typing → listening → processing → next/completing
  useEffect(() => {
    if (phase !== "connecting") return;
    const timer = setTimeout(() => setPhase("ready"), 1400);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "ready") return;
    const timer = setTimeout(() => {
      setPhase("interviewer");
      setTypedLength(0);
    }, 900);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "interviewer" || !questions) return;
    const line = questions[questionIndex]?.interviewerLine;
    if (!line) return;
    if (typedLength >= line.length) {
      const timer = setTimeout(() => setPhase("listening"), 700);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setTypedLength((n) => n + 1), TYPING_SPEED_MS);
    return () => clearTimeout(timer);
  }, [phase, typedLength, questionIndex, questions]);

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

  useEffect(() => {
    if (phase !== "completing") return;
    const timer = setTimeout(() => {
      if (session) markReportAvailable(session.summary.id);
      navigate({ to: "/interview/report/$id", params: { id } });
    }, 1800);
    return () => clearTimeout(timer);
  }, [phase, session, navigate, id]);

  useEffect(() => {
    if (phase === "completing") return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

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
  const interviewerSpeaking = phase === "interviewer";

  const endNow = () => {
    if (session) markReportAvailable(session.summary.id);
    navigate({ to: "/interview/report/$id", params: { id } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar: wordmark, session context, exit */}
      <header className="border-b border-border print-hide">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              M
            </span>
            <span className="truncate text-sm font-semibold tracking-tight">MockMate</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              · {modeLabel(summary.mode)} · {roleLabel(summary.role)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium tabular-nums sm:inline">
              Q {Math.min(questionIndex + 1, totalQuestions)}/{totalQuestions} · {formatClock(elapsed)}
            </span>
            <DemoLabel />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <LogOut className="size-4" /> Exit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End this interview now?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The interview stops here and your report is generated from the answers so far
                    — fewer answers mean thinner evidence. This action can't be undone.
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

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-5 sm:px-6">
        {/* Split view: interviewer | candidate camera */}
        <div className="grid gap-4 md:grid-cols-2" aria-label="Interview room">
          {/* Interviewer panel */}
          <section
            aria-label="AI interviewer"
            className={cn(
              "relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-xl border bg-card sm:min-h-[320px]",
              interviewerSpeaking ? "border-primary ring-2 ring-primary/40" : "border-border",
            )}
          >
            <div className="relative">
              <span
                aria-hidden
                className={cn(
                  "absolute -inset-2 rounded-full border-2 transition-opacity",
                  interviewerSpeaking ? "animate-pulse border-primary/60 opacity-100" : "border-transparent opacity-0",
                )}
              />
              <img
                src={interviewerAvatar}
                alt="AI interviewer avatar (illustrative, not a real person)"
                width={816}
                height={816}
                loading="lazy"
                className="size-28 rounded-full border-4 border-background object-cover shadow-sm sm:size-36"
              />
            </div>
            <p className="absolute bottom-3 left-3 rounded-md bg-background/85 px-2.5 py-1 text-xs font-medium backdrop-blur">
              Interviewer (MockMate AI)
            </p>
            <p className="absolute bottom-3 right-3 text-xs text-muted-foreground">
              <span aria-live="polite">{PHASE_LABELS[phase]}</span>
            </p>
          </section>

          {/* Candidate camera panel */}
          <section
            aria-label="Your camera"
            className="relative min-h-[240px] overflow-hidden rounded-xl border border-border bg-muted sm:min-h-[320px]"
          >
            {cameraState === "live" ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="size-full -scale-x-100 object-cover"
                aria-label="Live preview of your camera (only you can see this in the demo)"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center">
                {cameraState === "requesting" ? (
                  <>
                    <Camera className="size-6 animate-pulse text-muted-foreground" aria-hidden />
                    <p className="text-sm text-muted-foreground">Requesting camera access…</p>
                  </>
                ) : (
                  <>
                    <VideoOff className="size-6 text-muted-foreground" aria-hidden />
                    <p className="text-sm font-medium">
                      {cameraState === "denied" ? "Camera off" : "Camera unavailable"}
                    </p>
                    <p className="max-w-xs text-xs text-muted-foreground">{cameraMessage}</p>
                    <Button variant="outline" size="sm" onClick={() => void startCamera()}>
                      Retry camera
                    </Button>
                  </>
                )}
              </div>
            )}
            {cameraState === "live" && (
              <p className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-background/85 px-2.5 py-1 text-xs font-medium backdrop-blur">
                <span
                  aria-hidden
                  className={cn("size-2 rounded-full", muted ? "bg-muted-foreground" : "animate-pulse bg-destructive")}
                />
                {muted ? "Paused" : "Rec (simulated)"}
              </p>
            )}
            <p className="absolute bottom-3 left-3 rounded-md bg-background/85 px-2.5 py-1 text-xs font-medium backdrop-blur">
              You (demo)
            </p>
          </section>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2" role="toolbar" aria-label="Interview controls">
          <Button variant={muted ? "secondary" : "outline"} size="sm" onClick={() => setMuted((m) => !m)}>
            {muted ? <Mic className="size-4" /> : <MicOff className="size-4" />}
            {muted ? "Unmute (demo)" : "Mute microphone"}
          </Button>
          <Button
            variant={captionsOn ? "secondary" : "outline"}
            size="sm"
            onClick={() => setCaptionsOn((c) => !c)}
            aria-pressed={captionsOn}
          >
            <Captions className="size-4" /> {captionsOn ? "Hide transcription" : "Show transcription"}
          </Button>
          <span className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs text-muted-foreground">
            <Radio className="size-3.5" aria-hidden />
            Connection: simulated · stable
          </span>
          <span className="rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs text-muted-foreground tabular-nums sm:hidden">
            Q {Math.min(questionIndex + 1, totalQuestions)}/{totalQuestions} · {formatClock(elapsed)}
          </span>
        </div>

        {/* Transcription */}
        {captionsOn && (
          <section aria-label="Live transcription" className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-2.5">
              <p className="inline-flex items-center gap-2 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                Transcription
                <span className="text-muted-foreground">(simulated)</span>
              </p>
            </div>
            <div className="px-4 py-4" role="log" aria-live="polite">
              <p className="text-sm leading-relaxed">
                {typedLine || "…"}
              </p>
              {phase === "listening" && (
                <p className="mt-2 text-sm italic text-muted-foreground">
                  [You are answering — your spoken words appear here in a connected build.]
                </p>
              )}
              {phase === "connecting" && (
                <p className="text-sm text-muted-foreground">Establishing the demo session…</p>
              )}
              {phase === "ready" && (
                <p className="text-sm text-muted-foreground">
                  Connected. The interviewer will ask the first question in a moment.
                </p>
              )}
              {phase === "processing" && (
                <p className="text-sm text-muted-foreground">Recording your response… (simulated)</p>
              )}
              {phase === "completing" && (
                <p className="text-sm text-muted-foreground">Wrapping up and generating the report…</p>
              )}
            </div>
          </section>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Demo simulation — the interviewer's questions come from a scripted bank and no live AI is
          connected. Mode A policy: no hints, scores or model answers until the report.
        </p>
      </main>
    </div>
  );
}
