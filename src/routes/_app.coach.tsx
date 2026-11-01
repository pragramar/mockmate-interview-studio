import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout for the coach section: /coach (exercise picker) and
 * /coach/session/$id (a guided practice session) render here.
 */
export const Route = createFileRoute("/_app/coach")({
  component: () => <Outlet />,
});
