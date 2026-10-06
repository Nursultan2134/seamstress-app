import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { startStage, finishStage } from "@/lib/actions/stage-actions";
import { STAGE_STATUS_CLASSES, STAGE_STATUS_LABELS } from "@/lib/stage-status";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function MyTasksPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const stages = await prisma.orderStage.findMany({
    where: { assignedEmployeeId: session.employeeId },
    include: { processType: true, order: true },
    orderBy: [{ order: { createdAt: "asc" } }, { sequenceOrder: "asc" }],
  });

  const active = stages.filter((s) => s.status !== "DONE");
  const done = stages.filter((s) => s.status === "DONE");

  const canStartMap = new Map<string, boolean>();
  for (const stage of active) {
    if (stage.status !== "PENDING") continue;
    if (stage.sequenceOrder === 1) {
      canStartMap.set(stage.id, true);
      continue;
    }
    const previous = await prisma.orderStage.findUnique({
      where: {
        orderId_sequenceOrder: { orderId: stage.orderId, sequenceOrder: stage.sequenceOrder - 1 },
      },
    });
    canStartMap.set(stage.id, previous?.status === "DONE");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Мои задачи</h1>

      {active.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Нет текущих задач.</p>
      )}

      <div className="flex flex-col gap-3">
        {active.map((stage) => {
          const canStart = canStartMap.get(stage.id) ?? false;
          return (
            <Card key={stage.id} className={`border-2 ${STAGE_STATUS_CLASSES[stage.status]}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {stage.order.orderNumber} — {stage.processType.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stage.quantity} шт
                    {stage.deadline && ` · срок: ${stage.deadline.toLocaleDateString("ru-RU")}`}
                  </p>
                  <p className="text-xs font-medium">{STAGE_STATUS_LABELS[stage.status]}</p>
                </div>
                {stage.status === "PENDING" && canStart && (
                  <form action={startStage.bind(null, stage.id)}>
                    <SubmitButton pendingLabel="Начинаем…">Начать</SubmitButton>
                  </form>
                )}
                {stage.status === "PENDING" && !canStart && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Ожидает предыдущий этап
                  </p>
                )}
                {stage.status === "IN_PROGRESS" && (
                  <form action={finishStage.bind(null, stage.id)}>
                    <SubmitButton pendingLabel="Завершаем…" variant="secondary">
                      Закончить
                    </SubmitButton>
                  </form>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {done.length > 0 && (
        <div className="mt-6 flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Выполненные</h2>
          {done.map((stage) => (
            <Card key={stage.id} className={`border-2 opacity-70 ${STAGE_STATUS_CLASSES[stage.status]}`}>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stage.order.orderNumber} — {stage.processType.name} · {stage.quantity} шт
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
