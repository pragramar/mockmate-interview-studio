import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings/")({
  head: () => ({
    meta: [
      { title: "Settings — MockMate Interview Coach" },
      {
        name: "description",
        content: "Appearance, interview language, feedback timing and demo data controls.",
      },
      { property: "og:title", content: "Settings — MockMate Interview Coach" },
      { property: "og:description", content: "Preferences, appearance and privacy settings." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SettingsPage,
});

const themeOptions: { value: Theme; label: string; icon: typeof Sun; hint: string }[] = [
  { value: "light", label: "Light", icon: Sun, hint: "Bright surfaces for well-lit rooms" },
  { value: "dark", label: "Dark", icon: Moon, hint: "Deep ocean navy surfaces" },
  { value: "system", label: "System", icon: Monitor, hint: "Follow your device setting" },
];

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("english");
  const [feedbackTiming, setFeedbackTiming] = useState("after-attempt");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLanguage(window.localStorage.getItem("interview-coach-language") ?? "english");
    setFeedbackTiming(
      window.localStorage.getItem("interview-coach-feedback-timing") ?? "after-attempt",
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("interview-coach-language", language);
  }, [language, hydrated]);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem("interview-coach-feedback-timing", feedbackTiming);
  }, [feedbackTiming, hydrated]);

  return (
    <AppShell
      title="Settings"
      description="Preferences for this demo workspace. Changes apply immediately and persist in your browser."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>
              Choose how MockMate looks. The selection persists across navigation and refreshes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              role="radiogroup"
              aria-label="Theme preference"
              className="grid gap-3 sm:grid-cols-3"
            >
              {themeOptions.map((option) => {
                const selected = theme === option.value;
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      selected
                        ? "border-primary bg-secondary"
                        : "border-border bg-background hover:bg-accent",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    <p className="mt-2 text-sm font-medium">{option.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{option.hint}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview preferences</CardTitle>
            <CardDescription>
              Language and coaching feedback timing used when you start a new session.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preferred-language">Preferred interview language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="preferred-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi" disabled>
                    Hindi — not supported in this demo
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only English is wired up in this demonstration build; other options stay visible
                but disabled rather than pretending to work.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-timing">Guided feedback timing</Label>
              <Select value={feedbackTiming} onValueChange={setFeedbackTiming}>
                <SelectTrigger id="feedback-timing">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant — as I practise</SelectItem>
                  <SelectItem value="after-attempt">After each attempt</SelectItem>
                  <SelectItem value="end">Only at the end of the exercise</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Applies to guided practice only. Mock interviews never show feedback mid-session.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Consent & privacy <DemoLabel />
            </CardTitle>
            <CardDescription>
              Consent choices, audio retention and data controls live on the privacy page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link to="/settings/privacy">Open consent & data controls</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          This demo has no account system — the "Demo user" profile is a labelled placeholder and
          nothing here is stored on a server.
        </p>
      </div>
    </AppShell>
  );
}
