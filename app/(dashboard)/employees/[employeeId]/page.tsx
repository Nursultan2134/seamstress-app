import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkshop } from "@/lib/workshop";
import { ROLE_LABELS } from "@/lib/role-labels";
import { calculateEmployeeSalary } from "@/lib/payroll";
import {
  toggleEmployeeActive,
  resetEmployeePin,
  setEmployeeRate,
  addDayOff,
} from "@/lib/actions/employee-actions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SubmitButton } from "@/components/ui/SubmitButton";

const INPUT_CLASS =
  "rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ employeeId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { employeeId } = await params;
  const { error } = await searchParams;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { rates: { include: { processType: true } }, daysOff: { orderBy: { date: "desc" } } },
  });
  if (!employee) notFound();

  const workshop = await getCurrentWorkshop();
  const processTypes = await prisma.processType.findMany({
    where: { workshopId: workshop.id, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const { salary, totalUnits } = await calculateEmployeeSalary(employeeId, "month");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{employee.fullName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{ROLE_LABELS[employee.role]}</p>
        </div>
        <div className="flex items-center gap-3">
          {!employee.isActive && (
            <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              Неактивен
            </Badge>
          )}
          <form action={toggleEmployeeActive.bind(null, employee.id)}>
            <SubmitButton variant="secondary" pendingLabel="…">
              {employee.isActive ? "Деактивировать" : "Активировать"}
            </SubmitButton>
          </form>
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{salary.toFixed(0)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Зарплата за месяц (сом)</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalUnits}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Единиц сделано за месяц</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Сменить PIN</h2>
        <form action={resetEmployeePin} className="flex gap-2">
          <input type="hidden" name="employeeId" value={employee.id} />
          <input
            required
            name="pin"
            pattern="\d{4}"
            maxLength={4}
            placeholder="1234"
            className={`w-32 ${INPUT_CLASS}`}
          />
          <SubmitButton variant="secondary" pendingLabel="Сохраняем…">
            Сохранить
          </SubmitButton>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Ставки за этапы (сом/ед.)
        </h2>
        <div className="mb-4 flex flex-col gap-1 text-sm">
          {employee.rates.map((r) => (
            <div key={r.id} className="flex items-center justify-between">
              <span>{r.processType.name}</span>
              <span className="font-medium">{r.rate}</span>
            </div>
          ))}
        </div>
        <form
          action={setEmployeeRate}
          className="flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-700"
        >
          <input type="hidden" name="employeeId" value={employee.id} />
          <select name="processTypeId" required className={`flex-1 ${INPUT_CLASS}`}>
            {processTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name} (по умолчанию {pt.defaultRate})
              </option>
            ))}
          </select>
          <input
            required
            name="rate"
            type="number"
            min={0}
            step="0.01"
            placeholder="Ставка"
            className={`w-24 ${INPUT_CLASS}`}
          />
          <SubmitButton variant="secondary" pendingLabel="…">
            Задать
          </SubmitButton>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Выходные</h2>
        <div className="mb-4 flex flex-col gap-1 text-sm">
          {employee.daysOff.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Выходных пока не отмечено.</p>
          ) : (
            employee.daysOff.map((d) => (
              <div key={d.id} className="flex items-center justify-between">
                <span>{d.date.toLocaleDateString("ru-RU")}</span>
                <span className="text-gray-500 dark:text-gray-400">{d.reason}</span>
              </div>
            ))
          )}
        </div>
        <form
          action={addDayOff}
          className="flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-700"
        >
          <input type="hidden" name="employeeId" value={employee.id} />
          <input required name="date" type="date" className={INPUT_CLASS} />
          <input name="reason" placeholder="Причина" className={`flex-1 ${INPUT_CLASS}`} />
          <SubmitButton variant="secondary" pendingLabel="…">
            Добавить
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
