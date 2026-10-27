<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Technical decisions

- **Frontend-only demo build.** No backend, auth, or live AI is wired up; all data comes from `src/data/fixtures.ts` via `src/lib/repo.ts` and must be labelled demo/simulated wherever it could be mistaken for real. Why: the brief explicitly forbids fabricating backend integration or exposing API keys.
- **Theme system** lives in `src/lib/theme.tsx` (ThemeProvider, light/dark/system, persisted under the `interview-coach-theme` localStorage key, class on `<html>`, no-flash inline script in `src/routes/__root.tsx`). Why: one central provider, no competing implementations.
- **Design tokens** are exact Ocean & Teal hex values in `src/styles.css`; components use semantic Tailwind tokens only, never hardcoded colors. Why: canonical palette must stay consistent and themeable.
- **Routes** are TanStack Start file routes; the signed-in-app shell is the pathless `_app` layout route (`/_app/*`), interview flow routes are standalone full-width pages. Route IDs include the underscore segment (e.g. `/_app/dashboard`).
- Interview configuration and locally created demo sessions persist in `localStorage` (keys prefixed `interview-coach-`); they are demo state, not a backend.
