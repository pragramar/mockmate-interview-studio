import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, ShieldCheck, Trash2 } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { DEMO_INTERVIEWS } from "@/data/fixtures";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_app/settings/privacy")({
  head: () => ({
    meta: [
      { title: "Consent & data controls — MockMate Interview Coach" },
      {
        name: "description",
        content: "Consent history, audio processing choices and demo data controls.",
      },
      { property: "og:title", content: "Consent & data controls — MockMate" },
      {
        property: "og:description",
        content: "Consent history, audio processing choices and data controls.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPage,
});

const consentHistory = [
  {
    date: "2026-10-08T18:20:00Z",
    label: "Age confirmation (18+) accepted",
    detail: "Required before the first interview setup could be completed.",
  },
  {
    date: "2026-10-08T18:20:05Z",
    label: "Audio processing consent given",
    detail:
      "Required for mock interviews. Audio is processed to produce the transcript and report.",
  },
  {
    date: "2026-10-08T18:20:09Z",
    label: "Audio retention declined",
    detail: "Optional. Retained audio would allow you to replay your answers later.",
  },
  {
    date: "2026-10-19T15:35:00Z",
    label: "Anonymised product-improvement consent declined",
    detail: "Optional and off by default.",
  },
];

function PrivacyPage() {
  const [retention, setRetention] = useState(false);
  const [improvement, setImprovement] = useState(false);

  useEffect(() => {
    setRetention(window.localStorage.getItem("interview-coach-retain-audio") === "true");
    setImprovement(window.localStorage.getItem("interview-coach-improvement-consent") === "true");
  }, []);

  return (
    <AppShell
      title="Consent & data controls"
      description="What this demo does with your data, the consent choices recorded for it, and the controls you would have in a connected build."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden /> How this demo handles data
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              This demonstration build has no server and no account system. Configuration and
              locally created sessions stay in your browser's local storage. In a connected build,
              audio and transcripts are processed to produce reports — that processing is not
              private from the AI provider that performs it, and this demo deliberately makes no
              claim otherwise.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audio choices</CardTitle>
            <CardDescription>
              Optional choices, shown with their effect. Defaults are off.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Retain interview audio for review</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Lets you replay your own answers after the session. If enabled, audio would be
                  stored until you delete it.
                </p>
              </div>
              <Switch
                checked={retention}
                onCheckedChange={(checked) => {
                  setRetention(checked);
                  window.localStorage.setItem("interview-coach-retain-audio", String(checked));
                }}
                aria-label="Retain interview audio for review"
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Allow anonymised use to improve the product</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Off by default. Would share anonymised excerpts for product improvement. No such
                  pipeline exists in this demo.
                </p>
              </div>
              <Switch
                checked={improvement}
                onCheckedChange={(checked) => {
                  setImprovement(checked);
                  window.localStorage.setItem(
                    "interview-coach-improvement-consent",
                    String(checked),
                  );
                }}
                aria-label="Allow anonymised use to improve the product"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Consent history <DemoLabel />
            </CardTitle>
            <CardDescription>Recorded consent events for this demo profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {consentHistory.map((entry, index) => (
                <li key={index} className="border-l-2 border-border pl-4">
                  <p className="text-sm font-medium">{entry.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(entry.date)} — {entry.detail}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data controls</CardTitle>
            <CardDescription>
              Export and deletion are demo interactions — they affect only this browser's local
              storage and never a server.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const payload = {
                  note: "MockMate demo export — local demonstration data only",
                  exportedAt: new Date().toISOString(),
                  consentHistory,
                  locallyCreatedSessions: window.localStorage.getItem("interview-coach-sessions"),
                  lastConfig: window.localStorage.getItem("interview-coach-last-config"),
                  sampleInterviews: DEMO_INTERVIEWS,
                };
                const blob = new Blob([JSON.stringify(payload, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = "ripple-demo-data.json";
                anchor.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="size-4" /> Export my demo data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="size-4" /> Clear demo data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all locally stored demo data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes locally created demo sessions, your last configuration and saved
                    preferences from this browser. Sample fixtures used by the demo are not
                    deletable. Nothing is stored on a server, so there is nothing further to delete.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my data</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const keys = Object.keys(window.localStorage).filter((key) =>
                        key.startsWith("interview-coach-"),
                      );
                      keys.forEach((key) => window.localStorage.removeItem(key));
                      window.location.href = "/dashboard";
                    }}
                  >
                    Clear demo data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Questions about consent? The{" "}
          <Link to="/settings/privacy" className="text-primary hover:underline">
            consent choices you make in the interview wizard
          </Link>{" "}
          are recorded here.
        </p>
      </div>
    </AppShell>
  );
}
