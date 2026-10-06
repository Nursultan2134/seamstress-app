import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export type Period = "day" | "week" | "month";

export function resolvePeriodRange(period: Period, reference: Date = new Date()) {
  switch (period) {
    case "day":
      return { from: startOfDay(reference), to: endOfDay(reference) };
    case "week":
      return {
        from: startOfWeek(reference, { weekStartsOn: 1 }),
        to: endOfWeek(reference, { weekStartsOn: 1 }),
      };
    case "month":
      return { from: startOfMonth(reference), to: endOfMonth(reference) };
  }
}

export function parsePeriod(value: string | undefined): Period {
  if (value === "day" || value === "week" || value === "month") return value;
  return "week";
}
