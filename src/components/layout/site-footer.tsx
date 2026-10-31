import { Link } from "@tanstack/react-router";

import { Wordmark } from "@/components/layout/site-header";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Mock interview", href: "/interview/new" },
      { label: "Guided practice", href: "/coach" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Progress", href: "/progress" },
    ],
  },
  {
    title: "Preparation",
    links: [
      { label: "Interview history", href: "/history" },
      { label: "Sample report", href: "/interview/report/demo-1" },
      { label: "Settings", href: "/settings" },
    ],
  },
  {
    title: "Privacy",
    links: [
      { label: "Consent & data controls", href: "/settings/privacy" },
      { label: "Audio processing", href: "/settings/privacy" },
      { label: "Data export", href: "/settings/privacy" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card print-hide">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Wordmark />
            <p className="mt-3 text-sm text-muted-foreground">
              Realistic technical interviews and guided practice, with feedback grounded in what you
              actually said.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Demonstration build — all data shown is sample data.
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ripple Interview Coach. Practice feedback only — not a hiring prediction.</p>
          <p>Built for B.Tech CSE students and early-career engineers.</p>
        </div>
      </div>
    </footer>
  );
}
