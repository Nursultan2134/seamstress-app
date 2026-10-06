# LOG

## 2026-10-06
- Plan approved for seamstress workshop tracker (V1, "1 вид цеха"). Full plan: `C:\Users\testuser\.claude\plans\pasted-content-id-c2db-1-mighty-emerson.md`.
- Scaffolded Next.js (App Router, TypeScript, Tailwind) via `create-next-app` into `C:\Users\testuser\Desktop\seamstress-app`.
- Installing core deps: `prisma`, `@prisma/client`, `bcryptjs`, `zod`, `date-fns` (+ dev: `tsx`, `@types/bcryptjs`).
- M0–M4 complete: Prisma schema + migration + seed (demo workshop "Весна", 9 employees, sample 5-stage order); PIN auth (session.ts/auth-session.ts/middleware→proxy.ts); order creation with stage-flow builder; worker start/finish loop with rate-snapshotting payroll entries.
- Fixed Next.js 16 `middleware.ts` deprecation → renamed to `proxy.ts`. Fixed globals.css dark-mode body override fighting Tailwind utility classes (was rendering login page unreadable). Fixed dashboard logout button colliding with Next.js dev-mode overlay badge (bottom-left) by moving it to the sidebar header.
- Verified end-to-end in Chrome: PIN login as owner and as a sewer, order detail stage diagram, worker finish-stage action, and confirmed in DB that `ProductionEntry.rateApplied` correctly uses the employee's personal rate override (30) over the process default (25).
- M5–M8 complete: warehouse (material logging, order-level allocation with transactional stock decrement + over-allocation rejection, cost logging), profit panel (`lib/profit.ts`) with correct mixed-currency handling (withholds a blended total when costs span KGS/USD, shows per-currency subtotals instead — plan explicitly required this, first pass wrongly blended them, fixed), payroll (`lib/payroll.ts`, `/my-stats` with day/week/month tabs), order pickup action, employees section (list/create/detail with rate overrides, PIN reset, active toggle, days-off), analytics (profit per order, throughput bars, ironer output), admin area (password-gated, workshop creation with default process types, confirmed two workshops have independently isolated employee/order counts).
- Fixed a CSS bug on admin pages: `mx-auto max-w-*` on a direct flex child of `<body>` (which is `display:flex`) shrinks to content width instead of stretching, because auto margins consume the available space before `align-items:stretch` applies. Fix: pair `mx-auto max-w-*` with `w-full` whenever it's a flex item without an intermediate non-flex wrapper.
- All milestones M0–M8 verified by hand-calculation matching the UI exactly (order profit, employee salary).

## 2026-10-06 (later) — Dark theme (light/dark toggle)
- Added Tailwind v4 class-based dark mode (`@custom-variant dark`), a `ThemeToggle` client component (localStorage-persisted, defaults to OS preference), and an inline anti-flash script in `app/layout.tsx` that sets `.dark` on `<html>` before first paint.
- Swept every page and shared component (Button, Card, status/order color maps, PinPad, nav bars, all forms) with `dark:` variants. Verified in-browser across login, dashboard, orders list/detail (stage diagram + profit panel), and worker `/my-tasks` — all readable with correct contrast in both themes, toggle persists across navigation and login/logout.
