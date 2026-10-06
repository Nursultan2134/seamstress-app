"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

export async function startStage(stageId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Не авторизован");

  const stage = await prisma.orderStage.findUnique({ where: { id: stageId } });
  if (!stage) throw new Error("Этап не найден");
  if (stage.assignedEmployeeId !== session.employeeId) {
    throw new Error("Этот этап назначен другому сотруднику");
  }

  if (stage.sequenceOrder > 1) {
    const previous = await prisma.orderStage.findUnique({
      where: {
        orderId_sequenceOrder: {
          orderId: stage.orderId,
          sequenceOrder: stage.sequenceOrder - 1,
        },
      },
    });
    if (previous && previous.status !== "DONE") {
      throw new Error("Предыдущий этап не завершён");
    }
  }

  await prisma.orderStage.update({
    where: { id: stageId },
    data: { status: "IN_PROGRESS", startedAt: new Date() },
  });

  revalidatePath("/my-tasks");
}

export async function finishStage(stageId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Не авторизован");

  const stage = await prisma.orderStage.findUnique({
    where: { id: stageId },
    include: { processType: true },
  });
  if (!stage) throw new Error("Этап не найден");
  if (stage.assignedEmployeeId !== session.employeeId) {
    throw new Error("Этот этап назначен другому сотруднику");
  }

  const rateOverride = await prisma.employeeRate.findUnique({
    where: {
      employeeId_processTypeId: {
        employeeId: stage.assignedEmployeeId,
        processTypeId: stage.processTypeId,
      },
    },
  });
  const rateApplied = rateOverride?.rate ?? stage.processType.defaultRate;

  await prisma.$transaction([
    prisma.orderStage.update({
      where: { id: stageId },
      data: { status: "DONE", finishedAt: new Date() },
    }),
    prisma.productionEntry.create({
      data: {
        employeeId: stage.assignedEmployeeId,
        orderStageId: stageId,
        quantityCompleted: stage.quantity,
        rateApplied,
      },
    }),
  ]);

  revalidatePath("/my-tasks");
  revalidatePath("/my-stats");
}
