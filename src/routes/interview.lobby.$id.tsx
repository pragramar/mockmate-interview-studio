import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Mic,
  MicOff,
  MonitorSpeaker,
  Play,
  ShieldCheck,
  Square,
  Volume2,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DemoLabel } from "@/components/demo-label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/repo";
import { difficultyLabel, modeLabel, roleLabel } from "@/lib/format";

export const Route = createFileRoute("/interview/lobby/$id")({
  head: () => ({
    meta: [
      { title: "Interview lobby — Ripple Interview Coach" },
      {
        name: "description",
        content: "Verify your microphone and consent status before the interview begins.",
      },
      { property: "og:title", content: "Interview lobby — Ripple" },
      { property: "og:description", content: "Device and readiness checks before you begin." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LobbyPage,
});

type MicState = "untested" | "testing" | "granted" | "denied" | "unavailable" | "simulated";

function LobbyPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const session = getSession(id);

  const [micState, setMicState] = useState<MicState>("untested");
  const [micMessage, setMicMessage] = useState<string | null>(null);
  const [devices, setDevices] = useState<{ label: string; kind: string }[]>([]);
  const [level, setLevel] = useState(0);
  const [testing, setTesting] = useState(false);
  const [testNote, setTestNote] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopEverything = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setTesting(false);
    setLevel(0);
  };

  useEffect(() => stopEverything, []);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleAlert className="size-5 text-warning" aria-hidden /> Interview not found
            </CardTitle>
            <CardDescription>
              This lobby's session ID doesn't exist in this demo. Sessions are created locally when
              you finish the setup wizard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/interview/new">Set up a new interview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { config, summary } = session;

  const startMicTest = async () => {
    setMicState("testing");
    setMicMessage(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicState("unavailable");
      setMicMessage(
        "This browser doesn't expose microphone capture (or the page isn't secure). You can continue with a simulated microphone, clearly labelled as demo.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicState("granted");
      setMicMessage("Microphone access granted — input level is shown live below.");

      // Device labels only become available once permission is granted.
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        setDevices(
          list
            .filter((d) => d.kind === "audioinput" || d.kind === "audiooutput")
            .slice(0, 6)
            .map((d) => ({ label: d.label || "Unnamed device", kind: d.kind })),
        );
      } catch {
        setDevices([]);
      }

      // Live input level meter.
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const buffer = new Uint8Array(analyser.frequencyBinCount);
      setTesting(true);
      const tick = () => {
        analyser.getByteFrequencyData(buffer);
        const average = buffer.reduce((a, b) => a + b, 0) / buffer.length;
        setLevel(Math.min(100, Math.round((average / 128) * 100)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      try {
        await ctx.resume();
        // Short sample of the captured input through the output, if allowed.
        setTestNote("Say a few words — the meter below should move while you speak.");
      } catch {
        setTestNote(null);
      }
    } catch (error) {
      stopEverything();
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setMicState("denied");
        setMicMessage(
          "Microphone permission was denied. To recover: open your browser's site settings, allow the microphone for this page, then run the test again. You can also continue with a simulated microphone, clearly labelled as demo.",
        );
      } else {
        setMicState("unavailable");
        setMicMessage(
          "No usable microphone was found. Connect an input device and retry, or continue with a simulated microphone.",
        );
      }
    }
  };

  const useSimulatedMic = () => {
    stopEverything();
    setMicState("simulated");
    setMicMessage(
      "Using a simulated microphone for this demo session — no real audio is captured.",
    );
  };

  const consentOk = config.consents.ageConfirmed && config.consents.processAudio;
  const micOk = micState === "granted" || micState === "simulated";
  const canBegin = consentOk && micOk;

  const checklist = [
    {
      label: "Consent confirmed (18+, audio processing)",
      ok: consentOk,
      detail: consentOk ? "Recorded in the setup wizard." : "Return to the wizard to give consent.",
    },
    {
      label:
        micState === "simulated"
          ? "Simulated microphone selected (demo)"
          : "Microphone check passed",
      ok: micOk,
      detail:
        micState === "untested"
          ? "Run the microphone test below."
          : micState === "testing"
            ? "Waiting for permission…"
            : micState === "granted"
              ? "Live input verified."
              : micState === "simulated"
                ? "Demo fallback — no real audio is captured."
                : micState === "denied"
                  ? "Permission denied — see recovery steps above."
                  : "No usable microphone found.",
    },
    {
      label: "Simulated interviewer ready (demo)",
      ok: true,
      detail: "Questions come from a scripted demo bank — no live AI is connected.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border print-hide">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/interview/new">
              <ArrowRight className="size-4 rotate-180" /> Back to setup
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            Interview lobby <DemoLabel />
          </div>
          <span className="w-28" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left: mic setup */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Check your setup</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Two things must pass before the interview begins: consent and a microphone check.
                Nothing here pretends to be ready when it isn't.
              </p>
            </div>

            {/* Microphone card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mic className="size-4 text-primary" aria-hidden /> Microphone
                </CardTitle>
                <CardDescription>
                  {micState === "granted"
                    ? "Live input verified. The level meter responds to your real microphone."
                    : micState === "simulated"
                      ? "Simulated microphone selected for this demo session."
                      : "Run the test to verify your browser can capture your voice."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={startMicTest} disabled={micState === "testing"}>
                    {micState === "testing" ? (
                      "Waiting for permission…"
                    ) : micState === "granted" ? (
                      <>
                        <Play className="size-4" /> Re-test microphone
                      </>
                    ) : (
                      <>
                        <Mic className="size-4" /> Run microphone test
                      </>
                    )}
                  </Button>
                  {micState !== "granted" && (
                    <Button variant="outline" onClick={useSimulatedMic}>
                      Use simulated microphone (demo)
                    </Button>
                  )}
                  {testing && (
                    <Button variant="outline" onClick={stopEverything}>
                      <Square className="size-4" /> Stop monitoring
                    </Button>
                  )}
                </div>

                {/* Input level meter — real when granted */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{testing ? "Live input level" : "Input level"}</span>
                    <span className="tabular-nums">{testing ? `${level}%` : "—"}</span>
                  </div>
                  <div
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={testing ? level : undefined}
                    aria-label="Microphone input level"
                    className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-100"
                      style={{ width: `${testing ? level : 0}%` }}
                    />
                  </div>
                  {testNote && testing && (
                    <p className="mt-1.5 text-xs text-muted-foreground">{testNote}</p>
                  )}
                </div>

                {micMessage && (
                  <Alert
                    variant={
                      micState === "granted" || micState === "simulated" ? undefined : "destructive"
                    }
                  >
                    {micState === "granted" ? (
                      <CheckCircle2 className="size-4" />
                    ) : micState === "simulated" ? (
                      <AlertTriangle className="size-4" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                    <AlertTitle>
                      {micState === "granted"
                        ? "Microphone ready"
                        : micState === "simulated"
                          ? "Simulated microphone active"
                          : micState === "denied"
                            ? "Microphone permission denied"
                            : micState === "testing"
                              ? "Waiting for your response"
                              : "Microphone unavailable"}
                    </AlertTitle>
                    <AlertDescription>{micMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Devices */}
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-medium">
                    <MonitorSpeaker className="size-3.5" aria-hidden /> Audio devices
                  </p>
                  {devices.length === 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Device names appear after granting microphone access (browser security
                      policy).
                    </p>
                  ) : (
                    <ul className="mt-1.5 space-y-1">
                      {devices.map((device, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <span
                            aria-hidden
                            className={`size-1.5 rounded-full ${device.kind === "audioinput" ? "bg-primary" : "bg-muted-foreground/40"}`}
                          />
                          {device.kind === "audioinput" ? "Input" : "Output"}: {device.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recovery guidance */}
            {micState === "denied" && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertTitle>How to recover</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal space-y-1 pl-4">
                    <li>Click the lock/permissions icon in your browser's address bar.</li>
                    <li>Set Microphone to "Allow" for this site.</li>
                    <li>Re-run the microphone test above.</li>
                  </ol>
                  If no device exists at all, use the simulated microphone to explore the demo.
                </AlertDescription>
              </Alert>
            )}

            {/* Readiness checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {checklist.map((item) => (
                    <li key={item.label} className="flex items-start gap-2.5">
                      {item.ok ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                      ) : (
                        <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                      )}
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right: configuration summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <Badge
                    variant="outline"
                    className="border-border bg-secondary text-secondary-foreground"
                  >
                    {modeLabel(summary.mode)}
                  </Badge>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {modeLabel(summary.mode) === "Mock interview"
                      ? "Assessment conditions — no hints, scores or answers until the report."
                      : "Guided practice — hints and explanations available as you go."}
                  </p>
                </div>
                <Separator />
                <dl className="space-y-2">
                  {[
                    ["Role", roleLabel(summary.role)],
                    ["Difficulty", difficultyLabel(summary.difficulty)],
                    ["Domains", summary.domains.join(", ")],
                    ["Duration", `${summary.durationMinutes} minutes`],
                    ["Language", config.language],
                    ["Resume", config.resumeFileName ?? "Not uploaded"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
                <Separator />
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                  <span>
                    Audio consent {consentOk ? "recorded" : "missing"}.{" "}
                    {config.consents.retainAudio
                      ? "Audio retention: on (demo)."
                      : "Audio retention: off."}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 pt-6">
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MicOff className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  During the interview you can mute and unmute yourself, toggle captions and end
                  early with confirmation.
                </p>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!canBegin}
                  onClick={() => {
                    navigate({ to: "/interview/session/$id", params: { id: summary.id } });
                  }}
                >
                  Begin interview <ArrowRight className="size-4" />
                </Button>
                {!canBegin && (
                  <p className="text-center text-xs text-muted-foreground">
                    {consentOk
                      ? "Pass the microphone check to enable this."
                      : "Give consent in the setup wizard to enable this."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
