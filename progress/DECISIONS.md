# DECISIONS

## 2026-10-06 — Stack & scope for V1

- **Stack**: Next.js (App Router, TypeScript) + Prisma + SQLite, local only, no deploy yet. Reason: fastest path to a clickable MVP on Windows dev machine; Prisma makes a later Postgres/Supabase migration cheap.
- **Employee auth**: 4-digit PIN (bcrypt-hashed), not email/password. Reason: shared tablet on the shop floor, workers need a 2-second login, not a credential flow.
- **Session**: custom signed httpOnly cookie (HMAC via Node `crypto`), no NextAuth/iron-session. Reason: only 3 fields needed (employeeId, role, workshopId), a library is unjustified weight.
- **V1 scope**: build only "workshop type 1" (order → process-stage pipeline, warehouse, payroll, analytics). "Workshop type 2" (product catalog / reusable cut templates) is deferred — reuses the same schema, adds `ProductTemplate` later.
- **Stage assignment**: every `OrderStage` is assigned to one specific employee, not broadcast to a role. Reason: directly implements "each employee sees only their own task" without extra claiming logic.
- **Money fields**: `Float`, not `Decimal` — Prisma's SQLite connector doesn't handle `Decimal` well. Accepted MVP precision tradeoff; convert on Postgres migration.
- **Full plan**: see `C:\Users\testuser\.claude\plans\pasted-content-id-c2db-1-mighty-emerson.md` for the complete schema, routes, and build-order (M0–M9).

## 2026-10-06 — Pinned Prisma to 6.19.3 (not latest)

`npm install prisma @prisma/client` (no version) resolved to `8.0.0-rc.20`, a release-candidate with a totally different cloud-platform CLI (`prisma deploy`, `prisma dev`, no `migrate dev`). Prisma 7.10.0 (latest stable) removed `datasource.url` from `schema.prisma` and requires a native `better-sqlite3` driver adapter + `prisma.config.ts` for any local SQLite client — adds native-build risk on Windows for zero MVP benefit. Pinned both `prisma` and `@prisma/client` to `6.19.3`, the last line with the classic built-in SQLite engine and `migrate dev`/`db seed`/`studio` CLI exactly as planned. Revisit this pin only when actually migrating off SQLite.

## 2026-10-06 — Renamed middleware.ts to proxy.ts

Next.js 16.3.8 (the version `create-next-app` installed) deprecated the `middleware.ts` file convention in favor of `proxy.ts` (same `NextRequest`/`NextResponse` API, just the exported function renamed `middleware` → `proxy`). Renamed immediately since this is a brand-new file with no reason to start on a deprecated convention. No behavior change.

## 2026-10-06 — Windows gotcha: stop the dev server before `prisma migrate`/`generate`

On Windows, `npx prisma migrate dev` / `prisma generate` fails with `EPERM: operation not permitted, rename ... query_engine-windows.dll.node` whenever `npm run dev` is still running, because Next.js has the query engine DLL loaded and locked. Fix: stop the dev server (find PID via `netstat -ano | grep :3000`, `taskkill //F //PID <pid>`), rerun the Prisma command, then restart `npm run dev`. Apply this every time a schema change is needed mid-session.
