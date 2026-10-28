import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Pathless layout for signed-in-style pages (dashboard, coach, history,
 * progress, settings). Renders the shared AppShell around child routes.
 */
export const Route = createFileRoute("/_app")({
  component: () => <Outlet />,
});
