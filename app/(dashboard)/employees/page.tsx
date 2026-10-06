import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkshop } from "@/lib/workshop";
import { ROLE_LABELS } from "@/lib/role-labels";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function EmployeesPage() {
  const workshop = await getCurrentWorkshop();
  const employees = await prisma.employee.findMany({
    where: { workshopId: workshop.id },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Сотрудники</h1>
        <Link href="/employees/new">
          <Button>+ Новый сотрудник</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {employees.map((e) => (
          <Link key={e.id} href={`/employees/${e.id}`}>
            <Card className="flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{e.fullName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{ROLE_LABELS[e.role]}</p>
              </div>
              {!e.isActive && (
                <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  Неактивен
                </Badge>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
