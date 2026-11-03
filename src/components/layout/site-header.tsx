import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoLockup } from "@/components/mockmate-logo";

export const PRODUCT_NAME = "MockMate";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="MockMate home">
      <LogoLockup className="h-9" />
      <span className="hidden text-xs text-muted-foreground sm:inline">Interview Coach</span>
    </Link>
  );
}

const navItems = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#modes", label: "Interview modes" },
] as const;

/** Sticky navigation bar for the marketing landing page. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur print-hide">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Wordmark />
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild>
            <Link to="/interview/new">Start practising</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
