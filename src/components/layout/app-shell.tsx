import { Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  History,
  LayoutDashboard,
  Menu,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { DEMO_USER } from "@/data/fixtures";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/interview/new", label: "Mock interview", icon: Mic },
  { to: "/coach", label: "Practice coach", icon: Sparkles },
  { to: "/history", label: "Interview history", icon: History },
  { to: "/progress", label: "Progress", icon: CalendarClock },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const matchRoute = useMatchRoute();
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = !!matchRoute({ to: item.to, fuzzy: true });
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex min-w-0 items-center rounded-lg text-sm font-medium transition-colors",
              collapsed ? "size-9 shrink-0 justify-center self-center p-0" : "gap-3 px-3 py-2",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className={cn(collapsed ? "sr-only" : "min-w-0 truncate")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto rounded-lg border border-sidebar-border bg-secondary p-3">
      <p className="text-xs font-medium text-secondary-foreground">Demo workspace</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Signed in as {DEMO_USER.name}. All data in this build is demonstration data.
      </p>
    </div>
  );
}

/**
 * Application shell for signed-in-style pages: narrow collapsible sidebar on
 * desktop, sheet drawer on mobile, top bar with theme toggle.
 */
export function AppShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 transition-[width] md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex items-center justify-between px-1">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2" aria-label="MockMate home">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                M
              </span>
              <span className="text-sm font-semibold tracking-tight">MockMate</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <Menu className="size-4" /> : <X className="size-4" />}
          </Button>
        </div>
        <div className="mt-4 flex flex-1 flex-col">
          <SidebarNav />
          {!collapsed && <SidebarFooter />}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur print-hide">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              {/* Mobile drawer trigger */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open navigation"
                    className="md:hidden"
                  >
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-4">
                  <SheetHeader className="p-0 pb-2">
                    <SheetTitle className="flex items-center gap-2 text-sm">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                        M
                      </span>
                      MockMate
                    </SheetTitle>
                  </SheetHeader>
                  <SidebarNav onNavigate={() => setOpen(false)} />
                  <div className="mt-4">
                    <SidebarFooter />
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="truncate text-sm font-semibold tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {description && (
            <p className="mb-6 max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export { Outlet as AppShellOutlet };
