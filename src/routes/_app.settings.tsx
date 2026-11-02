import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout for the settings section: /settings and /settings/privacy render here. */
export const Route = createFileRoute("/_app/settings")({
  component: () => <Outlet />,
});
