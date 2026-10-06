# STATUS

**Last updated**: 2026-10-06

## Current state
- Plan approved: `C:\Users\testuser\.claude\plans\pasted-content-id-c2db-1-mighty-emerson.md` (schema, routes, build order M0–M9).
- M0–M8 done and verified in-browser end-to-end: scaffold, DB schema/seed, PIN auth, order+stage creation, worker start/finish loop with payroll rate-snapshotting, warehouse allocation (incl. over-allocation rejection), profit panel (incl. mixed-currency handling), order pickup, `/my-stats` payroll by period, employees CRUD (rates/PIN/days-off), analytics (profit/throughput/ironer output), `/admin` workshop creation with data isolation confirmed (two workshops, independently scoped counts).
- Dev server runs via `npm run dev` (Turbopack, http://localhost:3000). Demo PINs: Айгуль(OWNER)=1111, Нурлан/Бек(MANAGER)=2222/3333, Данияр(CUTTER)=4444, Жанна/Айнура(SEWER)=5555/6666, Салтанат(QC)=7777, Эрлан(SHIPPER)=8888, Гүлнара(IRONER)=9999. Admin: `/admin`, password `admin123` (see `.env`).
- No git repo initialized yet.

## Blockers
- None.

## Next 3 actions
1. M9 — Polish: verify mobile-width rendering for real (browser automation's window resize didn't visually take effect in this session — recheck with actual device/DevTools), empty-state copy pass, final Russian text review.
2. Minor known issue: admin pages initially had a `mx-auto`+flex shrink-to-fit CSS bug — fixed by adding `w-full`; worth a quick grep for the same pattern (`mx-auto` without `w-full` inside a flex-item context) elsewhere if new pages are added.
3. V2 (not started): "2 вид цеха" — `ProductTemplate` model + cut-pattern picker reusing Order/OrderStage/WarehouseMaterial, per the plan's "Следующая итерация" section.
