import { prisma } from "@/lib/prisma";
import type { Period } from "@/lib/date-range";
import { resolvePeriodRange } from "@/lib/date-range";

export type EmployeeSalary = {
  salary: number;
  totalUnits: number;
  daysOff: number;
  from: Date;
  to: Date;
};

export async function calculateEmployeeSalary(
  employeeId: string,
  period: Period
): Promise<EmployeeSalary> {
  const { from, to } = resolvePeriodRange(period);

  const [entries, daysOff] = await Promise.all([
    prisma.productionEntry.findMany({
      where: { employeeId, date: { gte: from, lte: to } },
    }),
    prisma.dayOff.count({
      where: { employeeId, date: { gte: from, lte: to } },
    }),
  ]);

  let salary = 0;
  let totalUnits = 0;
  for (const entry of entries) {
    salary += entry.quantityCompleted * entry.rateApplied;
    totalUnits += entry.quantityCompleted;
  }

  return { salary, totalUnits, daysOff, from, to };
}
