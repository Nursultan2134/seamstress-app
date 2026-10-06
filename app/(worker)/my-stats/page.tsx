import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { calculateEmployeeSalary } from "@/lib/payroll";
import { parsePeriod, type Period } from "@/lib/date-range";
import { Card } from "@/components/ui/Card";

const TABS: { value: Period; label: string }[] = [
  { value: "day", label: "День" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
];

export default async function MyStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { period: rawPeriod } = await searchParams;
  const period = parsePeriod(rawPeriod);

  const { salary, totalUnits, daysOff, from, to } = await calculateEmployeeSalary(
    session.employeeId,
    period
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Моя статистика</h1>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/my-stats?period=${tab.value}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab.value === period
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "bg-white text-gray-600 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {from.toLocaleDateString("ru-RU")} – {to.toLocaleDateString("ru-RU")}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{salary.toFixed(0)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Моя зарплата (сом)</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalUnits}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Единиц сделано</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{daysOff}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Мои выходные</p>
        </Card>
      </div>
    </div>
  );
}
