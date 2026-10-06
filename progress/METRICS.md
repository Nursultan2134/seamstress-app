# METRICS

V1 is a local MVP (no users yet), so metrics are build-health, not business metrics. Business metrics (orders/day, profit/order, employee throughput) become trackable once the app is in daily use at the workshop — revisit this file then.

## Build health (current)
- Milestones complete: 9 / 10 (M0–M8 done and verified in-browser; M9 polish pass remaining)
- `tsc --noEmit`: clean (checked after every milestone)
- Seeded demo data: created and verified (1 workshop, 8 process types, 9 employees, 1 sample order with mixed-status stages)

## Targets for "ready to use at the workshop"
- M0–M9 complete (see plan)
- Full click-through: PIN login → create order → worker starts/finishes stage → warehouse allocation → profit/salary numbers correct against hand calculation
