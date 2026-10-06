import { prisma } from "@/lib/prisma";
import { getCurrentWorkshop } from "@/lib/workshop";
import { ROLE_LABELS } from "@/lib/role-labels";
import { StageFlowBuilder } from "@/components/stage-flow/StageFlowBuilder";

export default async function NewOrderPage() {
  const workshop = await getCurrentWorkshop();

  const [processTypes, employees] = await Promise.all([
    prisma.processType.findMany({
      where: { workshopId: workshop.id, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.employee.findMany({
      where: { workshopId: workshop.id, isActive: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">Новый заказ</h1>
      <StageFlowBuilder
        processTypes={processTypes.map((pt) => ({ id: pt.id, name: pt.name }))}
        employees={employees.map((e) => ({
          id: e.id,
          fullName: e.fullName,
          roleLabel: ROLE_LABELS[e.role],
        }))}
      />
    </div>
  );
}
